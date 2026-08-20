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

export type HeroStageMetrics = {
  bp: Breakpoint;
  layoutWidth: number;
  heroHeight: number;
  platform: PlatformMetrics;
  /** Y where dice bottoms rest, in hero coordinates. */
  diceLineY: number;
};

/** Deterministic 0..1 RNG for stable hero dice across remounts. */
export type RNGFunction = () => number;

export function createSeededRng(seed: number): RNGFunction {
  let s = seed >>> 0;
  return () => {
    s = (Math.imul(s ^ (s >>> 15), 1 | s) + Math.imul(s ^ (s >>> 7), 61 | s)) >>> 0;
    return s / 4294967296;
  };
}

/**
 * Prefer a real viewport width; fall back to a phone default (375) so the
 * SSR/static first paint matches the mobile layout that most users and PSI see.
 */
export function resolveLayoutWidth(width: number): number {
  return width > 0 ? width : 375;
}

function platformBox(
  layoutWidth: number,
  bp: Breakpoint,
): { left: number; width: number; height: number } {
  if (bp === "phone") {
    const widthPad = 20;
    const width = Math.min(layoutWidth - widthPad * 2, 380);
    return { left: (layoutWidth - width) / 2, width, height: 64 };
  }
  if (bp === "tablet") {
    const width = Math.min(layoutWidth * 0.72, 560);
    return { left: (layoutWidth - width) / 2, width, height: 76 };
  }
  const width = Math.min(layoutWidth * 0.48, 640);
  return { left: (layoutWidth - width) / 2, width, height: 88 };
}

/**
 * Unified hero layout: centered content column on all breakpoints,
 * dice pinned near the bottom of the hero.
 */
export function getHeroStageMetrics(
  width: number,
  viewportHeight: number,
  headerOffset: number,
): HeroStageMetrics {
  const layoutWidth = resolveLayoutWidth(width);
  const bp = getBreakpoint(layoutWidth);
  const box = platformBox(layoutWidth, bp);
  const vh = viewportHeight > 0 ? viewportHeight : 900;
  const heroHeight = Math.max(vh - headerOffset, bp === "phone" ? 640 : 560);

  const bottomMargin = bp === "phone" ? 48 : bp === "tablet" ? 56 : 64;
  const diceLineY = heroHeight - bottomMargin;

  const platform: PlatformMetrics = {
    left: box.left,
    top: diceLineY,
    width: box.width,
    height: box.height,
    surfaceTop: diceLineY,
  };

  return {
    bp,
    layoutWidth,
    heroHeight,
    platform,
    diceLineY,
  };
}

/**
 * Responsive platform geometry for the hero.
 * Prefer `getHeroStageMetrics` for page layout.
 */
export function getPlatformMetrics(width: number, heroHeight: number = 800): PlatformMetrics {
  return getHeroStageMetrics(width, heroHeight + 64, 64).platform;
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

  const t = Math.min(1, Math.max(0, (width - 1024) / 400));
  const maxSize = Math.round(46 + t * 18);
  const minSize = Math.round(maxSize - 10);
  return { count: 6, minSize, maxSize };
}

export type PlacedDie = { top: number; left: number; size: number; tableDepth: number };

/**
 * Place dice on one shared floor line (same bottom Y), while varying the
 * physical table-depth (Z) as well as X. Pass a seeded RNG for stable layouts.
 */
export function placeDiceOnPlatform(
  metrics: PlatformMetrics,
  count: number,
  minSize: number,
  maxSize: number,
  rng: RNGFunction = Math.random,
): PlacedDie[] {
  const placed: PlacedDie[] = [];
  const padX = 16;
  const usable = metrics.width - padX * 2;
  const slotW = usable / Math.max(1, count);
  const fitMax = Math.max(28, slotW * 0.72);
  const cappedMax = Math.min(maxSize, fitMax);
  const cappedMin = Math.min(minSize, cappedMax - 4);
  const depthRange = Math.min(48, Math.max(24, metrics.width * 0.08));

  for (let i = 0; i < count; i++) {
    const size = cappedMin + rng() * Math.max(0, cappedMax - cappedMin);
    const slotLeft = metrics.left + padX + i * slotW;
    const jitterX = (rng() - 0.5) * Math.min(10, slotW * 0.22);
    const left = Math.min(
      Math.max(slotLeft + (slotW - size) / 2 + jitterX, metrics.left + padX),
      metrics.left + metrics.width - padX - size,
    );
    const top = metrics.surfaceTop - size;
    const row = i % 3 === 0 ? -0.72 : i % 3 === 1 ? 0.42 : -0.1;
    const tableDepth = row * depthRange + (rng() - 0.5) * 8;
    placed.push({ top, left, size, tableDepth });
  }

  return placed;
}

export type HeroDieSpec = {
  face: 1 | 2 | 3 | 4 | 5 | 6;
  size: number;
  top: number;
  left: number;
  tableDepth: number;
  restRotate: string;
  tossRotate: string;
  throwOffsetX: number;
  throwDistance: number;
  /** Palette slot 0..2 — mapped to theme colors in the component. */
  colorIndex: number;
};

/** Build a stable dice cast for the hero (positions + faces), seeded by layout. */
export function buildHeroDiceSpecs(
  platform: PlatformMetrics,
  band: { count: number; minSize: number; maxSize: number },
  heroHeight: number,
  headerOffset: number,
  seed: number,
): HeroDieSpec[] {
  const rng = createSeededRng(seed);
  const positions = placeDiceOnPlatform(platform, band.count, band.minSize, band.maxSize, rng);

  return positions.map((pos, index) => {
    const face = (Math.floor(rng() * 6) + 1) as HeroDieSpec["face"];
    const spins = Math.round(540 + rng() * 360) * (index % 2 === 0 ? 1 : -1);
    return {
      face,
      size: pos.size,
      top: pos.top,
      left: pos.left,
      tableDepth: pos.tableDepth,
      restRotate: "0deg",
      tossRotate: `${spins}deg`,
      throwOffsetX: -12 + rng() * 24,
      throwDistance: heroHeight + headerOffset + 40 + rng() * 80,
      colorIndex: index % 3,
    };
  });
}
