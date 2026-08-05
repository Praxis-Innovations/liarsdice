import { MotiView } from "moti";
import React from "react";
import { View } from "react-native";
import Svg, { Circle, Rect } from "react-native-svg";

const DIE_SIZE = 100;
const DIE_RADIUS = 24;
const PIP_RADIUS = 8;
const GRID = [22, 50, 78];

// Pip layout per face value, as [col, row] coordinates into the 3x3 GRID.
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

function Die({ face, color, pipColor }: { face: number; color: string; pipColor: string }) {
  return (
    <Svg width={DIE_SIZE} height={DIE_SIZE} viewBox={`0 0 ${DIE_SIZE} ${DIE_SIZE}`}>
      <Rect width={DIE_SIZE} height={DIE_SIZE} rx={DIE_RADIUS} ry={DIE_RADIUS} fill={color} />
      {FACES[face].map(([col, row], i) => (
        <Circle key={i} cx={GRID[col]} cy={GRID[row]} r={PIP_RADIUS} fill={pipColor} />
      ))}
    </Svg>
  );
}

export type DieConfig = {
  face: number;
  color: string;
  restRotate: string;
};

export default function AnimatedDiceGroup({ dice, pipColor }: { dice: DieConfig[]; pipColor: string }) {
  return (
    <View className="flex-row items-end justify-center gap-6">
      {dice.map((die, index) => (
        <MotiView
          key={index}
          from={{ opacity: 0, scale: 0.4, translateY: 60, rotate: die.restRotate }}
          animate={{ opacity: 1, scale: 1, translateY: [0, -14, 0], rotate: die.restRotate }}
          transition={{
            opacity: { type: "timing", duration: 500, delay: index * 150 },
            scale: { type: "spring", delay: index * 150, damping: 9 },
            rotate: { type: "spring", delay: index * 150, damping: 9 },
            translateY: { type: "timing", duration: 2600, loop: true, delay: 650 + index * 220 },
          }}
          style={{
            width: DIE_SIZE,
            height: DIE_SIZE,
            borderRadius: DIE_RADIUS,
            shadowColor: "#000",
            shadowOpacity: 0.25,
            shadowRadius: 16,
            shadowOffset: { width: 0, height: 12 },
          }}
        >
          <Die face={die.face} color={die.color} pipColor={pipColor} />
        </MotiView>
      ))}
    </View>
  );
}
