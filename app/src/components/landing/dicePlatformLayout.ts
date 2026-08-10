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
  /** Width used for layout (never 0 — SSR / first-paint safe). */
  layoutWidth: number;
  heroHeight: number;
  /**
   * Dice platform. On laptop this is hero-absolute; on compact it is *local*
   * to the in-flow dice slot (surfaceTop ≈ die max size).
   */
  platform: PlatformMetrics;
  contentTopPad: number;
  contentBottomPad: number;
  /**
   * Compact flow layout: height of the column that ends at 80% of device
   * height (text centered above, dice slot pinned to its bottom).
   */
  flowBandHeight: number | null;
  /** Compact: height of the in-flow dice slot (die size + tray). */
  diceSlotHeight: number | null;
  justifyContent: "flex-start" | "center";
  /** Dice canvas extends this far above the hero to start behind the nav (laptop). */
  diceCanvasOffset: number;
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
  const left = Math.max(layoutWidth * 0.42, layoutWidth - width - 48);
  return { left, width, height: 88 };
}

/**
 * Hero + platform geometry from viewport percentages (screen-top based):
 * - Laptop: side-by-side absolute dice stage
 * - Phone/tablet: in-flow column — text centered above, dice slot at 80% device height
 */
export function getHeroStageMetrics(
  width: number,
  viewportHeight: number,
  headerOffset: number,
): HeroStageMetrics {
  const layoutWidth = resolveLayoutWidth(width);
  const bp = getBreakpoint(layoutWidth);
  const band = getDiceBand(bp, layoutWidth);
  const box = platformBox(layoutWidth, bp);
  const vh = viewportHeight > 0 ? viewportHeight : 900;
  const heroHeight = Math.max(vh - headerOffset, bp === "phone" ? 640 : 560);

  /** Convert a fraction of full screen height into hero-local Y. */
  const fromScreen = (frac: number) => frac * vh - headerOffset;

  if (bp === "laptop") {
    // Side-by-side: vertically center the copy, park dice on the text baseline
    // (bottom of the copy block) instead of mid-copy.
    const contentTopPad = 64;
    const contentBottomPad = 48;
    const copyBlock = 400; // badge → caption estimate
    const wrapperH = contentTopPad + copyBlock + contentBottomPad;
    // Match justifyContent:center — wrapper sits in the middle of the hero.
    const wrapperTop = Math.max(0, (heroHeight - wrapperH) / 2);
    const textBottom = wrapperTop + contentTopPad + copyBlock;
    // Drop a bit below the copy baseline so the tray clears the CTA/caption.
    const stageTop = Math.min(
      heroHeight - box.height - 20,
      Math.max(band.maxSize + 40, textBottom + 56),
    );
    return {
      bp,
      layoutWidth,
      heroHeight,
      platform: {
        left: box.left,
        top: stageTop,
        width: box.width,
        height: box.height,
        surfaceTop: stageTop,
      },
      contentTopPad,
      contentBottomPad,
      flowBandHeight: null,
      diceSlotHeight: null,
      justifyContent: "center",
      diceCanvasOffset: headerOffset,
    };
  }

  // Stacked mobile/tablet:
  //   Hero is full viewport-minus-header (not an 80%-tall box).
  //   Copy sits in the band above the landing line (mid ≈ 40% of device).
  //   Dice surface is at 80% of *device* height in hero coordinates.
  //   WebGL canvas is full-hero (plus nav offset) so the toss/camera match desktop.
  const surfaceTop = Math.max(band.maxSize + 48, fromScreen(0.8));
  const flowBandHeight = surfaceTop; // text column ends at the landing line
  const diceSlotHeight = band.maxSize + box.height;
  const platform: PlatformMetrics = {
    left: box.left,
    top: surfaceTop,
    width: box.width,
    height: box.height,
    surfaceTop,
  };

  return {
    bp,
    layoutWidth,
    heroHeight,
    platform,
    contentTopPad: 0,
    contentBottomPad: 0,
    flowBandHeight,
    diceSlotHeight,
    justifyContent: "flex-start",
    // Fall from behind the nav — same extended canvas as laptop.
    diceCanvasOffset: headerOffset,
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

  // Laptop: ease from compact sizes near 1024px up to full size on wide screens.
  const t = Math.min(1, Math.max(0, (width - 1024) / 400));
  const maxSize = Math.round(46 + t * 18); // 46 → 64
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
  // Keep a breathing gap between neighbors so depth scatter doesn't look crowded.
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
    // Shared floor: every die's bottom sits on surfaceTop
    const top = metrics.surfaceTop - size;
    // Alternate front/back rows with restrained jitter to avoid visual overlap.
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
      // Full hero + header so native/SVG fallback also starts above the navbar.
      throwDistance: heroHeight + headerOffset + 40 + rng() * 80,
      colorIndex: index % 3,
    };
  });
}
