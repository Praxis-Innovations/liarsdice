import { MotiView } from "moti";
import React, { useEffect, useState } from "react";
import { View } from "react-native";
import { getBreakpoint } from "../../lib/breakpoints";
import { useHydrationSafeWindowDimensions } from "../../lib/useHydrationSafeWindowDimensions";
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

const FACES: DieFace[] = [1, 2, 3, 4, 5, 6];

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
  /** Tumbling animation after dice are re-dealt. */
  shuffling?: boolean;
}

function ShufflingDieSlot({
  value,
  index,
  hidden,
  shuffling,
  isHighlight,
  isWild,
  revealing,
  px,
  ring,
  accent,
  secondary,
  primary,
  textPrimary,
  border,
}: {
  value: DieFace;
  index: number;
  hidden: boolean;
  shuffling: boolean;
  isHighlight: boolean;
  isWild: boolean;
  revealing: boolean;
  px: number;
  ring: number;
  accent: string;
  secondary: string;
  primary: string;
  textPrimary: string;
  border: string;
}) {
  const [displayFace, setDisplayFace] = useState<DieFace>(value);

  useEffect(() => {
    if (!shuffling || hidden) {
      setDisplayFace(value);
      return;
    }
    // Cycle random faces, settle on the dealt value when shuffling ends.
    let tick = 0;
    const id = setInterval(() => {
      tick += 1;
      setDisplayFace(FACES[(index * 3 + tick) % FACES.length]);
    }, 70);
    return () => {
      clearInterval(id);
      setDisplayFace(value);
    };
  }, [shuffling, hidden, value, index]);

  const shown = !hidden;
  const face = shown ? (shuffling ? displayFace : value) : null;
  // Don't spin hidden cups — only visible dice tumble.
  const animateShuffle = shuffling && shown;

  return (
    <MotiView
      accessibilityLabel={shown ? `Die face ${value}` : "Hidden die"}
      animate={
        animateShuffle
          ? {
              rotate: `${index % 2 === 0 ? 360 : -360}deg`,
              scale: 1.08,
              translateY: index % 2 === 0 ? -4 : 4,
            }
          : { rotate: "0deg", scale: isHighlight ? 1.08 : 1, translateY: 0 }
      }
      transition={
        animateShuffle
          ? { type: "timing", duration: 180, loop: true }
          : { type: "timing", duration: 280 }
      }
      style={{
        borderRadius: px * 0.28,
        borderWidth: isHighlight ? Math.max(2, ring + 1) : ring,
        borderColor: isHighlight ? accent : isWild ? secondary : "transparent",
        backgroundColor: isHighlight ? `${accent}55` : "transparent",
        padding: isHighlight ? 1 : 0,
        opacity: revealing && !isHighlight && !shuffling ? 0.42 : 1,
      }}
    >
      <Die
        face={face}
        color={shown ? (isHighlight ? accent : primary) : border}
        pipColor={shown && isHighlight ? textPrimary : "#FFFFFF"}
        size={px}
      />
    </MotiView>
  );
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
  shuffling = false,
}: DiceRowProps) {
  const { colors, radii } = useTheme();
  const { width } = useHydrationSafeWindowDimensions();
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
        const isHighlight = shown && !shuffling && !!highlightValues?.includes(value);
        const isWild =
          shown &&
          !shuffling &&
          !!wildValue &&
          value === 1 &&
          !highlightValues?.includes(1 as DieFace);
        const revealing = shown && !!highlightValues?.length;

        return (
          <ShufflingDieSlot
            key={i}
            value={value}
            index={i}
            hidden={!!hidden}
            shuffling={shuffling}
            isHighlight={isHighlight}
            isWild={isWild}
            revealing={revealing}
            px={px}
            ring={ring}
            accent={colors.accent}
            secondary={colors.secondary}
            primary={colors.primary}
            textPrimary={colors.textPrimary}
            border={colors.border}
          />
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
