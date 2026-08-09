/**
 * Pure layout helpers for seats around the play table.
 * Felt fills most of the arena; seats sit on the oval rim.
 */

import { DICE_PER_PLAYER } from "../../engine/constants";

/** Phone stays tight; tablet/desktop use larger seat + dock chrome. */
export type PlaySizeTier = "compact" | "regular" | "roomy";

export type SeatLayout = {
  x: number;
  y: number;
  width: number;
  height: number;
  dieSize: number;
  playerIndex: number;
  isHuman: boolean;
  diceColumns: number;
};

/** Seats plus the felt oval they were placed against (already margin-balanced). */
export type TableLayout = {
  seats: SeatLayout[];
  felt: FeltBounds | null;
};

export type FeltBounds = {
  x: number;
  y: number;
  width: number;
  height: number;
  cx: number;
  cy: number;
  rx: number;
  ry: number;
};

export type TableSeatingOptions = {
  maxDieSize?: number;
  minDieSize?: number;
  padding?: number;
  maxDice?: number;
  minGap?: number;
  minSeatWidth?: number;
  sizeTier?: PlaySizeTier;
};

const DIE_GAP = 2;
const DIE_RING = 2;
const SEAT_PAD_X = 10;
const SEAT_PAD_Y = 8;
/** Name/turn row height reserved inside each seat card. */
const SEAT_CHROME_H: Record<PlaySizeTier, number> = {
  compact: 28,
  regular: 36,
  roomy: 36,
};
const SEAT_BORDER = 4;
const DEFAULT_DIE = 15;

function chromeH(sizeTier: PlaySizeTier = "compact"): number {
  return SEAT_CHROME_H[sizeTier];
}

/** Felt inset as a fraction of arena — small so the oval is large. */
const FELT_INSET: Record<PlaySizeTier, { x: number; y: number }> = {
  compact: { x: 0.06, y: 0.07 },
  regular: { x: 0.05, y: 0.06 },
  roomy: { x: 0.045, y: 0.05 },
};

export function dieFootprint(dieSize: number): number {
  return dieSize + DIE_RING;
}

export function fitDieSize(
  innerWidth: number,
  cols: number = DICE_PER_PLAYER,
  gap: number = DIE_GAP,
  minDie: number = 14,
  maxDie: number = 36,
): number {
  if (cols <= 0 || innerWidth <= 0) return minDie;
  const raw = Math.floor((innerWidth - gap * (cols - 1) - DIE_RING * cols) / cols);
  return Math.max(minDie, Math.min(maxDie, raw));
}

export function seatWidthForDie(dieSize: number, diceColumns: number = DICE_PER_PLAYER): number {
  const cell = dieFootprint(dieSize);
  return SEAT_PAD_X * 2 + SEAT_BORDER + cell * diceColumns + DIE_GAP * (diceColumns - 1);
}

export function seatHeightForDie(
  dieSize: number,
  maxDice: number = DICE_PER_PLAYER,
  diceColumns: number = DICE_PER_PLAYER,
  sizeTier: PlaySizeTier = "compact",
): number {
  const rows = Math.max(1, Math.ceil(maxDice / diceColumns));
  const cell = dieFootprint(dieSize);
  return SEAT_PAD_Y * 2 + SEAT_BORDER + chromeH(sizeTier) + cell * rows + DIE_GAP * (rows - 1);
}

export function seatWidthForCard(
  dieSize: number,
  diceColumns: number,
  minSeatWidth: number,
): number {
  return Math.max(minSeatWidth, seatWidthForDie(dieSize, diceColumns));
}

export function fitDieInSeat(
  seatWidth: number,
  seatHeight: number,
  diceColumns: number,
  maxDice: number = DICE_PER_PLAYER,
  maxDie: number = 36,
  minDie: number = 10,
  sizeTier: PlaySizeTier = "compact",
): number {
  const innerW = seatWidth - SEAT_PAD_X * 2 - SEAT_BORDER;
  const innerH = seatHeight - SEAT_PAD_Y * 2 - SEAT_BORDER - chromeH(sizeTier);
  const rows = Math.max(1, Math.ceil(maxDice / diceColumns));
  const byWidth = fitDieSize(innerW, diceColumns, DIE_GAP, minDie, maxDie);
  const byHeight = Math.floor((innerH - DIE_GAP * (rows - 1) - DIE_RING * rows) / rows);
  return Math.max(minDie, Math.min(maxDie, byWidth, byHeight));
}

/** Large felt oval that seats sit on. */
export function getFeltBounds(
  arenaWidth: number,
  arenaHeight: number,
  sizeTier: PlaySizeTier = "compact",
): FeltBounds {
  const inset = FELT_INSET[sizeTier];
  const x = arenaWidth * inset.x;
  const y = arenaHeight * inset.y;
  const width = arenaWidth * (1 - inset.x * 2);
  const height = arenaHeight * (1 - inset.y * 2);
  return {
    x,
    y,
    width,
    height,
    cx: x + width / 2,
    cy: y + height / 2,
    rx: width / 2,
    ry: height / 2,
  };
}

/**
 * Equal angular spacing around the felt ellipse.
 * Human is always at the bottom (-π/2); others follow clockwise (to human's left),
 * matching turn order and classic "pass left" table play.
 */
export function rimAngles(count: number, humanIndex: number): number[] {
  const n = Math.min(6, Math.max(2, Math.floor(count)));
  const hi = Math.max(0, Math.min(n - 1, humanIndex));
  const step = (2 * Math.PI) / n;
  const angles: number[] = new Array(n);
  for (let i = 0; i < n; i++) {
    // Slot 0 = human at bottom; remaining players walk clockwise (decreasing angle).
    const slot = (i - hi + n) % n;
    angles[i] = -Math.PI / 2 - slot * step;
  }
  return angles;
}

/**
 * Equal angles pack seats near the poles and leave a wide mid gap (sine curve).
 * Remap each distinct height band to evenly spaced ny ∈ [-1, 1] while staying on
 * the unit ellipse so left/right pairs keep symmetry.
 */
export function evenVerticalRimVectors(
  angles: number[],
): { nx: number; ny: number }[] {
  const raw = angles.map((a) => ({
    nx: Math.cos(a),
    ny: -Math.sin(a),
  }));

  // Triangle table: upper-left / upper-right (not north pole). Stay high enough
  // that vertical centering doesn't leave huge empty bands above/below.
  if (angles.length === 3) {
    return raw.map((p) => {
      if (p.ny > 0.5) return { nx: 0, ny: 1 }; // human at bottom
      const sign = p.nx < 0 ? -1 : 1;
      const ny = -0.55;
      return { nx: sign * Math.sqrt(1 - ny * ny), ny };
    });
  }

  const tol = 0.04;
  const bands: number[] = [];
  for (const p of raw) {
    if (!bands.some((b) => Math.abs(b - p.ny) < tol)) bands.push(p.ny);
  }
  bands.sort((a, b) => a - b); // top (ny < 0) → bottom (ny > 0)

  if (bands.length <= 1) return raw;

  const evenBands = bands.map((_, i) => -1 + (2 * i) / (bands.length - 1));

  const mapNy = (ny: number) => {
    let best = 0;
    let bestDist = Infinity;
    for (let i = 0; i < bands.length; i++) {
      const d = Math.abs(bands[i] - ny);
      if (d < bestDist) {
        bestDist = d;
        best = i;
      }
    }
    return evenBands[best];
  };

  const bandSize = (ny: number) => raw.filter((p) => Math.abs(p.ny - ny) < tol).length;

  // Paired seats must keep horizontal separation — never collapse them onto a pole.
  const minPairNx = 0.42;
  const maxPairAbsNy = Math.sqrt(1 - minPairNx * minPairNx);

  return raw.map(({ nx, ny }) => {
    let newNy = mapNy(ny);
    const pair = bandSize(ny) >= 2;
    if (pair) {
      newNy = Math.max(-maxPairAbsNy, Math.min(maxPairAbsNy, newNy));
    }

    const sign = Math.abs(nx) < 1e-6 ? 0 : nx > 0 ? 1 : -1;
    if (!pair && (Math.abs(newNy) >= 0.999 || sign === 0)) {
      return { nx: 0, ny: newNy < 0 ? -1 : 1 };
    }
    const absNx = Math.sqrt(Math.max(0, 1 - newNy * newNy));
    return { nx: (sign === 0 ? 1 : sign) * absNx, ny: newNy };
  });
}

function boxesOverlap(
  a: { x: number; y: number; width: number; height: number },
  b: { x: number; y: number; width: number; height: number },
  gap: number,
): boolean {
  return !(
    a.x + a.width + gap <= b.x ||
    b.x + b.width + gap <= a.x ||
    a.y + a.height + gap <= b.y ||
    b.y + b.height + gap <= a.y
  );
}

function anyOverlap(seats: SeatLayout[], gap: number): boolean {
  for (let i = 0; i < seats.length; i++) {
    for (let j = i + 1; j < seats.length; j++) {
      if (boxesOverlap(seats[i], seats[j], gap)) return true;
    }
  }
  return false;
}

type SeatMetric = {
  isHuman: boolean;
  playerIndex: number;
  diceColumns: number;
  dieSize: number;
  width: number;
  height: number;
  nx: number;
  ny: number;
  outward: number;
};

function seatMetricsForRim(
  angles: number[],
  hi: number,
  dieSize: number,
  maxDice: number,
  diceColumns: number,
  minSeatWidth: number,
  humanBoost: number,
  sizeTier: PlaySizeTier,
): SeatMetric[] {
  const humanDie = Math.round(dieSize * 1.55 + 2);
  const vectors = evenVerticalRimVectors(angles);

  const sized = angles.map((angle, i) => {
    const isHuman = i === hi;
    const cols = diceColumns;
    const targetDie = isHuman ? humanDie : dieSize;
    const baseW = seatWidthForCard(targetDie, cols, minSeatWidth);
    const width = isHuman ? Math.round(baseW * humanBoost) : baseW;
    const fittedDie = fitDieInSeat(
      width,
      240,
      cols,
      maxDice,
      targetDie,
      Math.min(dieSize, 9),
      sizeTier,
    );
    const height = seatHeightForDie(fittedDie, maxDice, cols, sizeTier) + (isHuman ? 4 : 0);
    return {
      isHuman,
      playerIndex: i,
      diceColumns: cols,
      dieSize: fittedDie,
      width,
      height,
      nx: vectors[i].nx,
      ny: vectors[i].ny,
      // Placeholder — replaced with a shared outward so taller You doesn't skew the ring.
      outward: 0,
    };
  });

  // Same radial nudge for every seat (avg size) so vertical bands stay even.
  const outward =
    sized.reduce((sum, s) => sum + Math.min(s.width, s.height), 0) / sized.length * 0.12;
  return sized.map((s) => ({ ...s, outward }));
}

function seatsOnScaledRim(
  arenaWidth: number,
  arenaHeight: number,
  felt: FeltBounds,
  metrics: SeatMetric[],
  scale: number,
  padding: number,
): SeatLayout[] | null {
  const seats: SeatLayout[] = [];
  for (const m of metrics) {
    const rimX = felt.cx + (felt.rx * m.nx + m.nx * m.outward) * scale;
    const rimY = felt.cy + (felt.ry * m.ny + m.ny * m.outward) * scale;
    const x = rimX - m.width / 2;
    const y = rimY - m.height / 2;
    if (
      x < padding ||
      y < padding ||
      x + m.width > arenaWidth - padding ||
      y + m.height > arenaHeight - padding
    ) {
      return null;
    }
    seats.push({
      x,
      y,
      width: m.width,
      height: m.height,
      dieSize: m.dieSize,
      playerIndex: m.playerIndex,
      isHuman: m.isHuman,
      diceColumns: m.diceColumns,
    });
  }
  return seats;
}

/**
 * Place seats on the felt rim with one shared radial scale so vertical bands
 * stay even. Never per-seat clamp — that used to shove the taller human seat up
 * and leave a bigger gap above the side players.
 */
function placeOnRim(
  arenaWidth: number,
  arenaHeight: number,
  felt: FeltBounds,
  angles: number[],
  hi: number,
  dieSize: number,
  maxDice: number,
  diceColumns: number,
  minSeatWidth: number,
  humanBoost: number,
  padding: number,
  sizeTier: PlaySizeTier,
): { seats: SeatLayout[]; scale: number; outward: number } {
  const metrics = seatMetricsForRim(
    angles,
    hi,
    dieSize,
    maxDice,
    diceColumns,
    minSeatWidth,
    humanBoost,
    sizeTier,
  );
  const outward = metrics[0]?.outward ?? 0;

  let lo = 0.4;
  let hiScale = 1;
  let best =
    seatsOnScaledRim(arenaWidth, arenaHeight, felt, metrics, lo, padding) ??
    // Last resort: force-fit at tiny scale (may still null — caller shrinks seats).
    seatsOnScaledRim(arenaWidth, arenaHeight, felt, metrics, 0.35, padding);
  let bestScale = best ? lo : 0.35;

  for (let iter = 0; iter < 14; iter++) {
    const mid = (lo + hiScale) / 2;
    const attempt = seatsOnScaledRim(arenaWidth, arenaHeight, felt, metrics, mid, padding);
    if (attempt) {
      best = attempt;
      bestScale = mid;
      lo = mid;
    } else {
      hiScale = mid;
    }
  }

  if (best) return { seats: best, scale: bestScale, outward };

  // Absolute fallback — keep equal bands even if we must clip the arena edge.
  const scale = 0.35;
  return {
    scale,
    outward,
    seats: metrics.map((m) => {
      const rimX = felt.cx + (felt.rx * m.nx + m.nx * m.outward) * scale;
      const rimY = felt.cy + (felt.ry * m.ny + m.ny * m.outward) * scale;
      return {
        x: Math.max(padding, Math.min(arenaWidth - padding - m.width, rimX - m.width / 2)),
        y: Math.max(padding, Math.min(arenaHeight - padding - m.height, rimY - m.height / 2)),
        width: m.width,
        height: m.height,
        dieSize: m.dieSize,
        playerIndex: m.playerIndex,
        isHuman: m.isHuman,
        diceColumns: m.diceColumns,
      };
    }),
  };
}

/**
 * Fit a felt oval through the current seat centers after vertical stretch.
 */
export function fitFeltToSeatCenters(
  seats: SeatLayout[],
  opts?: { minRx?: number },
): FeltBounds | null {
  if (seats.length === 0) return null;
  const cxs = seats.map((s) => s.x + s.width / 2);
  const cys = seats.map((s) => s.y + s.height / 2);
  const cx = (Math.min(...cxs) + Math.max(...cxs)) / 2;
  const cy = (Math.min(...cys) + Math.max(...cys)) / 2;
  const ry = Math.max(1, ...cys.map((y) => Math.abs(y - cy)));
  // 2-player seats are colinear (top/bottom) — without a floor, rx collapses to ~0.
  let rx = Math.max(1, ...cxs.map((x) => Math.abs(x - cx)));
  if (opts?.minRx != null) rx = Math.max(rx, opts.minRx);
  else if (rx < ry * 0.4) rx = ry * 0.9;
  return {
    cx,
    cy,
    rx,
    ry,
    x: cx - rx,
    y: cy - ry,
    width: rx * 2,
    height: ry * 2,
  };
}

/**
 * Triangle seating fits a wide/flat oval; grow ry (clamped to the arena) so the
 * center has room for a few more bid lines without moving seats.
 * When the oval sits low (bottom-pinned You), grow upward and keep the bottom rim.
 */
export function stretchFeltVertically(
  felt: FeltBounds,
  arenaHeight: number,
  padding: number,
  /** Cap width/height; lower = taller oval. */
  maxAspect: number = 2.2,
): FeltBounds {
  const targetRy = Math.max(felt.ry, felt.rx / maxAspect);
  const currentBottom = felt.cy + felt.ry;
  const roomBelow = arenaHeight - padding - felt.cy;
  const roomAbove = felt.cy - padding;

  // Low in the arena: anchor the bottom rim and expand upward.
  if (roomBelow + 1 < roomAbove) {
    const anchoredBottom = Math.min(currentBottom, arenaHeight - padding);
    const maxRy = Math.max(felt.ry, anchoredBottom - padding);
    const ry = Math.min(maxRy, targetRy);
    if (ry <= felt.ry + 0.5) return felt;
    const cy = anchoredBottom - ry;
    return {
      ...felt,
      cy,
      ry,
      y: cy - ry,
      height: ry * 2,
    };
  }

  const maxRy = Math.max(felt.ry, Math.min(roomAbove, roomBelow));
  const ry = Math.min(maxRy, targetRy);
  if (ry <= felt.ry + 0.5) return felt;
  return {
    ...felt,
    ry,
    y: felt.cy - ry,
    height: ry * 2,
  };
}

export type OpenCenterRect = {
  x: number;
  y: number;
  width: number;
  height: number;
};

/**
 * Axis-aligned air in the middle of the table that does not cover seats.
 * Each seat insets only on its dominant axis (side vs top/bottom) so upper-side
 * seats on a 3-player table don't also eat the vertical band.
 */
export function openCenterFromSeats(
  felt: FeltBounds,
  seats: SeatLayout[],
  padX: number,
  padY: number,
  seatGap: number = 8,
): OpenCenterRect {
  let left = felt.x + padX;
  let right = felt.x + felt.width - padX;
  let top = felt.y + padY;
  let bottom = felt.y + felt.height - padY;

  for (const seat of seats) {
    const scx = seat.x + seat.width / 2;
    const scy = seat.y + seat.height / 2;
    const dx = felt.rx > 0 ? (scx - felt.cx) / felt.rx : 0;
    const dy = felt.ry > 0 ? (scy - felt.cy) / felt.ry : 0;

    if (Math.abs(dx) >= Math.abs(dy)) {
      if (dx < 0) left = Math.max(left, seat.x + seat.width + seatGap);
      if (dx > 0) right = Math.min(right, seat.x - seatGap);
    } else {
      if (dy < 0) top = Math.max(top, seat.y + seat.height + seatGap);
      if (dy > 0) bottom = Math.min(bottom, seat.y - seatGap);
    }
  }

  const width = Math.max(0, right - left);
  const height = Math.max(0, bottom - top);
  // If seats pinched the box shut, fall back to padded felt so chrome still shows.
  if (width < 80 || height < 64) {
    return {
      x: felt.x + padX,
      y: felt.y + padY,
      width: Math.max(0, felt.width - padX * 2),
      height: Math.max(0, felt.height - padY * 2),
    };
  }
  return { x: left, y: top, width, height };
}

/**
 * Frame the seat cluster in the arena, centering leftover slack.
 */
export function centerSeatCluster(
  seats: SeatLayout[],
  arenaWidth: number,
  arenaHeight: number,
  padding: number,
): { seats: SeatLayout[]; shiftX: number; shiftY: number } {
  if (seats.length === 0) return { seats, shiftX: 0, shiftY: 0 };

  let minX = Infinity;
  let minY = Infinity;
  let maxX = -Infinity;
  let maxBottom = -Infinity;
  for (const s of seats) {
    minX = Math.min(minX, s.x);
    minY = Math.min(minY, s.y);
    maxX = Math.max(maxX, s.x + s.width);
    maxBottom = Math.max(maxBottom, s.y + s.height);
  }

  const availW = Math.max(0, arenaWidth - padding * 2);
  const availH = Math.max(0, arenaHeight - padding * 2);
  const clusterW = maxX - minX;
  const clusterH = maxBottom - minY;
  const targetX = padding + Math.max(0, (availW - clusterW) / 2);
  const targetY = padding + Math.max(0, (availH - clusterH) / 2);
  const shiftX = targetX - minX;
  const shiftY = targetY - minY;

  if (Math.abs(shiftX) < 0.5 && Math.abs(shiftY) < 0.5) {
    return { seats, shiftX: 0, shiftY: 0 };
  }

  return {
    shiftX,
    shiftY,
    seats: seats.map((s) => ({ ...s, x: s.x + shiftX, y: s.y + shiftY })),
  };
}

/**
 * Place 2–6 players on the felt oval rim — human at bottom, others on the upper arc.
 * Returns seats and a felt oval translated together so edge gaps stay even.
 */
export function layoutTableSeats(
  arenaWidth: number,
  arenaHeight: number,
  playerCount: number,
  humanIndex: number = 0,
  options: TableSeatingOptions = {},
): TableLayout {
  if (playerCount <= 0 || arenaWidth <= 0 || arenaHeight <= 0) {
    return { seats: [], felt: null };
  }

  const count = Math.min(6, Math.max(2, Math.floor(playerCount)));
  const hi = Math.max(0, Math.min(count - 1, humanIndex));
  const sizeTier = options.sizeTier ?? "compact";
  const padding =
    options.padding ?? Math.max(4, Math.min(10, Math.floor(Math.min(arenaWidth, arenaHeight) * 0.015)));
  const maxDice = options.maxDice ?? DICE_PER_PLAYER;
  const minGap = options.minGap ?? 4;
  const minDie = options.minDieSize ?? 9;
  const maxDie = options.maxDieSize ?? DEFAULT_DIE;
  const dieSize = Math.max(minDie, maxDie);

  const defaultMinW = count <= 2 ? 180 : count <= 4 ? 160 : count <= 5 ? 150 : 140;
  let minSeatWidth =
    options.minSeatWidth ??
    Math.min(defaultMinW, Math.floor((arenaWidth - padding * 2) / Math.max(2.1, count * 0.48)));

  const cols = maxDice;
  const humanBoost = count >= 5 ? 1.18 : 1.22;
  const baseFelt = getFeltBounds(arenaWidth, arenaHeight, sizeTier);
  const angles = rimAngles(count, hi);

  let widthFloor = minSeatWidth;
  let die = dieSize;
  let placed = placeOnRim(
    arenaWidth,
    arenaHeight,
    baseFelt,
    angles,
    hi,
    die,
    maxDice,
    cols,
    widthFloor,
    humanBoost,
    padding,
    sizeTier,
  );

  while (anyOverlap(placed.seats, minGap) && widthFloor > 96) {
    widthFloor -= 4;
    placed = placeOnRim(
      arenaWidth,
      arenaHeight,
      baseFelt,
      angles,
      hi,
      die,
      maxDice,
      cols,
      widthFloor,
      humanBoost,
      padding,
      sizeTier,
    );
  }

  // If wide name cards still collide on a crowded rim, shrink dice (and seat height).
  while (anyOverlap(placed.seats, minGap) && die > minDie) {
    die -= 1;
    placed = placeOnRim(
      arenaWidth,
      arenaHeight,
      baseFelt,
      angles,
      hi,
      die,
      maxDice,
      cols,
      widthFloor,
      humanBoost,
      padding,
      sizeTier,
    );
  }

  // Draw the oval through the seat centers so the top player stays on the rail.
  const balanced = centerSeatCluster(placed.seats, arenaWidth, arenaHeight, padding);
  let felt = fitFeltToSeatCenters(balanced.seats, {
    // Top/bottom-only seats (2p) need an explicit width or the oval vanishes.
    minRx: count <= 2 ? baseFelt.rx * placed.scale * 0.72 : undefined,
  });
  // 3-player side seats make a flatter oval — stretch a bit for bid chrome.
  if (felt && count === 3) {
    felt = stretchFeltVertically(felt, arenaHeight, padding, 1.75);
  }
  return {
    seats: balanced.seats,
    felt,
  };
}
