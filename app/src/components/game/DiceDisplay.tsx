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
  /** Explicit pixel size from table seating; overrides breakpoint `size`. */
  dieSizePx?: number;
  hidden?: boolean;
  /** Accent border — human player's board. */
  emphasized?: boolean;
  /** Stretch board to full width of parent. */
  fullWidth?: boolean;
  /** Skip the board chrome when the parent already provides a surface. */
  bare?: boolean;
  /** Keep dice on one row (default true for table seats). */
  noWrap?: boolean;
  /** 1px ring (table seats) instead of 2px — keeps dice inside compact cards. */
  tight?: boolean;
}

/** Dice on a minimal board: theme surface + single border. */
export function DiceRow({
  dice,
  highlightValues,
  wildValue,
  size = "md",
  dieSizePx,
  hidden,
  emphasized = false,
  fullWidth = false,
  bare = false,
  noWrap = true,
  tight = false,
}: DiceRowProps) {
  const { colors, radii } = useTheme();
  const { width } = useWindowDimensions();
  const bp = getBreakpoint(width);
  const px = dieSizePx ?? SIZE_PX[bp][size];
  const gap = dieSizePx != null ? (tight ? 3 : 4) : GAP[size];
  const ring = tight ? 1 : 2;

  const row = (
    <View
      testID="dice-row"
      accessibilityLabel={`Dice row (${dice.length})`}
      className={noWrap ? "flex-row" : "flex-row flex-wrap"}
      style={{
        gap,
        flexShrink: 1,
        maxWidth: "100%",
        justifyContent: "center",
      }}
    >
      {dice.map((value, i) => {
        const shown = !hidden;
        const isHighlight = shown && !!highlightValues?.includes(value);
        const isWild =
          shown && !!wildValue && value === 1 && !highlightValues?.includes(1 as DieFace);
        const revealing = shown && !!highlightValues?.length;

        return (
          <View
            key={i}
            accessibilityLabel={shown ? `Die face ${value}` : "Hidden die"}
            style={{
              borderRadius: px * 0.28,
              borderWidth: isHighlight ? Math.max(2, ring + 1) : ring,
              borderColor: isHighlight ? colors.accent : isWild ? colors.secondary : "transparent",
              // Soft halo so matching dice pop during round resolve.
              backgroundColor: isHighlight ? `${colors.accent}55` : "transparent",
              padding: isHighlight ? 1 : 0,
              opacity: revealing && !isHighlight ? 0.42 : 1,
              transform: isHighlight ? [{ scale: 1.08 }] : undefined,
            }}
          >
            <Die
              face={shown ? value : null}
              color={shown ? (isHighlight ? colors.accent : colors.primary) : colors.border}
              pipColor={shown && isHighlight ? colors.textPrimary : "#FFFFFF"}
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
        padding: dieSizePx != null ? Math.max(4, Math.round(px * 0.2)) : PAD[size],
        alignSelf: fullWidth ? "stretch" : "flex-start",
        maxWidth: "100%",
      }}
    >
      {row}
    </View>
  );
}
