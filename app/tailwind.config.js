/** @type {import('tailwindcss').Config} */
module.exports = {
  // "media": follow the OS/browser color-scheme preference automatically
  // (matches app.json's userInterfaceStyle: "automatic"). NativeWind's
  // colorScheme only falls back to the system Appearance value when darkMode
  // is "media" — "class" instead pins to a manually-toggled class and never
  // auto-syncs, which silently breaks dark mode since this app has no manual
  // toggle UI. Don't switch this to "class" without adding one.
  darkMode: "media",
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
    },
  },
  plugins: [],
};
