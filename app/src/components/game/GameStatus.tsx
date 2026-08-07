import React from "react";
import { Text, View } from "react-native";
import type { GameState } from "../../engine/types";
import { useTheme } from "../../theme/ThemeProvider";

interface GameStatusProps {
  state: GameState;
  phase: string;
  dense?: boolean;
}

function StatusBadge({
  label,
  color,
  fill,
  large = false,
}: {
  label: string;
  color: string;
  fill: string;
  large?: boolean;
}) {
  return (
    <View
      style={{
        paddingHorizontal: large ? 10 : 8,
        paddingVertical: large ? 5 : 3,
        borderRadius: 999,
        backgroundColor: fill,
        flexShrink: 1,
      }}
    >
      <Text
        style={{
          color,
          fontFamily: "Manrope_600SemiBold",
          fontSize: large ? 13 : 11,
          lineHeight: large ? 16 : 14,
        }}
        numberOfLines={1}
      >
        {label}
      </Text>
    </View>
  );
}

function MetaChip({ label, dense }: { label: string; dense?: boolean }) {
  const { colors, typography } = useTheme();
  return (
    <View
      style={{
        paddingHorizontal: dense ? 10 : 12,
        paddingVertical: dense ? 4 : 5,
        borderRadius: 999,
        backgroundColor: colors.surfaceRaised,
        borderWidth: 1,
        borderColor: colors.border,
        flexShrink: 1,
      }}
    >
      <Text
        style={{
          color: colors.textPrimary,
          fontFamily: typography.bodySemibold.fontFamily,
          fontSize: dense ? 12 : 14,
        }}
        numberOfLines={1}
      >
        {label}
      </Text>
    </View>
  );
}

/** Mode / turn badges for the play top bar (round + dice chips live beside these). */
export function GameStatus({ state, phase, dense = false }: GameStatusProps) {
  const { colors } = useTheme();
  const currentPlayer = state.players[state.currentPlayerIndex];

  let turnLabel: string | null = null;
  if (phase === "ai-thinking") turnLabel = `${currentPlayer.name}…`;
  else if (phase === "playing" && !currentPlayer.isAI) turnLabel = "Your turn";
  else if (phase === "playing") turnLabel = `${currentPlayer.name}'s turn`;
  else if (phase === "round-result") turnLabel = "Reveal";

  const modeLabel = state.isPalificoRound ? "Palifico" : state.onesWild ? "Aces wild" : "No wilds";
  const modeColor = state.isPalificoRound
    ? colors.danger
    : state.onesWild
      ? colors.secondary
      : colors.textSecondary;

  return (
    <View className="flex-row items-center" style={{ gap: 6 }}>
      <StatusBadge
        label={modeLabel}
        color={modeColor}
        fill={state.onesWild || state.isPalificoRound ? `${modeColor}22` : `${colors.border}88`}
        large={!dense}
      />
      {turnLabel ? (
        <StatusBadge label={turnLabel} color={colors.accent} fill={`${colors.accent}28`} large={!dense} />
      ) : null}
    </View>
  );
}

/** Round chip for the play top bar (left). */
export function RoundChip({ state, dense = false }: { state: GameState; dense?: boolean }) {
  return <MetaChip label={`Round ${state.roundNumber}`} dense={dense} />;
}

/** Total dice chip for the play top bar (center). */
export function DiceCountChip({ state, dense = false }: { state: GameState; dense?: boolean }) {
  const totalDice = state.players.reduce((sum, p) => sum + (p.isEliminated ? 0 : p.diceCount), 0);
  return <MetaChip label={`${totalDice} dice`} dense={dense} />;
}
