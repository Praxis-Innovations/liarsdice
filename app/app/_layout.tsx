import "../global.css";
import { useFonts } from "expo-font";
import Head from "expo-router/head";
import { Stack, usePathname } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { StatusBar } from "expo-status-bar";
import React, { Suspense, lazy, useEffect } from "react";
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

function RootInner() {
  const pathname = usePathname();
  const { isDark, colors } = useTheme();
  const showHeader = !AUTH_PREFIXES.some((p) => pathname.startsWith(p));
  const onPlayRoute = pathname === "/play";

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <Head>
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
      </Head>
      {showHeader && <Header />}
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { flex: 1, backgroundColor: colors.background },
        }}
      />
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

  // Never block first paint on web fonts — LCP dies if we return null here.
  // Native still waits briefly so splash covers the swap. Web paints with a
  // system fallback first; inject-seo sets font-display:swap so Fredoka/Manrope
  // replace it once the TTFs finish (never font-display:optional — that sticks
  // on the fallback for the whole page load when fonts miss ~100ms).
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
