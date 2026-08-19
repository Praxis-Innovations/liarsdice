import AsyncStorage from "@react-native-async-storage/async-storage";
import { Session } from "@heroiclabs/nakama-js";
import { usePathname } from "expo-router";
import React, { createContext, useCallback, useContext, useEffect, useState } from "react";
import { Platform } from "react-native";
import { nakamaClient } from "../lib/nakama";
import { clientPublicEnv } from "../config/env";

const SESSION_KEY = "liarsdice-nakama-session";
const DEVICE_ID_KEY = "liarsdice-device-id";

type GoogleSigninModule = typeof import("@react-native-google-signin/google-signin");

function requireGoogleSignin(): GoogleSigninModule | null {
  if (Platform.OS === "web") return null;
  try {
    return require("@react-native-google-signin/google-signin") as GoogleSigninModule;
  } catch {
    return null;
  }
}

interface AuthResult {
  error: string | null;
}

interface AuthContextValue {
  session: Session | null;
  /** Shim for components that read user.email — sourced from the Nakama account. */
  user: { email: string | null; id: string | null } | null;
  loading: boolean;
  accessToken: string | null;
  /** Always false for Nakama — no magic-link recovery flow. */
  isRecoveryFlow: boolean;
  signIn: (email: string, password: string) => Promise<AuthResult>;
  signUp: (email: string, password: string, displayName: string) => Promise<AuthResult>;
  signInWithGoogle: () => Promise<AuthResult>;
  signInWithApple: () => Promise<AuthResult>;
  signInAsGuest: () => Promise<AuthResult>;
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
  // expo-router's usePathname is used to match the previous lazy-init pattern; we now always
  // initialize immediately, but keep this import so existing layout references don't break.
  usePathname();

  const [session, setSession] = useState<Session | null>(null);
  const [email, setEmail] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const saveSession = useCallback(async (s: Session | null) => {
    if (!s) {
      await AsyncStorage.removeItem(SESSION_KEY);
    } else {
      await AsyncStorage.setItem(
        SESSION_KEY,
        JSON.stringify({ token: s.token, refresh_token: s.refresh_token }),
      );
    }
    setSession(s);
  }, []);

  const fetchEmail = useCallback(async (s: Session) => {
    try {
      const account = await nakamaClient.getAccount(s);
      setEmail(account.email ?? null);
    } catch {
      // Best-effort — email display is non-critical.
    }
  }, []);

  // Restore persisted session on startup.
  useEffect(() => {
    let cancelled = false;

    const restore = async () => {
      try {
        const raw = await AsyncStorage.getItem(SESSION_KEY);
        if (cancelled || !raw) return;

        const { token, refresh_token } = JSON.parse(raw) as {
          token: string;
          refresh_token: string;
        };

        let s = Session.restore(token, refresh_token);

        if (s.isexpired(Date.now() / 1000)) {
          if (s.isrefreshexpired(Date.now() / 1000)) {
            await AsyncStorage.removeItem(SESSION_KEY);
            return;
          }
          s = await nakamaClient.sessionRefresh(s);
          if (!cancelled) {
            await AsyncStorage.setItem(
              SESSION_KEY,
              JSON.stringify({ token: s.token, refresh_token: s.refresh_token }),
            );
          }
        }

        if (!cancelled) {
          setSession(s);
          void fetchEmail(s);
        }
      } catch {
        await AsyncStorage.removeItem(SESSION_KEY);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    void restore();
    return () => {
      cancelled = true;
    };
  }, [fetchEmail]);

  const afterAuth = useCallback(
    async (s: Session) => {
      await saveSession(s);
      void fetchEmail(s);
    },
    [saveSession, fetchEmail],
  );

  const signIn = useCallback(
    async (emailVal: string, password: string): Promise<AuthResult> => {
      try {
        const s = await nakamaClient.authenticateEmail(emailVal.trim(), password, false);
        await afterAuth(s);
        return { error: null };
      } catch (err) {
        return { error: parseNakamaError(err) };
      }
    },
    [afterAuth],
  );

  const signUp = useCallback(
    async (emailVal: string, password: string, displayName: string): Promise<AuthResult> => {
      const trimmed = displayName.trim();
      if (!trimmed) return { error: "Display name is required" };
      try {
        const username = `player_${Date.now().toString(36)}`;
        const s = await nakamaClient.authenticateEmail(emailVal.trim(), password, true, username);
        await afterAuth(s);
        await nakamaClient.updateAccount(s, { display_name: trimmed });
        return { error: null };
      } catch (err) {
        return { error: parseNakamaError(err) };
      }
    },
    [afterAuth],
  );

  const signInWithGoogle = useCallback(async (): Promise<AuthResult> => {
    if (Platform.OS === "web") {
      return {
        error:
          "Google sign-in on web requires additional server configuration. Please sign in with email/password.",
      };
    }

    const googleModule = requireGoogleSignin();
    if (!googleModule) return { error: "Google Sign-In isn't available in this build." };
    const { GoogleSignin, isErrorWithCode, isSuccessResponse, statusCodes } = googleModule;

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
      const idToken = response.data.idToken;
      if (!idToken) return { error: "Google sign-in did not return a token. Please try again." };

      const s = await nakamaClient.authenticateGoogle(idToken, true);
      await afterAuth(s);
      return { error: null };
    } catch (err) {
      if (isErrorWithCode(err) && err.code === statusCodes.SIGN_IN_CANCELLED) return { error: null };
      return { error: err instanceof Error ? err.message : "Google sign-in failed. Please try again." };
    }
  }, [afterAuth]);

  const signInWithApple = useCallback(async (): Promise<AuthResult> => {
    if (Platform.OS !== "ios") {
      return { error: "Sign in with Apple isn't available on this device." };
    }

    try {
      const AppleAuthentication = await import("expo-apple-authentication");
      const credential = await AppleAuthentication.signInAsync({
        requestedScopes: [
          AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
          AppleAuthentication.AppleAuthenticationScope.EMAIL,
        ],
      });
      if (!credential.identityToken) {
        return { error: "Apple sign-in did not return a token. Please try again." };
      }

      const s = await nakamaClient.authenticateApple(credential.identityToken, true);
      await afterAuth(s);
      return { error: null };
    } catch (err) {
      const code = (err as { code?: string } | null)?.code;
      if (code === "ERR_REQUEST_CANCELED") return { error: null };
      return { error: err instanceof Error ? err.message : "Apple sign-in failed. Please try again." };
    }
  }, [afterAuth]);

  const signInAsGuest = useCallback(async (): Promise<AuthResult> => {
    try {
      let deviceId = await AsyncStorage.getItem(DEVICE_ID_KEY);
      if (!deviceId) {
        deviceId = `${Math.random().toString(36).slice(2)}-${Date.now().toString(36)}`;
        await AsyncStorage.setItem(DEVICE_ID_KEY, deviceId);
      }
      const guestUsername = `guest_${deviceId.slice(-8)}`;
      const s = await nakamaClient.authenticateDevice(deviceId, true, guestUsername);
      await saveSession(s);
      return { error: null };
    } catch (err) {
      return { error: parseNakamaError(err) };
    }
  }, [saveSession]);

  const resetPasswordForEmail = useCallback(async (_emailVal: string): Promise<AuthResult> => {
    // Password reset via email requires a custom Nakama runtime RPC + email service.
    // This will be implemented in a future phase.
    return {
      error: "Password reset is not yet available. Please contact support if you've forgotten your password.",
    };
  }, []);

  const signOut = useCallback(async () => {
    if (session) {
      try {
        await nakamaClient.sessionLogout(session, session.token, session.refresh_token);
      } catch {
        // Best-effort.
      }
      const googleModule = requireGoogleSignin();
      if (googleModule) {
        try {
          await googleModule.GoogleSignin.signOut();
        } catch {}
      }
    }
    await saveSession(null);
    setEmail(null);
  }, [session, saveSession]);

  const value: AuthContextValue = {
    session,
    user: session ? { email, id: session.user_id ?? null } : null,
    loading,
    accessToken: session?.token ?? null,
    isRecoveryFlow: false,
    signIn,
    signUp,
    signInWithGoogle,
    signInWithApple,
    signInAsGuest,
    resetPasswordForEmail,
    signOut,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

function parseNakamaError(err: unknown): string {
  if (!(err instanceof Error)) return "An unexpected error occurred.";
  const msg = err.message;
  try {
    const body = JSON.parse(msg) as { message?: string };
    if (body.message) return body.message;
  } catch {}
  if (msg.includes("401") || msg.toLowerCase().includes("invalid credentials")) {
    return "Invalid email or password.";
  }
  if (msg.toLowerCase().includes("already exists") || msg.toLowerCase().includes("already in use")) {
    return "An account with this email already exists.";
  }
  return msg || "An unexpected error occurred.";
}
