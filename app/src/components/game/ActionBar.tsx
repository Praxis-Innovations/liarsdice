import React from "react";
import { View } from "react-native";
import { canChallenge, canSpotOn } from "../../engine/rules";
import { probabilityAtLeastWithKnown } from "../../engine/probability";
import type { GameState } from "../../engine/types";
import { useTheme } from "../../theme/ThemeProvider";
import { Button } from "../ui/Button";

interface ActionBarProps {
  state: GameState;
  onChallenge: () => void;
  onSpotOn: () => void;
  showHints: boolean;
}

export function ActionBar({ state, onChallenge, onSpotOn, showHints }: ActionBarProps) {
  const { spacing } = useTheme();
  const challengeEnabled = canChallenge(state);
  const spotOnEnabled = canSpotOn(state);

  let challengeLabel = "Liar!";

  if (showHints && state.currentBid && challengeEnabled) {
    const player = state.players.find((p) => p.id === "human")!;
    const totalDice = state.players.reduce((sum, p) => sum + (p.isEliminated ? 0 : p.diceCount), 0);
    const unknownDice = totalDice - player.diceCount;
    const ownMatches = player.dice.filter(
      (d) => d === state.currentBid!.faceValue || (state.onesWild && d === 1 && state.currentBid!.faceValue !== 1),
    ).length;

    const prob = probabilityAtLeastWithKnown(state.currentBid.quantity, state.currentBid.faceValue, unknownDice, ownMatches, state.onesWild);
    const verdict = prob > 0.5 ? "likely true" : prob > 0.3 ? "uncertain" : "likely false";
    challengeLabel = `Liar! (${verdict}, ${(prob * 100).toFixed(0)}%)`;
  }

  return (
    <View className="flex-row" style={{ gap: spacing.sm }}>
      <View style={{ flex: 1 }}>
        <Button label={challengeLabel} variant="danger" fullWidth disabled={!challengeEnabled} onPress={onChallenge} />
      </View>
      {state.settings.enableSpotOn ? (
        <View style={{ flex: 1 }}>
          <Button label="Spot On!" variant="secondary" fullWidth disabled={!spotOnEnabled} onPress={onSpotOn} />
        </View>
      ) : null}
    </View>
  );
}
