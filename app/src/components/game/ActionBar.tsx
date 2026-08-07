import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { View } from "react-native";
import { probabilityAtLeastWithKnown } from "../../engine/probability";
import { canChallenge, canSpotOn } from "../../engine/rules";
import type { GameState } from "../../engine/types";
import { useTheme } from "../../theme/ThemeProvider";
import { Button } from "../ui/Button";

interface ActionBarProps {
  state: GameState;
  onChallenge: () => void;
  onSpotOn: () => void;
  showHints: boolean;
  /** When false, buttons stay visible but disabled. */
  enabled?: boolean;
}

export function ActionBar({ state, onChallenge, onSpotOn, showHints, enabled = true }: ActionBarProps) {
  const { colors, spacing } = useTheme();
  const challengeEnabled = enabled && canChallenge(state);
  const spotOnEnabled = enabled && canSpotOn(state);

  let challengeLabel = "Liar!";

  if (showHints && state.currentBid && challengeEnabled) {
    const player = state.players.find((p) => p.id === "human")!;
    const totalDice = state.players.reduce((sum, p) => sum + (p.isEliminated ? 0 : p.diceCount), 0);
    const unknownDice = totalDice - player.diceCount;
    const ownMatches = player.dice.filter(
      (d) => d === state.currentBid!.faceValue || (state.onesWild && d === 1 && state.currentBid!.faceValue !== 1),
    ).length;

    const prob = probabilityAtLeastWithKnown(
      state.currentBid.quantity,
      state.currentBid.faceValue,
      unknownDice,
      ownMatches,
      state.onesWild,
    );
    challengeLabel = `Liar! (${(prob * 100).toFixed(0)}%)`;
  }

  const actionStyle = { paddingVertical: 12 };

  return (
    <View style={{ flexDirection: "row", gap: spacing.sm }}>
      <View style={{ flex: 1 }}>
        <Button
          label={challengeLabel}
          variant="danger"
          fullWidth
          compact
          disabled={!challengeEnabled}
          onPress={onChallenge}
          style={actionStyle}
          icon={<Ionicons name="flash" size={16} color={colors.danger} />}
        />
      </View>
      {state.settings.enableSpotOn ? (
        <View style={{ flex: 1 }}>
          <Button
            label="Spot On!"
            variant="secondary"
            fullWidth
            compact
            disabled={!spotOnEnabled}
            onPress={onSpotOn}
            style={actionStyle}
            icon={<Ionicons name="checkmark-circle" size={16} color={colors.secondaryText} />}
          />
        </View>
      ) : null}
    </View>
  );
}
