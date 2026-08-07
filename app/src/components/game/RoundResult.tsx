import { MotiView } from "moti";
import React from "react";
import { Text, View } from "react-native";
import type { GameState, Player } from "../../engine/types";
import { headingProps } from "../../lib/heading";
import { useTheme } from "../../theme/ThemeProvider";
import { Button } from "../ui/Button";

interface RoundResultProps {
  state: GameState;
  onContinue: () => void;
  animating: boolean;
  /** Compact banner for table-center / phone dock (default). */
  compact?: boolean;
  /** Hard size cap from the table center air (tablet+) or phone dock width. */
  maxWidth?: number;
  maxHeight?: number;
}

function displayName(player: Player | undefined): string {
  if (!player) return "?";
  return player.id === "human" ? "You" : player.name;
}

/** Challenge / Spot On result card. */
export function RoundResult({
  state,
  onContinue,
  animating,
  compact = true,
  maxWidth,
  maxHeight,
}: RoundResultProps) {
  const { colors, radii, spacing, typography } = useTheme();
  const result = state.lastRoundResult;
  if (!result) return null;

  const challenger = state.players.find((p) => p.id === result.challenger);
  const bidder = state.players.find((p) => p.id === result.challengedPlayer);
  const loser = state.players.find((p) => p.id === result.loser);
  const isSpotOn = result.challengeType === "spot-on";
  const resultColor = result.challengerWins ? colors.secondary : colors.danger;
  const challengerName = displayName(challenger);
  const bidderName = displayName(bidder);
  const loserName = displayName(loser);

  const pad = compact ? spacing.sm : spacing.lg;
  const titleSize = compact ? 20 : 28;
  const outcomeSize = compact ? 16 : 24;
  const valueSize = compact ? 18 : 24;
  const cardMaxW = maxWidth ?? (compact ? 280 : 480);

  const outcomeLine = result.challengerWins
    ? `${challengerName} wins`
    : `${challengerName} loses`;

  let consequence = "";
  if (loser && loser.id !== "") {
    consequence = `${loserName} loses a die`;
    if (loser.diceCount <= 0) consequence += " — out";
    if (result.diceGained) consequence += ` · ${challengerName} gains one`;
  }

  const callLine = isSpotOn
    ? `${challengerName} · Spot On`
    : `${challengerName} vs ${bidderName}`;

  return (
    <MotiView
      from={{ opacity: animating ? 0 : 1, scale: animating ? 0.96 : 1 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ type: "timing", duration: 280 }}
      style={{
        backgroundColor: colors.surfaceRaised,
        borderRadius: radii.md,
        padding: pad,
        gap: compact ? 6 : spacing.md,
        width: "100%",
        maxWidth: cardMaxW,
        maxHeight,
        borderWidth: 1,
        borderColor: colors.border,
        shadowColor: "#000",
        shadowOpacity: 0.12,
        shadowRadius: 10,
        shadowOffset: { width: 0, height: 3 },
        elevation: 4,
      }}
    >
      <View className="flex-row items-center justify-between" style={{ gap: 8 }}>
        <Text
          {...headingProps(2)}
          style={{
            color: colors.accent,
            fontFamily: typography.h2.fontFamily,
            fontSize: titleSize,
            flexShrink: 0,
          }}
        >
          {isSpotOn ? "Spot On!" : "Liar!"}
        </Text>
        <Text
          style={{
            color: resultColor,
            fontFamily: typography.h3.fontFamily,
            fontSize: outcomeSize,
            flex: 1,
            textAlign: "right",
          }}
          numberOfLines={1}
        >
          {outcomeLine}
        </Text>
      </View>

      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          gap: compact ? 6 : spacing.sm,
          paddingVertical: compact ? 6 : spacing.sm,
          paddingHorizontal: compact ? 8 : spacing.sm,
          borderRadius: radii.sm,
          backgroundColor: colors.surface,
        }}
      >
        <View style={{ flex: 1, alignItems: "center", gap: 1 }}>
          <Text
            style={{
              color: colors.textSecondary,
              fontFamily: typography.caption.fontFamily,
              fontSize: 10,
              letterSpacing: 0.4,
              textTransform: "uppercase",
            }}
          >
            Bid
          </Text>
          <Text
            style={{
              color: colors.textPrimary,
              fontFamily: typography.h3.fontFamily,
              fontSize: valueSize,
            }}
          >
            {result.currentBid.quantity}×{result.currentBid.faceValue}
          </Text>
          <Text
            style={{
              color: colors.textSecondary,
              fontFamily: typography.caption.fontFamily,
              fontSize: 11,
            }}
            numberOfLines={1}
          >
            {bidderName}
          </Text>
        </View>

        <View style={{ width: 1, alignSelf: "stretch", backgroundColor: colors.border }} />

        <View style={{ flex: 1, alignItems: "center", gap: 1 }}>
          <Text
            style={{
              color: colors.textSecondary,
              fontFamily: typography.caption.fontFamily,
              fontSize: 10,
              letterSpacing: 0.4,
              textTransform: "uppercase",
            }}
          >
            Actual
          </Text>
          <Text
            style={{
              color: resultColor,
              fontFamily: typography.h3.fontFamily,
              fontSize: valueSize,
            }}
          >
            {result.actualCount}
          </Text>
          <Text
            style={{
              color: colors.textSecondary,
              fontFamily: typography.caption.fontFamily,
              fontSize: 11,
            }}
            numberOfLines={1}
          >
            {isSpotOn ? "exact" : "on table"}
          </Text>
        </View>
      </View>

      <Text
        style={{
          color: colors.textSecondary,
          fontFamily: typography.caption.fontFamily,
          fontSize: 12,
          textAlign: "center",
        }}
        numberOfLines={1}
      >
        {callLine}
        {consequence ? ` · ${consequence}` : ""}
      </Text>

      <Button
        label={state.gameOver ? "See Results" : "Next Round"}
        variant="secondary"
        fullWidth
        compact={compact}
        onPress={onContinue}
      />
    </MotiView>
  );
}
