import { Platform } from "react-native";

/**
 * RN Animated has no native driver on web. Expo Router / screens still pass
 * `useNativeDriver: true` and RN logs a one-time console.warn that looks like
 * a failure. Filter only that known message — leave real warnings alone.
 */
export function silenceWebConsoleNoise() {
  if (Platform.OS !== "web" || typeof console === "undefined") return;

  const warn = console.warn.bind(console);
  console.warn = (...args: unknown[]) => {
    const first = args[0];
    if (
      typeof first === "string" &&
      first.includes("useNativeDriver") &&
      first.includes("native animated module is missing")
    ) {
      return;
    }
    warn(...args);
  };
}
