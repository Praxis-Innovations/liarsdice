import React, { useEffect, useState } from "react";
import { Pressable, Text, View } from "react-native";
import { getLegalBidRange, isLegalBid } from "../../engine/rules";
import { probabilityAtLeastWithKnown } from "../../engine/probability";
import type { Bid, DieValue, GameState } from "../../engine/types";
import { useTheme } from "../../theme/ThemeProvider";
import { Die } from "../shared/Die";
import { Button } from "../ui/Button";
import { StepperButton } from "../ui/Stepper";

interface BidPanelProps {
  state: GameState;
  onBid: (bid: Bid) => void;
  showHints: boolean;
}

const FACES: DieValue[] = [1, 2, 3, 4, 5, 6];

export function BidPanel({ state, onBid, showHints }: BidPanelProps) {
  const { colors, radii, spacing, typography } = useTheme();
  const range = getLegalBidRange(state.currentBid, state);
  const [quantity, setQuantity] = useState(range.minQuantity);
  const [faceValue, setFaceValue] = useState<DieValue>(range.minFaceValue);

  useEffect(() => {
    const newRange = getLegalBidRange(state.currentBid, state);
    setQuantity(newRange.minQuantity);
    setFaceValue(newRange.minFaceValue);
  }, [state.currentBid, state.roundNumber]);

  const bid: Bid = { quantity, faceValue };
  const legal = isLegalBid(bid, state.currentBid, state);

  const player = state.players.find((p) => p.id === "human")!;
  const totalDice = state.players.reduce((sum, p) => sum + (p.isEliminated ? 0 : p.diceCount), 0);
  const unknownDice = totalDice - player.diceCount;
  const ownMatches = player.dice.filter((d) => d === faceValue || (state.onesWild && d === 1 && faceValue !== 1)).length;

  const probability = legal ? probabilityAtLeastWithKnown(quantity, faceValue, unknownDice, ownMatches, state.onesWild) : 0;
  const probColor = probability > 0.5 ? colors.secondary : probability > 0.3 ? colors.accent : colors.danger;

  return (
    <View style={{ backgroundColor: colors.surfaceRaised, borderRadius: radii.md, padding: spacing.md, gap: spacing.sm }}>
      <Text style={{ color: colors.accent, fontFamily: typography.bodySemibold.fontFamily, fontSize: 13 }}>Place Your Bid</Text>

      <View className="flex-row items-center" style={{ gap: spacing.md }}>
        <View style={{ gap: 4 }}>
          <Text style={{ color: colors.textSecondary, fontFamily: typography.caption.fontFamily, fontSize: 11 }}>Quantity</Text>
          <View className="flex-row items-center" style={{ gap: spacing.sm }}>
            <StepperButton label="-" disabled={quantity <= 1} onPress={() => setQuantity((q) => Math.max(1, q - 1))} />
            <Text style={{ color: colors.textPrimary, fontFamily: typography.h2.fontFamily, fontSize: 22, width: 32, textAlign: "center" }}>
              {quantity}
            </Text>
            <StepperButton
              label="+"
              disabled={quantity >= range.maxQuantity}
              onPress={() => setQuantity((q) => Math.min(range.maxQuantity, q + 1))}
            />
          </View>
        </View>

        <Text style={{ color: colors.textSecondary, fontSize: 20 }}>&times;</Text>

        <View style={{ gap: 4, flex: 1 }}>
          <Text style={{ color: colors.textSecondary, fontFamily: typography.caption.fontFamily, fontSize: 11 }}>Face Value</Text>
          <View className="flex-row flex-wrap" style={{ gap: 6 }}>
            {FACES.map((face) => {
              const disabled = !!(state.isPalificoRound && state.currentBid && face !== state.currentBid.faceValue);
              const selected = face === faceValue;
              return (
                <Pressable
                  key={face}
                  disabled={disabled}
                  onPress={() => setFaceValue(face)}
                  style={{
                    opacity: disabled ? 0.3 : 1,
                    borderRadius: 12,
                    borderWidth: selected ? 3 : 0,
                    borderColor: colors.accent,
                  }}
                >
                  <Die face={face} color={colors.surface} pipColor={colors.textPrimary} size={34} />
                </Pressable>
              );
            })}
          </View>
        </View>
      </View>

      {showHints && legal ? (
        <Text style={{ fontFamily: typography.caption.fontFamily, fontSize: 12, color: colors.textSecondary }}>
          You hold {ownMatches} matching {ownMatches === 1 ? "die" : "dice"}. Probability:{" "}
          <Text style={{ color: probColor, fontFamily: typography.bodySemibold.fontFamily }}>{(probability * 100).toFixed(0)}%</Text>
        </Text>
      ) : null}

      <Button label={legal ? `Bid ${quantity} × ${faceValue}s` : "Invalid Bid"} disabled={!legal} fullWidth onPress={() => legal && onBid(bid)} />

      {state.currentBid ? (
        <Text style={{ color: colors.textSecondary, fontFamily: typography.caption.fontFamily, fontSize: 11, textAlign: "center" }}>
          Current bid: {state.currentBid.quantity} &times; {state.currentBid.faceValue}s
          {state.lastBidder ? ` by ${state.players.find((p) => p.id === state.lastBidder)?.name}` : ""}
        </Text>
      ) : null}
    </View>
  );
}
