import React, { useEffect, useState } from "react";
import { Pressable, Text, View, useWindowDimensions } from "react-native";
import { probabilityAtLeastWithKnown } from "../../engine/probability";
import { getLegalBidRange, isLegalBid } from "../../engine/rules";
import type { Bid, DieValue, GameState } from "../../engine/types";
import { getBreakpoint } from "../../lib/breakpoints";
import { useTheme } from "../../theme/ThemeProvider";
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
  const { width } = useWindowDimensions();
  const compact = getBreakpoint(width) === "phone";
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
  const ownMatches = player.dice.filter(
    (d) => d === faceValue || (state.onesWild && d === 1 && faceValue !== 1),
  ).length;

  const probability = legal
    ? probabilityAtLeastWithKnown(quantity, faceValue, unknownDice, ownMatches, state.onesWild)
    : 0;
  const probColor = probability > 0.5 ? colors.secondary : probability > 0.3 ? colors.accent : colors.danger;
  const chip = compact ? 34 : 36;

  return (
    <View style={{ gap: spacing.sm }}>
      <View
        style={{
          flexDirection: compact ? "column" : "row",
          alignItems: compact ? "stretch" : "flex-end",
          flexWrap: "wrap",
          gap: compact ? spacing.sm : spacing.md,
        }}
      >
        <View style={{ gap: 4 }}>
          <Text style={{ color: colors.textSecondary, fontFamily: typography.caption.fontFamily, fontSize: 11 }}>
            Quantity
          </Text>
          <View className="flex-row items-center" style={{ gap: spacing.sm }}>
            <StepperButton label="-" disabled={quantity <= 1} onPress={() => setQuantity((q) => Math.max(1, q - 1))} />
            <Text
              style={{
                color: colors.textPrimary,
                fontFamily: typography.h2.fontFamily,
                fontSize: compact ? 22 : 24,
                minWidth: 28,
                textAlign: "center",
              }}
            >
              {quantity}
            </Text>
            <StepperButton
              label="+"
              disabled={quantity >= range.maxQuantity}
              onPress={() => setQuantity((q) => Math.min(range.maxQuantity, q + 1))}
            />
          </View>
        </View>

        {!compact ? (
          <Text style={{ color: colors.textSecondary, fontFamily: typography.h3.fontFamily, fontSize: 18, marginBottom: 6 }}>
            ×
          </Text>
        ) : null}

        <View style={{ gap: 4, flex: compact ? undefined : 1, width: compact ? "100%" : undefined }}>
          <Text style={{ color: colors.textSecondary, fontFamily: typography.caption.fontFamily, fontSize: 11 }}>
            Face
          </Text>
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
                    width: chip,
                    height: chip,
                    borderRadius: radii.sm,
                    alignItems: "center",
                    justifyContent: "center",
                    opacity: disabled ? 0.3 : 1,
                    backgroundColor: selected ? colors.primary : colors.surface,
                    borderWidth: 1,
                    borderColor: selected ? colors.primary : colors.border,
                  }}
                >
                  <Text
                    style={{
                      color: selected ? colors.primaryText : colors.textPrimary,
                      fontFamily: typography.bodySemibold.fontFamily,
                      fontSize: 15,
                    }}
                  >
                    {face}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </View>
      </View>

      {showHints && legal ? (
        <Text style={{ fontFamily: typography.caption.fontFamily, fontSize: 12, color: colors.textSecondary }}>
          You hold {ownMatches} matching {ownMatches === 1 ? "die" : "dice"}. Chance:{" "}
          <Text style={{ color: probColor, fontFamily: typography.bodySemibold.fontFamily }}>
            {(probability * 100).toFixed(0)}%
          </Text>
        </Text>
      ) : null}

      <Button
        label={legal ? `Bid ${quantity} × ${faceValue}s` : "Invalid Bid"}
        disabled={!legal}
        fullWidth
        onPress={() => legal && onBid(bid)}
      />
    </View>
  );
}
