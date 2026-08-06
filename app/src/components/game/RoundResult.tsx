import { MotiView } from "moti";
import React from "react";
import { Text, View } from "react-native";
import type { DieValue, GameState } from "../../engine/types";
import { headingProps } from "../../lib/heading";
import { useTheme } from "../../theme/ThemeProvider";
import { Button } from "../ui/Button";
import { DiceRow } from "./DiceDisplay";

interface RoundResultProps {
  state: GameState;
  onContinue: () => void;
  animating: boolean;
}

export function RoundResult({ state, onContinue, animating }: RoundResultProps) {
  const { colors, radii, spacing, typography } = useTheme();
  const result = state.lastRoundResult;
  if (!result) return null;

  const challenger = state.players.find((p) => p.id === result.challenger);
  const bidder = state.players.find((p) => p.id === result.challengedPlayer);
  const loser = state.players.find((p) => p.id === result.loser);
  const isSpotOn = result.challengeType === "spot-on";
  const resultColor = result.challengerWins ? colors.secondary : colors.danger;

  return (
    <View style={{ backgroundColor: colors.surfaceRaised, borderRadius: radii.lg, padding: spacing.lg, gap: spacing.md }}>
      <Text
        {...headingProps(2)}
        style={{ color: colors.accent, fontFamily: typography.h2.fontFamily, fontSize: 22, textAlign: "center" }}
      >
        {isSpotOn ? "Spot On!" : "Liar Called!"}
      </Text>

      <Text style={{ color: colors.textSecondary, fontFamily: typography.body.fontFamily, fontSize: 14, textAlign: "center" }}>
        <Text style={{ color: colors.textPrimary, fontFamily: typography.bodySemibold.fontFamily }}>{challenger?.name}</Text>
        {isSpotOn ? " called Spot On on " : " challenged "}
        <Text style={{ color: colors.textPrimary, fontFamily: typography.bodySemibold.fontFamily }}>{bidder?.name}</Text>
        &apos;s bid of{" "}
        <Text style={{ color: colors.accent, fontFamily: typography.bodySemibold.fontFamily }}>
          {result.currentBid.quantity} &times; {result.currentBid.faceValue}s
        </Text>
      </Text>

      <View style={{ gap: spacing.sm }}>
        {Object.entries(result.allDice).map(([playerId, dice], index) => {
          const player = state.players.find((p) => p.id === playerId);
          return (
            <MotiView
              key={playerId}
              from={{ opacity: animating ? 0 : 1, translateY: animating ? 12 : 0 }}
              animate={{ opacity: 1, translateY: 0 }}
              transition={{ type: "timing", duration: 350, delay: index * 120 }}
              style={{ backgroundColor: colors.surface, borderRadius: radii.sm, padding: spacing.sm }}
            >
              <Text style={{ color: colors.textSecondary, fontFamily: typography.caption.fontFamily, fontSize: 11, marginBottom: 4 }}>
                {player?.name}
              </Text>
              <DiceRow dice={dice as DieValue[]} size="sm" highlightValues={[result.currentBid.faceValue]} wildValue={state.onesWild} />
            </MotiView>
          );
        })}
      </View>

      <View style={{ alignItems: "center", gap: 4 }}>
        <Text style={{ color: colors.textSecondary, fontFamily: typography.body.fontFamily, fontSize: 14 }}>
          Actual count: <Text style={{ color: resultColor, fontFamily: typography.h3.fontFamily, fontSize: 18 }}>{result.actualCount}</Text>{" "}
          (bid was {result.currentBid.quantity})
        </Text>
        <Text style={{ color: resultColor, fontFamily: typography.h3.fontFamily, fontSize: 17, marginTop: 4 }}>
          {result.challengerWins ? `${challenger?.name} wins the challenge!` : `${challenger?.name} loses the challenge!`}
        </Text>
        {loser && loser.id !== "" ? (
          <Text style={{ color: colors.textSecondary, fontFamily: typography.body.fontFamily, fontSize: 13 }}>
            {loser.name} loses a die{loser.diceCount <= 0 ? " and is eliminated!" : "."}
            {result.diceGained ? ` ${challenger?.name} gains a die!` : ""}
          </Text>
        ) : null}
      </View>

      <Button label={state.gameOver ? "See Results" : "Next Round"} fullWidth onPress={onContinue} />
    </View>
  );
}
