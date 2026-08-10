import { useLayoutEffect, useState } from "react";
import { Platform, useWindowDimensions, type ScaledSize } from "react-native";

const SSR_SIZE: ScaledSize = { width: 0, height: 0, scale: 1, fontScale: 1 };

/**
 * Hydration-safe viewport dimensions for web.
 *
 * Initial render always uses SSR_SIZE so the client tree matches the static
 * export (which also rendered with width=0/height=0). useLayoutEffect then
 * updates to the real viewport dimensions synchronously before the browser
 * paints, so the user never sees the SSR fallback layout.
 *
 * This prevents React Error #418 (hydration mismatch → full client re-render).
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
