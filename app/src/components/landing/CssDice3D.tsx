/**
 * Native / non-web fallback — flat SVG dice via ScatteredDice.
 * On web, Metro resolves `CssDice3D.web.tsx` (vanilla Three.js) instead.
 * Filename is historical; implementation is no longer CSS-3D.
 */
import React from "react";
import { type ScatteredDieConfig, ScatteredDice } from "./AnimatedDice";
import type { DiceTableConfig } from "./DicePlatform";

export function ScatteredCssDice({
  dice,
  pipColor = "#FFFFFF",
  table: _table,
  verticalOffset = 0,
}: {
  dice: ScatteredDieConfig[];
  pipColor?: string;
  width?: number;
  height?: number;
  table?: DiceTableConfig;
  verticalOffset?: number;
}) {
  // Hero coords are relative to the content area; shift down when the canvas
  // extends behind the navbar so landings stay on the platform.
  const shifted = verticalOffset
    ? dice.map((die) => ({
        ...die,
        top: (die.top ?? 0) + verticalOffset,
        throwDistance: (die.throwDistance ?? 640) + verticalOffset,
      }))
    : dice;

  return <ScatteredDice dice={shifted} pipColor={pipColor} />;
}
