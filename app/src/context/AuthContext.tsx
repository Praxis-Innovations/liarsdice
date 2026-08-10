import type { AuthChangeEvent, Session, SupabaseClient, User } from "@supabase/supabase-js";
import { usePathname } from "expo-router";
import React, { createContext, useCallback, useContext, useEffect, useState } from "react";
import { Platform } from "react-native";
import { clientPublicEnv } from "../config/env";
import { getOAuthRedirectUrl, getResetPasswordRedirectUrl } from "../lib/webPaths";

/**
 * `@react-native-google-signin/google-signin` calls a native module getter at import time,
 * which throws immediately on web (no native module registered there). Require it lazily,
 * only on native platforms.
 */
type GoogleSigninModule = typeof import("@react-native-google-signin/google-signin");

function requireGoogleSignin(): GoogleSigninModule | null {
  if (Platform.OS === "web") return null;
  try {
    return require("@react-native-google-signin/google-signin") as GoogleSigninModule;
  } catch {
    return null;
  }
}

/** Routes that need a live Supabase client. Marketing pages skip the download. */
const AUTH_ROUTE_PREFIXES = [
  "/sign-in",
  "/sign-up",
  "/forgot-password",
  "/reset-password",
  "/home",
  "/profile",
];

function urlNeedsAuthClient(pathname: string): boolean {
  if (Platform.OS !== "web") return true;
  if (AUTH_ROUTE_PREFIXES.some((p) => pathname === p || pathname.startsWith(`${p}/`))) {
    return true;
  }
  if (typeof window !== "undefined") {
    const hash = window.location.hash;
    // OAuth / recovery redirects land on `/` with tokens in the hash.
    if (
      hash.includes("access_token") ||
      hash.includes("refresh_token") ||
      hash.includes("type=recovery")
    ) {
      return true;
    }
  }
  return false;
}

async function loadSupabase(): Promise<SupabaseClient | null> {
  const { supabase } = await import("../lib/supabase");
  return supabase;
}

interface AuthResult {
  error: string | null;
}

interface AuthContextValue {
  session: Session | null;
  user: User | null;
  loading: boolean;
  accessToken: string | null;
  isRecoveryFlow: boolean;
  signIn: (email: string, password: string) => Promise<AuthResult>;
  signUp: (email: string, password: string, displayName: string) => Promise<AuthResult>;
  signInWithGoogle: () => Promise<AuthResult>;
  signInWithApple: () => Promise<AuthResult>;
  resetPasswordForEmail: (email: string) => Promise<AuthResult>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}

interface AuthProviderProps {
  children: React.ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const pathname = usePathname();
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [isRecoveryFlow, setIsRecoveryFlow] = useState(false);
  const needsClient = urlNeedsAuthClient(pathname);

  useEffect(() => {
    if (!needsClient) {
      setLoading(false);
      return;
    }

    // Re-entering an auth route from marketing must block gates until getSession
    // finishes — otherwise (app)/_layout sees loading=false + session=null and
    // redirects to sign-in even when a persisted session exists.
    setLoading(true);

    let cancelled = false;
    let unsubscribe: (() => void) | undefined;

    void loadSupabase().then((supabase) => {
      if (cancelled) return;
      if (!supabase) {
        setLoading(false);
        return;
      }

      supabase.auth.getSession().then(({ data }) => {
        if (cancelled) return;
        setSession(data.session);
        setLoading(false);
      });

      const {
        data: { subscription },
      } = supabase.auth.onAuthStateChange((event: AuthChangeEvent, newSession) => {
        if (event === "PASSWORD_RECOVERY") setIsRecoveryFlow(true);
        if (event === "SIGNED_OUT") {
          setSession(null);
          setIsRecoveryFlow(false);
          return;
        }
        setSession(newSession);
      });
      unsubscribe = () => subscription.unsubscribe();
    });

    return () => {
      cancelled = true;
      unsubscribe?.();
    };
  }, [needsClient]);

  const signIn = useCallback(async (email: string, password: string): Promise<AuthResult> => {
    const supabase = await loadSupabase();
    if (!supabase) return { error: "Auth not configured" };
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    return { error: error?.message ?? null };
  }, []);

  const signUp = useCallback(async (email: string, password: string, displayName: string): Promise<AuthResult> => {
    const supabase = await loadSupabase();
    if (!supabase) return { error: "Auth not configured" };
    const trimmed_name = displayName.trim();
    if (!trimmed_name) return { error: "Display name is required" };
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { display_name: trimmed_name } },
    });
    if (!error && data?.session) setSession(data.session);
    return { error: error?.message ?? null };
  }, []);

  const signInWithGoogle = useCallback(async (): Promise<AuthResult> => {
    const supabase = await loadSupabase();
    if (!supabase) return { error: "Auth not configured" };

    if (Platform.OS === "web") {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: { redirectTo: getOAuthRedirectUrl() },
      });
      // Redirects the browser away; the session arrives later via onAuthStateChange once the
      // page reloads after the redirect completes.
      return { error: error?.message ?? null };
    }

    const google_signin_module = requireGoogleSignin();
    if (!google_signin_module) return { error: "Google Sign-In isn't available in this build." };
    const { GoogleSignin, isErrorWithCode, isSuccessResponse, statusCodes } = google_signin_module;

    try {
      GoogleSignin.configure({
        webClientId: clientPublicEnv.googleWebClientId,
        iosClientId: clientPublicEnv.googleIosClientId || undefined,
      });
      if (Platform.OS === "android") {
        await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });
      }
      const response = await GoogleSignin.signIn();
      if (!isSuccessResponse(response)) return { error: null };
      const id_token = response.data.idToken;
      if (!id_token) return { error: "Google sign-in did not return a token. Please try again." };

      // The native Google SDK generates its own internal nonce embedded in the idToken, which
      // can't be reproduced client-side, so "skip nonce checks" is enabled for Google in
      // supabase/config.toml and we don't pass a nonce here.
      const { error } = await supabase.auth.signInWithIdToken({ provider: "google", token: id_token });
      return { error: error?.message ?? null };
    } catch (err) {
      if (isErrorWithCode(err) && err.code === statusCodes.SIGN_IN_CANCELLED) return { error: null };
      return { error: err instanceof Error ? err.message : "Google sign-in failed. Please try again." };
    }
  }, []);

  const signInWithApple = useCallback(async (): Promise<AuthResult> => {
    const supabase = await loadSupabase();
    if (!supabase) return { error: "Auth not configured" };

    if (Platform.OS === "web") {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "apple",
        options: { redirectTo: getOAuthRedirectUrl() },
      });
      return { error: error?.message ?? null };
    }

    if (Platform.OS !== "ios") return { error: "Sign in with Apple isn't available on this device." };

    try {
      // Lazy-load native-only modules so web marketing routes don't pay for them.
      const Crypto = await import("expo-crypto");
      const AppleAuthentication = await import("expo-apple-authentication");
      // Supabase requires the *raw* nonce here, but the *hashed* (SHA-256) nonce when asking
      // Apple to sign in — Apple's identityToken embeds the hash, and Supabase re-hashes the
      // raw nonce server-side to compare against it. Do not swap these.
      const raw_nonce = Crypto.randomUUID();
      const hashed_nonce = await Crypto.digestStringAsync(Crypto.CryptoDigestAlgorithm.SHA256, raw_nonce);
      const credential = await AppleAuthentication.signInAsync({
        requestedScopes: [
          AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
          AppleAuthentication.AppleAuthenticationScope.EMAIL,
        ],
        nonce: hashed_nonce,
      });
      if (!credential.identityToken) return { error: "Apple sign-in did not return a token. Please try again." };

      const { error } = await supabase.auth.signInWithIdToken({
        provider: "apple",
        token: credential.identityToken,
        nonce: raw_nonce,
      });
      return { error: error?.message ?? null };
    } catch (err) {
      const code = (err as { code?: string } | null)?.code;
      if (code === "ERR_REQUEST_CANCELED") return { error: null };
      return { error: err instanceof Error ? err.message : "Apple sign-in failed. Please try again." };
    }
  }, []);

  const resetPasswordForEmail = useCallback(async (email: string): Promise<AuthResult> => {
    const supabase = await loadSupabase();
    if (!supabase) return { error: "Auth not configured" };
    const trimmed = email.trim().toLowerCase();
    if (!trimmed) return { error: "Enter your email" };
    const { error } = await supabase.auth.resetPasswordForEmail(trimmed, {
      redirectTo: getResetPasswordRedirectUrl(),
    });
    return { error: error?.message ?? null };
  }, []);

  const signOut = useCallback(async () => {
    const googleModule = requireGoogleSignin();
    if (googleModule) {
      try {
        await googleModule.GoogleSignin.signOut();
      } catch {
        // Best-effort: ignore failures clearing the cached Google account.
      }
    }
    const supabase = await loadSupabase();
    if (supabase) await supabase.auth.signOut();
  }, []);

  const value: AuthContextValue = {
    session,
    user: session?.user ?? null,
    loading,
    accessToken: session?.access_token ?? null,
    isRecoveryFlow,
    signIn,
    signUp,
    signInWithGoogle,
    signInWithApple,
    resetPasswordForEmail,
    signOut,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
