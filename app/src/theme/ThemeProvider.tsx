import { useColorScheme } from "nativewind";
import React, { createContext, useContext, useMemo } from "react";
import { RADII, SPACING, TYPOGRAPHY, ThemeColors, darkColors, lightColors } from "./tokens";

type ThemeContextValue = {
  colors: ThemeColors;
  isDark: boolean;
  radii: typeof RADII;
  spacing: typeof SPACING;
  typography: typeof TYPOGRAPHY;
};

const ThemeContext = createContext<ThemeContextValue | null>(null);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  // NativeWind syncs this with the OS scheme by default (app.json sets
  // userInterfaceStyle: "automatic"), so this is the single source of truth
  // that both `dark:` className utilities and this context read from.
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === "dark";

  const value = useMemo<ThemeContextValue>(
    () => ({
      colors: isDark ? darkColors : lightColors,
      isDark,
      radii: RADII,
      spacing: SPACING,
      typography: TYPOGRAPHY,
    }),
    [isDark],
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme must be used within a ThemeProvider");
  return ctx;
}
