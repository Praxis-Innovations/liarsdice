/** @type {import('tailwindcss').Config} */
module.exports = {
  // "class": required on web — NativeWind/css-interop throws if anything calls
  // colorScheme.set() while darkMode is "media" (Expo can hit that path when
  // the stylesheet injects after the runtime boots). ThemeProvider toggles the
  // `dark` class on <html>. Themed UI still uses useTheme().colors inline;
  // do not drive brand colors through `dark:` utilities.
  darkMode: "class",
  content: ["./app/**/*.{js,jsx,ts,tsx}", "./src/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      // Color is intentionally NOT driven through Tailwind/NativeWind className
      // utilities: this app's light/dark colors come from `src/theme` (the
      // ThemeProvider) applied via inline `style`, since that's the single
      // source of truth already computing the right palette for the active
      // scheme. Nesting a `dark` shade here would NOT auto-switch with dark
      // mode (that requires hand-written `dark:` variants on every className),
      // so avoid adding color utilities here — use `useTheme().colors` instead.
      fontFamily: {
        display: ["Fredoka_700Bold"],
        "display-semibold": ["Fredoka_600SemiBold"],
        "display-medium": ["Fredoka_500Medium"],
        body: ["Manrope_400Regular"],
        "body-medium": ["Manrope_500Medium"],
        "body-semibold": ["Manrope_600SemiBold"],
        "body-bold": ["Manrope_700Bold"],
      },
      borderRadius: {
        sm: "12px",
        md: "16px",
        lg: "24px",
        xl: "32px",
      },
      keyframes: {
        "content-card-enter": {
          "0%": { opacity: "0", transform: "translateY(8px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "modal-pop-in": {
          "0%": { opacity: "0", transform: "scale(0.9)" },
          "100%": { opacity: "1", transform: "scale(1)" },
        },
        "fade-drop-in": {
          "0%": { opacity: "0", transform: "translateY(-10px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "fade-rise-in": {
          "0%": { opacity: "0", transform: "translateY(10px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "fade-drop-in-sm": {
          "0%": { opacity: "0", transform: "translateY(-8px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
      },
      animation: {
        "content-card-enter": "content-card-enter 400ms ease-out both",
        "modal-pop-in": "modal-pop-in 300ms ease-out both",
        "fade-drop-in": "fade-drop-in 300ms ease-out both",
        "fade-rise-in": "fade-rise-in 220ms ease-out both",
        "fade-drop-in-sm": "fade-drop-in-sm 220ms ease-out both",
        "fade-rise-in-sm": "content-card-enter 220ms ease-out both",
      },
    },
  },
  plugins: [],
};
