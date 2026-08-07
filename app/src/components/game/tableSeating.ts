/**
 * Pure layout helpers for seats around the play table.
 * Felt fills most of the arena; seats sit on the oval rim.
 */

import { DICE_PER_PLAYER } from "../../engine/constants";

/** Phone stays tight; tablet/desktop use larger seat + dock chrome. */
export type PlaySizeTier = "compact" | "regular" | "roomy";

export type OutwardAlign = "left" | "right" | "center";

export type SeatLayout = {
  x: number;
  y: number;
  width: number;
  height: number;
  dieSize: number;
  playerIndex: number;
  isHuman: boolean;
  diceColumns: number;
  outwardAlign: OutwardAlign;
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
const SEAT_CHROME_H = 36;
const SEAT_BORDER = 4;
const DEFAULT_DIE = 15;

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
): number {
  const rows = Math.max(1, Math.ceil(maxDice / diceColumns));
  const cell = dieFootprint(dieSize);
  return SEAT_PAD_Y * 2 + SEAT_BORDER + SEAT_CHROME_H + cell * rows + DIE_GAP * (rows - 1);
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
): number {
  const innerW = seatWidth - SEAT_PAD_X * 2 - SEAT_BORDER;
  const innerH = seatHeight - SEAT_PAD_Y * 2 - SEAT_BORDER - SEAT_CHROME_H;
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
 * Human is always at the bottom (-π/2); others follow in seat order clockwise.
 */
export function rimAngles(count: number, humanIndex: number): number[] {
  const n = Math.min(6, Math.max(2, Math.floor(count)));
  const hi = Math.max(0, Math.min(n - 1, humanIndex));
  const step = (2 * Math.PI) / n;
  const angles: number[] = new Array(n);
  for (let i = 0; i < n; i++) {
    // Slot 0 = human at bottom; remaining players walk clockwise around the table.
    const slot = (i - hi + n) % n;
    angles[i] = -Math.PI / 2 + slot * step;
  }
  return angles;
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
  angle: number;
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
): SeatMetric[] {
  const humanDie = Math.round(dieSize * 1.55 + 2);
  return angles.map((angle, i) => {
    const isHuman = i === hi;
    const cols = diceColumns;
    const targetDie = isHuman ? humanDie : dieSize;
    const baseW = seatWidthForCard(targetDie, cols, minSeatWidth);
    const width = isHuman ? Math.round(baseW * humanBoost) : baseW;
    const fittedDie = fitDieInSeat(width, 240, cols, maxDice, targetDie, Math.min(dieSize, 9));
    const height = seatHeightForDie(fittedDie, maxDice, cols) + (isHuman ? 4 : 0);
    return {
      isHuman,
      playerIndex: i,
      diceColumns: cols,
      dieSize: fittedDie,
      width,
      height,
      angle,
      // Light outward nudge — kept small so equal angles stay visually even.
      outward: Math.min(width, height) * 0.12,
    };
  });
}

function outwardAlignForAngle(angle: number, isHuman: boolean): OutwardAlign {
  if (isHuman) return "center";
  const cx = Math.cos(angle);
  if (cx > 0.3) return "right";
  if (cx < -0.3) return "left";
  return "center";
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
    const nx = Math.cos(m.angle);
    const ny = -Math.sin(m.angle);
    const rimX = felt.cx + (felt.rx * nx + nx * m.outward) * scale;
    const rimY = felt.cy + (felt.ry * ny + ny * m.outward) * scale;
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
      outwardAlign: outwardAlignForAngle(m.angle, m.isHuman),
    });
  }
  return seats;
}

/**
 * Place seats on the felt rim with one shared radial scale so equal angles stay
 * even. Never per-seat clamp — that used to shove the taller human seat up and
 * leave a bigger gap above the side players.
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
): SeatLayout[] {
  const metrics = seatMetricsForRim(
    angles,
    hi,
    dieSize,
    maxDice,
    diceColumns,
    minSeatWidth,
    humanBoost,
  );

  let lo = 0.4;
  let hiScale = 1;
  let best =
    seatsOnScaledRim(arenaWidth, arenaHeight, felt, metrics, lo, padding) ??
    // Last resort: force-fit at tiny scale (may still null — caller shrinks seats).
    seatsOnScaledRim(arenaWidth, arenaHeight, felt, metrics, 0.35, padding);

  for (let iter = 0; iter < 14; iter++) {
    const mid = (lo + hiScale) / 2;
    const attempt = seatsOnScaledRim(arenaWidth, arenaHeight, felt, metrics, mid, padding);
    if (attempt) {
      best = attempt;
      lo = mid;
    } else {
      hiScale = mid;
    }
  }

  if (best) return best;

  // Absolute fallback — keep equal angles even if we must clip the arena edge.
  return metrics.map((m) => {
    const nx = Math.cos(m.angle);
    const ny = -Math.sin(m.angle);
    const scale = 0.35;
    const rimX = felt.cx + (felt.rx * nx + nx * m.outward) * scale;
    const rimY = felt.cy + (felt.ry * ny + ny * m.outward) * scale;
    return {
      x: Math.max(padding, Math.min(arenaWidth - padding - m.width, rimX - m.width / 2)),
      y: Math.max(padding, Math.min(arenaHeight - padding - m.height, rimY - m.height / 2)),
      width: m.width,
      height: m.height,
      dieSize: m.dieSize,
      playerIndex: m.playerIndex,
      isHuman: m.isHuman,
      diceColumns: m.diceColumns,
      outwardAlign: outwardAlignForAngle(m.angle, m.isHuman),
    };
  });
}

/**
 * Place 2–6 players on the felt oval rim — human at bottom, others on the upper arc.
 */
export function layoutTableSeats(
  arenaWidth: number,
  arenaHeight: number,
  playerCount: number,
  humanIndex: number = 0,
  options: TableSeatingOptions = {},
): SeatLayout[] {
  if (playerCount <= 0 || arenaWidth <= 0 || arenaHeight <= 0) return [];

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
  const felt = getFeltBounds(arenaWidth, arenaHeight, sizeTier);
  const angles = rimAngles(count, hi);

  let widthFloor = minSeatWidth;
  let die = dieSize;
  let seats = placeOnRim(
    arenaWidth,
    arenaHeight,
    felt,
    angles,
    hi,
    die,
    maxDice,
    cols,
    widthFloor,
    humanBoost,
    padding,
  );

  while (anyOverlap(seats, minGap) && widthFloor > 96) {
    widthFloor -= 4;
    seats = placeOnRim(
      arenaWidth,
      arenaHeight,
      felt,
      angles,
      hi,
      die,
      maxDice,
      cols,
      widthFloor,
      humanBoost,
      padding,
    );
  }

  // If wide name cards still collide on a crowded rim, shrink dice (and seat height).
  while (anyOverlap(seats, minGap) && die > minDie) {
    die -= 1;
    seats = placeOnRim(
      arenaWidth,
      arenaHeight,
      felt,
      angles,
      hi,
      die,
      maxDice,
      cols,
      widthFloor,
      humanBoost,
      padding,
    );
  }

  return seats;
}
