import React from "react";
import { Text, View } from "react-native";
import type { DieValue, Player } from "../../engine/types";
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
}

export function PlayerPanel({ player, isCurrentTurn, isHuman, showDice, highlightValues, onesWild, lastAction }: PlayerPanelProps) {
  const { colors, radii, spacing, typography } = useTheme();

  if (player.isEliminated) {
    return (
      <View style={{ backgroundColor: colors.surfaceRaised, borderRadius: radii.md, padding: spacing.sm, opacity: 0.4, minWidth: 240, flexGrow: 1 }}>
        <View className="flex-row items-center" style={{ gap: spacing.xs }}>
          <Text style={{ color: colors.textSecondary, fontFamily: typography.bodySemibold.fontFamily, fontSize: 13, textDecorationLine: "line-through" }}>
            {player.name}
          </Text>
          <Text style={{ color: colors.danger, fontFamily: typography.caption.fontFamily, fontSize: 11 }}>Eliminated</Text>
        </View>
      </View>
    );
  }

  return (
    <View
      style={{
        backgroundColor: colors.surfaceRaised,
        borderRadius: radii.md,
        padding: spacing.sm,
        borderWidth: isCurrentTurn ? 2 : 0,
        borderColor: colors.accent,
        minWidth: 240,
        flexGrow: 1,
        gap: spacing.xs,
      }}
    >
      <View className="flex-row items-center justify-between">
        <View className="flex-row items-center" style={{ gap: spacing.xs }}>
          <Text
            style={{
              color: isCurrentTurn ? colors.accent : colors.textPrimary,
              fontFamily: typography.bodySemibold.fontFamily,
              fontSize: 13,
            }}
          >
            {player.name}
          </Text>
          {isHuman && (
            <View style={{ backgroundColor: `${colors.accent}22`, borderRadius: 999, paddingHorizontal: 6, paddingVertical: 1 }}>
              <Text style={{ color: colors.accent, fontFamily: typography.caption.fontFamily, fontSize: 10 }}>You</Text>
            </View>
          )}
        </View>
        <Text style={{ color: colors.textSecondary, fontFamily: typography.body.fontFamily, fontSize: 12 }}>
          {"■".repeat(player.diceCount)}
        </Text>
      </View>

      {lastAction ? (
        <Text style={{ color: colors.textSecondary, fontFamily: typography.body.fontFamily, fontSize: 11, fontStyle: "italic" }}>
          {lastAction}
        </Text>
      ) : null}

      {isHuman || showDice ? (
        <DiceRow dice={player.dice} size="sm" hidden={!isHuman && !showDice} highlightValues={highlightValues} wildValue={onesWild} />
      ) : (
        <DiceRow dice={player.dice} size="sm" hidden />
      )}
    </View>
  );
}
