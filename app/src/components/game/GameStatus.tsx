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
  const lastBidder = state.lastBidder ? state.players.find((p) => p.id === state.lastBidder) : null;

  const meta = `Round ${state.roundNumber} · ${activePlayers} players · ${totalDice} dice`;
  const mode = state.isPalificoRound ? "Palifico" : state.onesWild ? "Aces wild" : "No wilds";

  return (
    <View style={{ gap: spacing.xs, marginBottom: spacing.sm }}>
      <View className="flex-row flex-wrap items-center justify-between" style={{ gap: spacing.sm }}>
        <Text style={{ color: colors.textSecondary, fontFamily: typography.caption.fontFamily, fontSize: 12 }}>
          {meta}
        </Text>
        <Text
          style={{
            color: state.isPalificoRound ? colors.danger : state.onesWild ? colors.secondary : colors.textSecondary,
            fontFamily: typography.caption.fontFamily,
            fontSize: 12,
          }}
        >
          {mode}
        </Text>
      </View>

      <View className="flex-row flex-wrap items-baseline justify-between" style={{ gap: spacing.sm }}>
        {state.currentBid ? (
          <Text style={{ color: colors.textPrimary, fontFamily: typography.h3.fontFamily, fontSize: 18 }}>
            {state.currentBid.quantity} × {state.currentBid.faceValue}s
            <Text style={{ color: colors.textSecondary, fontFamily: typography.caption.fontFamily, fontSize: 13 }}>
              {" "}
              · {lastBidder?.name ?? "Unknown"}
            </Text>
          </Text>
        ) : (
          <Text style={{ color: colors.textSecondary, fontFamily: typography.body.fontFamily, fontSize: 14 }}>
            No bid yet — open the round
          </Text>
        )}

        {phase === "ai-thinking" ? (
          <Text style={{ color: colors.accent, fontFamily: typography.bodyMedium.fontFamily, fontSize: 13 }}>
            {currentPlayer.name} is thinking…
          </Text>
        ) : null}
        {phase === "playing" && !currentPlayer.isAI ? (
          <Text style={{ color: colors.accent, fontFamily: typography.bodySemibold.fontFamily, fontSize: 13 }}>
            Your turn
          </Text>
        ) : null}
      </View>
    </View>
  );
}
