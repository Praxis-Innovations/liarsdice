/**
 * Web hero dice — static SVG at final resting positions.
 * Native builds resolve `HeroDiceStage.tsx` instead (Reanimated toss animation).
 */
import React from "react";
import { View } from "react-native";
import { Die } from "../shared/Die";
import type { ScatteredDieConfig } from "./AnimatedDice";
import type { DiceTableConfig } from "./DicePlatform";

type DiceStageProps = {
  dice: ScatteredDieConfig[];
  pipColor?: string;
  width?: number;
  height?: number;
  table?: DiceTableConfig;
  verticalOffset?: number;
};

export function HeroDiceStage({
  dice,
  pipColor = "#FFFFFF",
  width = 0,
  height = 0,
  verticalOffset = 0,
}: DiceStageProps) {
  if (width < 32 || height < 32 || dice.length === 0) return null;

  return (
    <View
      pointerEvents="none"
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        width,
        height,
        zIndex: 0,
        backgroundColor: "transparent",
        overflow: "visible",
      }}
    >
      {dice.map((die, i) => (
        <View
          key={`${die.face}-${Math.round(die.left ?? 0)}-${i}`}
          style={{
            position: "absolute",
            top: (die.top ?? 0) + verticalOffset,
            left: die.left ?? 0,
            width: die.size,
            height: die.size,
          }}
        >
          <Die face={die.face} color={die.color} pipColor={pipColor} size={die.size} />
        </View>
      ))}
    </View>
  );
}
