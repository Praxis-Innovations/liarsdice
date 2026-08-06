import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import { useColorScheme } from "react-native";
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
  const liveColorScheme = useColorScheme();

  // This is a static export with no real server, so the pre-built HTML always
  // bakes in the light theme (no browser to read a real preference at build
  // time). If the very first CLIENT render read the OS preference directly it
  // would often disagree with that static HTML, and relying on React to patch
  // up the resulting hydration mismatch is a real race in practice: on some
  // routes/viewports the mismatch is large enough that React defers the fix to
  // an async recovery pass, which can still be pending when the page is first
  // interactive. So instead, first render deliberately mirrors the static
  // HTML (light, matching exactly => no mismatch at all), and only after
  // mount (guaranteed post-hydration) do we switch to the real scheme, via a
  // plain client-side re-render rather than a hydration patch.
  const [isDark, setIsDark] = useState(false);
  useEffect(() => {
    setIsDark(liveColorScheme === "dark");
  }, [liveColorScheme]);

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
