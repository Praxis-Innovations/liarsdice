/**
 * Pure responsive layout helpers for the hero dice stage.
 * Kept free of React / ThemeProvider so Jest can unit-test without RN native modules.
 */
import { getBreakpoint, type Breakpoint } from "../../lib/breakpoints";

export type { Breakpoint };
export { getBreakpoint };

export type PlatformMetrics = {
  /** Platform box in hero coordinates */
  left: number;
  top: number;
  width: number;
  height: number;
  /** Surface Y where dice bottoms should rest */
  surfaceTop: number;
};

export type DiceTableConfig = Pick<PlatformMetrics, "left" | "top" | "width" | "height" | "surfaceTop"> & {
  haloColor: string;
};

/** Responsive platform geometry for the hero. */
export function getPlatformMetrics(width: number, heroHeight: number): PlatformMetrics {
  const bp = getBreakpoint(width);

  if (bp === "phone") {
    const widthPad = 20;
    const platformWidth = Math.min(width - widthPad * 2, 380);
    const platformHeight = 64;
    const left = (width - platformWidth) / 2;
    const bottom = -10;
    const top = heroHeight - bottom - platformHeight;
    return {
      left,
      top,
      width: platformWidth,
      height: platformHeight,
      // Dice rest on the top lip of the tray (not sunk inside it)
      surfaceTop: top,
    };
  }

  if (bp === "tablet") {
    const platformWidth = Math.min(width * 0.72, 560);
    const platformHeight = 76;
    const left = (width - platformWidth) / 2;
    const bottom = 28;
    const top = heroHeight - bottom - platformHeight;
    return {
      left,
      top,
      width: platformWidth,
      height: platformHeight,
      surfaceTop: top,
    };
  }

  // Laptop / desktop — slightly right-biased so it sits under the dice stage
  const platformWidth = Math.min(width * 0.48, 640);
  const platformHeight = 88;
  const left = Math.max(width * 0.42, width - platformWidth - 48);
  const bottom = 18;
  const top = heroHeight - bottom - platformHeight;
  return {
    left,
    top,
    width: platformWidth,
    height: platformHeight,
    surfaceTop: top,
  };
}

/**
 * Dice count / size band. Sizes scale down with viewport width so the
 * desktop→tablet transition never packs oversized dice onto a shrinking tray.
 */
export function getDiceBand(
  bp: Breakpoint,
  width = 1200,
): { count: number; minSize: number; maxSize: number } {
  if (bp === "phone") {
    const maxSize = Math.round(Math.min(36, Math.max(26, width * 0.08)));
    return { count: 6, minSize: maxSize - 5, maxSize };
  }

  if (bp === "tablet") {
    const maxSize = Math.round(Math.min(42, Math.max(30, width * 0.048)));
    return { count: 6, minSize: maxSize - 6, maxSize };
  }

  // Laptop: ease from compact sizes near 1024px up to full size on wide screens.
  const t = Math.min(1, Math.max(0, (width - 1024) / 400));
  const maxSize = Math.round(46 + t * 18); // 46 → 64
  const minSize = Math.round(maxSize - 10);
  return { count: 6, minSize, maxSize };
}

/**
 * Place dice on one shared floor line (same bottom Y), while varying the
 * physical table-depth (Z) as well as X. The camera turns that Z spread into
 * a natural near/far scatter without violating gravity.
 */
export function placeDiceOnPlatform(
  metrics: PlatformMetrics,
  count: number,
  minSize: number,
  maxSize: number,
): { top: number; left: number; size: number; tableDepth: number }[] {
  const placed: { top: number; left: number; size: number; tableDepth: number }[] = [];
  const padX = 16;
  const usable = metrics.width - padX * 2;
  const slotW = usable / Math.max(1, count);
  // Keep a breathing gap between neighbors so depth scatter doesn't look crowded.
  const fitMax = Math.max(28, slotW * 0.72);
  const cappedMax = Math.min(maxSize, fitMax);
  const cappedMin = Math.min(minSize, cappedMax - 4);
  const depthRange = Math.min(48, Math.max(24, metrics.width * 0.08));

  for (let i = 0; i < count; i++) {
    const size = cappedMin + Math.random() * Math.max(0, cappedMax - cappedMin);
    const slotLeft = metrics.left + padX + i * slotW;
    const jitterX = (Math.random() - 0.5) * Math.min(10, slotW * 0.22);
    const left = Math.min(
      Math.max(slotLeft + (slotW - size) / 2 + jitterX, metrics.left + padX),
      metrics.left + metrics.width - padX - size,
    );
    // Shared floor: every die's bottom sits on surfaceTop
    const top = metrics.surfaceTop - size;
    // Alternate front/back rows with restrained jitter to avoid visual overlap.
    const row = i % 3 === 0 ? -0.72 : i % 3 === 1 ? 0.42 : -0.1;
    const tableDepth = row * depthRange + (Math.random() - 0.5) * 8;
    placed.push({ top, left, size, tableDepth });
  }

  return placed;
}
