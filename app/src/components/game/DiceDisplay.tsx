import React from "react";
import { View } from "react-native";
import { useTheme } from "../../theme/ThemeProvider";
import { Die, type DieFace } from "../shared/Die";

type Size = "sm" | "md" | "lg";
const SIZE_PX: Record<Size, number> = { sm: 36, md: 48, lg: 64 };

interface DiceRowProps {
  dice: DieFace[];
  highlightValues?: DieFace[];
  wildValue?: boolean;
  size?: Size;
  hidden?: boolean;
}

export function DiceRow({ dice, highlightValues, wildValue, size = "md", hidden }: DiceRowProps) {
  const { colors } = useTheme();
  const px = SIZE_PX[size];
  const ringInset = px * 0.24 + 3;

  return (
    <View className="flex-row flex-wrap" style={{ gap: 6 }}>
      {dice.map((value, i) => {
        const isHighlight = !hidden && highlightValues?.includes(value);
        const isWild = !hidden && wildValue && value === 1 && !highlightValues?.includes(1 as DieFace);
        const ringColor = isHighlight ? colors.accent : isWild ? colors.secondary : "transparent";

        return (
          <View
            key={i}
            style={{
              borderRadius: ringInset,
              borderWidth: ringColor === "transparent" ? 0 : 3,
              borderColor: ringColor,
            }}
          >
            <Die face={hidden ? null : value} color={colors.surfaceRaised} pipColor={colors.textPrimary} size={px} />
          </View>
        );
      })}
    </View>
  );
}
