import "../global.css";
import { useFonts } from "expo-font";
import Head from "expo-router/head";
import { Stack, usePathname } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { StatusBar } from "expo-status-bar";
import { useEffect } from "react";
import { View } from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { Header } from "../src/components/shared/Header";
import { AuthProvider } from "../src/context/AuthContext";
import { fontsToLoad } from "../src/theme/fonts";
import { ThemeProvider, useTheme } from "../src/theme/ThemeProvider";

SplashScreen.preventAutoHideAsync().catch(() => {});

const AUTH_PREFIXES = ["/sign-in", "/sign-up", "/forgot-password", "/reset-password", "/home", "/profile"];

function RootInner() {
  const pathname = usePathname();
  const { isDark } = useTheme();
  const showHeader = !AUTH_PREFIXES.some((p) => pathname.startsWith(p));

  return (
    <View style={{ flex: 1 }}>
      <Head>
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
      </Head>
      {showHeader && <Header />}
      <Stack screenOptions={{ headerShown: false }} />
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

  if (!fontsLoaded && !fontError) {
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
