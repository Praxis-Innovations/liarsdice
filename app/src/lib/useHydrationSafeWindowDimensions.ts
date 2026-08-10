import { useLayoutEffect, useState } from "react";
import { Platform, useWindowDimensions, type ScaledSize } from "react-native";

const SSR_SIZE: ScaledSize = { width: 0, height: 0, scale: 1, fontScale: 1 };

/**
 * Read viewport dimensions stamped by the blocking <script> in +html.tsx.
 * On the server (SSG) or if the script hasn't run, falls back to SSR_SIZE.
 */
function getInitialSize(): ScaledSize {
  if (Platform.OS !== "web" || typeof document === "undefined") {
    return SSR_SIZE;
  }
  const root = document.documentElement;
  const w = parseInt(root.getAttribute("data-vw") || "0", 10);
  const h = parseInt(root.getAttribute("data-vh") || "0", 10);
  if (w > 0 && h > 0) {
    return { width: w, height: h, scale: 1, fontScale: 1 };
  }
  return SSR_SIZE;
}

/**
 * Hydration-safe viewport dimensions for web.
 *
 * A blocking script in +html.tsx stamps data-vw/data-vh on <html> before
 * React mounts. The initial useState reads those so the first render
 * matches the real viewport — no two-phase layout shift (CLS).
 * useLayoutEffect keeps dimensions live on resize.
 */
export function useHydrationSafeWindowDimensions(): ScaledSize {
  const live = useWindowDimensions();
  const [size, setSize] = useState<ScaledSize>(() =>
    Platform.OS === "web" ? getInitialSize() : live,
  );

  useLayoutEffect(() => {
    if (Platform.OS !== "web") return;
    setSize(live);
  }, [live.height, live.scale, live.fontScale, live.width]);

  return Platform.OS === "web" ? size : live;
}
