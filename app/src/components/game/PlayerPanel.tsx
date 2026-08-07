import React from "react";
import { Text, View, useWindowDimensions } from "react-native";
import type { DieValue, Player } from "../../engine/types";
import { getBreakpoint } from "../../lib/breakpoints";
import { useTheme } from "../../theme/ThemeProvider";
import { DiceRow } from "./DiceDisplay";

interface PlayerPanelProps {
  player: Player;
  isCurrentTurn: boolean;
  isHuman: boolean;
  showDice: boolean;
  highlightValues?: DieValue[];
  onesWild: boolean;
  lastAction?: string;
  /** Fixed seat width for opponent grid; omit for full-width human seat. */
  seatWidth?: number;
}

export function PlayerPanel({
  player,
  isCurrentTurn,
  isHuman,
  showDice,
  highlightValues,
  onesWild,
  lastAction,
  seatWidth,
}: PlayerPanelProps) {
  const { colors, radii, spacing, typography } = useTheme();
  const { width } = useWindowDimensions();
  const compact = getBreakpoint(width) === "phone";

  const seatStyle = isHuman
    ? { width: "100%" as const, maxWidth: "100%" as const }
    : seatWidth != null
      ? { width: seatWidth, maxWidth: "100%" as const }
      : { flexGrow: 1, flexBasis: 140, maxWidth: "100%" as const };

  if (player.isEliminated) {
    return (
      <View
        style={{
          ...seatStyle,
          opacity: 0.45,
          gap: 4,
          padding: compact ? spacing.xs : spacing.sm,
          borderRadius: radii.sm,
          borderWidth: 1,
          borderColor: colors.border,
        }}
      >
        <Text
          style={{
            color: colors.textSecondary,
            fontFamily: typography.bodySemibold.fontFamily,
            fontSize: 13,
            textDecorationLine: "line-through",
          }}
          numberOfLines={1}
        >
          {player.name}
        </Text>
        <Text style={{ color: colors.danger, fontFamily: typography.caption.fontFamily, fontSize: 11 }}>Eliminated</Text>
      </View>
    );
  }

  return (
    <View
      style={{
        ...seatStyle,
        gap: spacing.xs,
        padding: compact ? spacing.xs + 2 : spacing.sm,
        borderRadius: radii.sm,
        borderWidth: 1,
        borderColor: isCurrentTurn ? colors.accent : colors.border,
        backgroundColor: isHuman ? colors.surfaceRaised : "transparent",
      }}
    >
      <View className="flex-row items-center justify-between" style={{ gap: spacing.xs }}>
        <View className="flex-row items-center" style={{ gap: 6, flexShrink: 1, minWidth: 0 }}>
          <Text
            style={{
              color: isCurrentTurn ? colors.accent : colors.textPrimary,
              fontFamily: typography.bodySemibold.fontFamily,
              fontSize: isHuman ? (compact ? 14 : 15) : 13,
              flexShrink: 1,
            }}
            numberOfLines={1}
          >
            {isHuman ? "You" : player.name}
          </Text>
          {isCurrentTurn ? (
            <Text style={{ color: colors.accent, fontFamily: typography.caption.fontFamily, fontSize: 11 }}>turn</Text>
          ) : null}
        </View>
        <Text style={{ color: colors.textSecondary, fontFamily: typography.caption.fontFamily, fontSize: 11 }}>
          {player.diceCount}
        </Text>
      </View>

      {lastAction ? (
        <Text
          style={{ color: colors.textSecondary, fontFamily: typography.caption.fontFamily, fontSize: 11 }}
          numberOfLines={1}
        >
          {lastAction}
        </Text>
      ) : null}

      <DiceRow
        dice={player.dice}
        size={isHuman ? "lg" : "sm"}
        hidden={!isHuman && !showDice}
        highlightValues={highlightValues}
        wildValue={onesWild}
        bare
      />
    </View>
  );
}
