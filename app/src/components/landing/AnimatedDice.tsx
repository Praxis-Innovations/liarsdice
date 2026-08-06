import { MotiView } from "moti";
import React from "react";
import { View } from "react-native";
import { Die, type DieFace } from "../shared/Die";

const DIE_SIZE = 100;
const DIE_RADIUS = 24;

export type DieConfig = {
  face: DieFace;
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
          <Die face={die.face} color={die.color} pipColor={pipColor} size={DIE_SIZE} />
        </MotiView>
      ))}
    </View>
  );
}
