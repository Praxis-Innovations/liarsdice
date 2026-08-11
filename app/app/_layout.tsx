import "../global.css";
import { useFonts } from "expo-font";
import Head from "expo-router/head";
import { Stack, usePathname } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { StatusBar } from "expo-status-bar";
import { DarkTheme, DefaultTheme, ThemeProvider as NavigationThemeProvider } from "@react-navigation/native";
import React, { Suspense, lazy, useEffect, useLayoutEffect, useMemo } from "react";
import { Platform, View } from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { Header } from "../src/components/shared/Header";
import { AuthProvider } from "../src/context/AuthContext";
import { silenceWebConsoleNoise } from "../src/lib/silenceWebConsoleNoise";
import { fontsToLoad } from "../src/theme/fonts";
import { ThemeProvider, useTheme } from "../src/theme/ThemeProvider";

silenceWebConsoleNoise();
SplashScreen.preventAutoHideAsync().catch(() => {});

const AUTH_PREFIXES = ["/sign-in", "/sign-up", "/forgot-password", "/reset-password", "/home", "/profile"];

/** Game/tutorial code stays out of the marketing-route critical path. */
const TutorialHost = lazy(() =>
  import("../src/components/tutorial/TutorialHost").then((m) => ({ default: m.TutorialHost })),
);

function markAppReady() {
  if (Platform.OS !== "web" || typeof document === "undefined") return;
  document.documentElement.setAttribute("data-app-ready", "1");
}

function RootInner() {
  const pathname = usePathname();
  const { isDark, colors } = useTheme();
  const showHeader = !AUTH_PREFIXES.some((p) => pathname.startsWith(p));
  const onPlayRoute = pathname === "/play";
  const navigationTheme = useMemo(() => {
    const baseTheme = isDark ? DarkTheme : DefaultTheme;

    return {
      ...baseTheme,
      colors: {
        ...baseTheme.colors,
        background: colors.background,
        card: colors.surfaceRaised,
        text: colors.textPrimary,
        border: colors.border,
      },
    };
  }, [colors, isDark]);

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <Head>
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
      </Head>
      {showHeader && <Header />}
      <NavigationThemeProvider value={navigationTheme}>
        <Stack
          screenOptions={{
            headerShown: false,
            contentStyle: { flex: 1, backgroundColor: "transparent" },
          }}
        />
      </NavigationThemeProvider>
      {onPlayRoute ? (
        <Suspense fallback={null}>
          <TutorialHost />
        </Suspense>
      ) : null}
      <StatusBar style={isDark ? "light" : "dark"} />
    </View>
  );
}

export default function RootLayout() {
  const [fontsLoaded, fontError] = useFonts(fontsToLoad);

  useEffect(() => {
    if (fontsLoaded || fontError) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded, fontError]);

  // Web: body stays opacity:0 (see +html.tsx) until fonts resolve, then reveal.
  // React has already painted with real viewport from data-vw, so the reveal
  // skips the phone-SSR → desktop flash. No artificial delay — show ASAP.
  useLayoutEffect(() => {
    if (Platform.OS !== "web") return;
    if (fontsLoaded || fontError) markAppReady();
  }, [fontsLoaded, fontError]);

  if (Platform.OS !== "web" && !fontsLoaded && !fontError) {
    return null;
  }

  return (
    <SafeAreaProvider>
      <ThemeProvider>
        <AuthProvider>
          <RootInner />
        </AuthProvider>
      </ThemeProvider>
    </SafeAreaProvider>
  );
}
