import { useLayoutEffect, useState } from "react";
import { Platform, useWindowDimensions, type ScaledSize } from "react-native";

const SSR_SIZE: ScaledSize = { width: 0, height: 0, scale: 1, fontScale: 1 };

/**
 * Expo static export renders with width/height 0 (see `resolveLayoutWidth` → 1280).
 * On the client, `useWindowDimensions()` returns the real viewport on the *first*
 * paint, so Hero/Header/etc. emit a different tree than the SSR HTML and React
 * throws minified error #418 (hydration mismatch).
 *
 * First render matches SSR (0×0). `useLayoutEffect` then applies live dimensions
 * before the browser paints, avoiding a visible desktop→mobile flash.
 */
export function useHydrationSafeWindowDimensions(): ScaledSize {
  const live = useWindowDimensions();
  const [size, setSize] = useState<ScaledSize>(() =>
    Platform.OS === "web" ? SSR_SIZE : live,
  );

  useLayoutEffect(() => {
    if (Platform.OS !== "web") return;
    setSize(live);
  }, [live.height, live.scale, live.fontScale, live.width]);

  return Platform.OS === "web" ? size : live;
}
