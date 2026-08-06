import React from "react";
import { Text, View } from "react-native";
import type { GameState } from "../../engine/types";
import { useTheme } from "../../theme/ThemeProvider";

interface GameStatusProps {
  state: GameState;
  phase: string;
}

export function GameStatus({ state, phase }: GameStatusProps) {
  const { colors, spacing, typography } = useTheme();
  const totalDice = state.players.reduce((sum, p) => sum + (p.isEliminated ? 0 : p.diceCount), 0);
  const activePlayers = state.players.filter((p) => !p.isEliminated).length;
  const currentPlayer = state.players[state.currentPlayerIndex];

  const badgeStyle = (bg: string) => ({
    backgroundColor: bg,
    borderRadius: 999,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
  });

  return (
    <View className="flex-row flex-wrap items-center justify-between" style={{ gap: spacing.sm, marginBottom: spacing.md }}>
      <View className="flex-row" style={{ gap: spacing.md }}>
        <Text style={{ color: colors.textSecondary, fontFamily: typography.caption.fontFamily, fontSize: 12 }}>
          Round {state.roundNumber}
        </Text>
        <Text style={{ color: colors.textSecondary, fontFamily: typography.caption.fontFamily, fontSize: 12 }}>
          {activePlayers} players
        </Text>
        <Text style={{ color: colors.textSecondary, fontFamily: typography.caption.fontFamily, fontSize: 12 }}>
          {totalDice} dice
        </Text>
      </View>

      <View className="flex-row" style={{ gap: spacing.sm }}>
        {state.isPalificoRound && (
          <View style={badgeStyle(`${colors.danger}22`)}>
            <Text style={{ color: colors.danger, fontFamily: typography.bodySemibold.fontFamily, fontSize: 11 }}>Palifico</Text>
          </View>
        )}
        {state.onesWild && (
          <View style={badgeStyle(`${colors.secondary}22`)}>
            <Text style={{ color: colors.secondary, fontFamily: typography.bodySemibold.fontFamily, fontSize: 11 }}>Aces Wild</Text>
          </View>
        )}
        {!state.onesWild && !state.isPalificoRound && (
          <View style={badgeStyle(colors.surface)}>
            <Text style={{ color: colors.textSecondary, fontFamily: typography.caption.fontFamily, fontSize: 11 }}>No Wilds</Text>
          </View>
        )}
      </View>

      <View>
        {phase === "ai-thinking" && (
          <Text style={{ color: colors.accent, fontFamily: typography.bodyMedium.fontFamily, fontSize: 12 }}>
            {currentPlayer.name} is thinking&hellip;
          </Text>
        )}
        {phase === "playing" && !currentPlayer.isAI && (
          <Text style={{ color: colors.accent, fontFamily: typography.bodySemibold.fontFamily, fontSize: 12 }}>Your turn</Text>
        )}
      </View>
    </View>
  );
}
