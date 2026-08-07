import React from "react";
import { View, useWindowDimensions } from "react-native";
import { getBreakpoint } from "../../lib/breakpoints";
import { useTheme } from "../../theme/ThemeProvider";
import { Die, type DieFace } from "../shared/Die";

type Size = "sm" | "md" | "lg";

const SIZE_PX: Record<"phone" | "tablet" | "laptop", Record<Size, number>> = {
  phone: { sm: 24, md: 34, lg: 42 },
  tablet: { sm: 28, md: 40, lg: 48 },
  laptop: { sm: 28, md: 40, lg: 52 },
};

const PAD: Record<Size, number> = { sm: 6, md: 10, lg: 12 };
const GAP: Record<Size, number> = { sm: 4, md: 6, lg: 8 };

interface DiceRowProps {
  dice: DieFace[];
  highlightValues?: DieFace[];
  wildValue?: boolean;
  size?: Size;
  hidden?: boolean;
  /** Accent border — human player's board. */
  emphasized?: boolean;
  /** Stretch board to full width of parent. */
  fullWidth?: boolean;
  /** Skip the board chrome when the parent already provides a surface. */
  bare?: boolean;
}

/** Dice on a minimal board: theme surface + single border. */
export function DiceRow({
  dice,
  highlightValues,
  wildValue,
  size = "md",
  hidden,
  emphasized = false,
  fullWidth = false,
  bare = false,
}: DiceRowProps) {
  const { colors, radii } = useTheme();
  const { width } = useWindowDimensions();
  const bp = getBreakpoint(width);
  const px = SIZE_PX[bp][size];

  const row = (
    <View className="flex-row flex-wrap" style={{ gap: GAP[size] }}>
      {dice.map((value, i) => {
        const shown = !hidden;
        const isHighlight = shown && highlightValues?.includes(value);
        const isWild = shown && wildValue && value === 1 && !highlightValues?.includes(1 as DieFace);

        return (
          <View
            key={i}
            style={{
              borderRadius: px * 0.28,
              borderWidth: 2,
              borderColor: isHighlight ? colors.accent : isWild ? colors.secondary : "transparent",
            }}
          >
            <Die
              face={shown ? value : null}
              color={shown ? colors.primary : colors.border}
              pipColor="#FFFFFF"
              size={px}
            />
          </View>
        );
      })}
    </View>
  );

  if (bare) return row;

  return (
    <View
      style={{
        backgroundColor: colors.surface,
        borderRadius: radii.sm,
        borderWidth: 1,
        borderColor: emphasized ? colors.accent : colors.border,
        padding: PAD[size],
        alignSelf: fullWidth ? "stretch" : "flex-start",
        maxWidth: "100%",
      }}
    >
      {row}
    </View>
  );
}
