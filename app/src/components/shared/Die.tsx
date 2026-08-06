import React from "react";
import Svg, { Circle, Rect } from "react-native-svg";

// Ratios (of `size`) rather than fixed pixel values so the same die art scales
// cleanly from the marketing hero (~100px) down to in-hand game dice (~40-56px).
const DIE_RADIUS_RATIO = 0.24;
const PIP_RADIUS_RATIO = 0.08;
const GRID_RATIOS = [0.22, 0.5, 0.78];

// Pip layout per face value, as [col, row] coordinates into the 3x3 grid.
const FACES: Record<number, [number, number][]> = {
  1: [[1, 1]],
  2: [
    [0, 0],
    [2, 2],
  ],
  3: [
    [0, 0],
    [1, 1],
    [2, 2],
  ],
  4: [
    [0, 0],
    [2, 0],
    [0, 2],
    [2, 2],
  ],
  5: [
    [0, 0],
    [2, 0],
    [1, 1],
    [0, 2],
    [2, 2],
  ],
  6: [
    [0, 0],
    [2, 0],
    [0, 1],
    [2, 1],
    [0, 2],
    [2, 2],
  ],
};

export type DieFace = 1 | 2 | 3 | 4 | 5 | 6;

export interface DieProps {
  /** Omit (or pass null) to render a face-down die — used for hidden opponent dice pre-reveal. */
  face?: DieFace | null;
  color: string;
  pipColor?: string;
  size?: number;
}

export function Die({ face, color, pipColor = "#FFFFFF", size = 100 }: DieProps) {
  const radius = size * DIE_RADIUS_RATIO;
  const pipRadius = size * PIP_RADIUS_RATIO;
  const grid = GRID_RATIOS.map((r) => r * size);

  return (
    <Svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      <Rect width={size} height={size} rx={radius} ry={radius} fill={color} />
      {face
        ? FACES[face].map(([col, row], i) => <Circle key={i} cx={grid[col]} cy={grid[row]} r={pipRadius} fill={pipColor} />)
        : null}
    </Svg>
  );
}
