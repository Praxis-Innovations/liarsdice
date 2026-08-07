import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { useColorScheme } from "react-native";
import { RADII, SPACING, TYPOGRAPHY, ThemeColors, darkColors, lightColors } from "./tokens";

export type ThemeMode = "light" | "dark" | "system";

export const THEME_STORAGE_KEY = "@liarsdice/theme-mode";

type ThemeContextValue = {
  colors: ThemeColors;
  isDark: boolean;
  themeMode: ThemeMode;
  setThemeMode: (mode: ThemeMode) => void;
  toggleTheme: () => void;
  radii: typeof RADII;
  spacing: typeof SPACING;
  typography: typeof TYPOGRAPHY;
};

const ThemeContext = createContext<ThemeContextValue | null>(null);

export function resolveIsDark(mode: ThemeMode, systemScheme: string | null | undefined): boolean {
  if (mode === "system") return systemScheme === "dark";
  return mode === "dark";
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const liveColorScheme = useColorScheme();
  const [themeMode, setThemeModeState] = useState<ThemeMode>("system");
  const [storageReady, setStorageReady] = useState(false);

  // First render is always light to match static HTML (no browser preference at
  // build time). After mount we read the stored preference, then resolve.
  // Do not apply OS dark until storage has been consulted — otherwise a saved
  // "light" preference can flash dark for one frame.
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    let cancelled = false;
    AsyncStorage.getItem(THEME_STORAGE_KEY)
      .then((stored) => {
        if (cancelled) return;
        if (stored === "light" || stored === "dark" || stored === "system") {
          setThemeModeState(stored);
          setIsDark(resolveIsDark(stored, liveColorScheme));
        } else {
          setIsDark(resolveIsDark("system", liveColorScheme));
        }
      })
      .finally(() => {
        if (!cancelled) setStorageReady(true);
      });
    return () => {
      cancelled = true;
    };
    // Intentionally once on mount — live scheme changes are handled below.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!storageReady) return;
    if (themeMode === "system") {
      setIsDark(resolveIsDark("system", liveColorScheme));
    }
  }, [liveColorScheme, themeMode, storageReady]);

  const setThemeMode = useCallback(
    (mode: ThemeMode) => {
      setThemeModeState(mode);
      setIsDark(resolveIsDark(mode, liveColorScheme));
      void AsyncStorage.setItem(THEME_STORAGE_KEY, mode);
    },
    [liveColorScheme],
  );

  const toggleTheme = useCallback(() => {
    const next: ThemeMode = isDark ? "light" : "dark";
    setThemeMode(next);
  }, [isDark, setThemeMode]);

  const value = useMemo<ThemeContextValue>(
    () => ({
      colors: isDark ? darkColors : lightColors,
      isDark,
      themeMode,
      setThemeMode,
      toggleTheme,
      radii: RADII,
      spacing: SPACING,
      typography: TYPOGRAPHY,
    }),
    [isDark, themeMode, setThemeMode, toggleTheme],
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme must be used within a ThemeProvider");
  return ctx;
}
