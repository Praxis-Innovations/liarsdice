// Keep these values in sync with the `colors` block in tailwind.config.js —
// Tailwind config can't import TS at build time, so the palette is duplicated
// there for className usage and here for non-className consumers (SVG fills,
// StatusBar style, etc).
export const lightColors = {
  background: "#FFFBF3",
  surface: "#FFF3DE",
  surfaceRaised: "#FFFFFF",
  border: "#F0DFC0",
  textPrimary: "#1C1730",
  textSecondary: "#6B6478",
  primary: "#FF5A5F",
  primaryText: "#FFFFFF",
  secondary: "#00B894",
  secondaryText: "#FFFFFF",
  accent: "#FFC145",
  danger: "#D62839",
};

export const darkColors = {
  background: "#14101F",
  surface: "#1F1930",
  surfaceRaised: "#291F3D",
  border: "#352A4D",
  textPrimary: "#F7F2FF",
  textSecondary: "#B4A9CC",
  primary: "#FF7A7E",
  primaryText: "#1C1024",
  secondary: "#2DD4A7",
  secondaryText: "#0A241B",
  accent: "#FFD166",
  danger: "#FF5468",
};

export type ThemeColors = typeof lightColors;

export const RADII = {
  sm: 12,
  md: 16,
  lg: 24,
  xl: 32,
  pill: 999,
};

export const SPACING = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

export const TYPOGRAPHY = {
  display: { fontFamily: "Fredoka_700Bold", fontSize: 48, lineHeight: 54 },
  h1: { fontFamily: "Fredoka_700Bold", fontSize: 34, lineHeight: 40 },
  h2: { fontFamily: "Fredoka_600SemiBold", fontSize: 24, lineHeight: 30 },
  h3: { fontFamily: "Fredoka_600SemiBold", fontSize: 19, lineHeight: 25 },
  body: { fontFamily: "Manrope_400Regular", fontSize: 16, lineHeight: 24 },
  bodyMedium: { fontFamily: "Manrope_500Medium", fontSize: 16, lineHeight: 24 },
  bodySemibold: { fontFamily: "Manrope_600SemiBold", fontSize: 16, lineHeight: 24 },
  button: { fontFamily: "Manrope_700Bold", fontSize: 16, lineHeight: 20 },
  caption: { fontFamily: "Manrope_500Medium", fontSize: 13, lineHeight: 18 },
};
