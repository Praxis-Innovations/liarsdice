import React, { useEffect, useState } from "react";
import { Pressable, Text, View } from "react-native";
import { probabilityAtLeastWithKnown } from "../../engine/probability";
import { getLegalBidRange, isLegalBid } from "../../engine/rules";
import type { Bid, DieValue, GameState } from "../../engine/types";
import { useTheme } from "../../theme/ThemeProvider";
import { Die } from "../shared/Die";
import { Button } from "../ui/Button";
import { StepperButton } from "../ui/Stepper";
import type { PlaySizeTier } from "./tableSeating";

interface BidPanelProps {
  state: GameState;
  onBid: (bid: Bid) => void;
  showHints: boolean;
  /** When false, controls stay visible but disabled. */
  enabled?: boolean;
  sizeTier?: PlaySizeTier;
}

const FACES: DieValue[] = [1, 2, 3, 4, 5, 6];

export function BidPanel({
  state,
  onBid,
  showHints,
  enabled = true,
  sizeTier = "compact",
}: BidPanelProps) {
  const { colors, spacing, typography } = useTheme();
  const range = getLegalBidRange(state.currentBid, state);
  const [quantity, setQuantity] = useState(range.minQuantity);
  const [faceValue, setFaceValue] = useState<DieValue>(range.minFaceValue);

  useEffect(() => {
    const newRange = getLegalBidRange(state.currentBid, state);
    setQuantity(newRange.minQuantity);
    setFaceValue(newRange.minFaceValue);
  }, [state.currentBid, state.roundNumber]);

  const bid: Bid = { quantity, faceValue };
  const legal = enabled && isLegalBid(bid, state.currentBid, state);

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
  const faceSize = sizeTier === "roomy" ? 45 : sizeTier === "regular" ? 40 : 30;
  const qtySize = sizeTier === "roomy" ? 35 : sizeTier === "regular" ? 30 : 24;
  const compactControls = sizeTier === "compact";
  const faceGap = sizeTier === "compact" ? 4 : 8;
  const faceCell = faceSize + 6;
  // Exact width of the six face chips so the label shares that box.
  const facesWidth = faceCell * FACES.length + faceGap * (FACES.length - 1);

  const caption = (label: string, width?: number) => (
    <Text
      style={{
        color: colors.textSecondary,
        fontFamily: typography.caption.fontFamily,
        fontSize: 12,
        textAlign: "center",
        width: width ?? "100%",
        marginBottom: 2,
      }}
    >
      {label}
    </Text>
  );

  const faceChips = (
    <View style={{ flexDirection: "row", width: facesWidth, gap: faceGap }}>
      {FACES.map((face) => {
        const faceLocked = !!(
          state.isPalificoRound &&
          state.currentBid &&
          face !== state.currentBid.faceValue
        );
        const disabled = !enabled || faceLocked;
        const selected = face === faceValue;
        return (
          <Pressable
            key={face}
            disabled={disabled}
            onPress={() => setFaceValue(face)}
            accessibilityLabel={`Face ${face}`}
            style={{
              width: faceCell,
              height: faceCell,
              borderRadius: 8,
              alignItems: "center",
              justifyContent: "center",
              opacity: disabled ? 0.35 : 1,
              backgroundColor: selected ? `${colors.primary}33` : "transparent",
              borderWidth: selected ? 2 : 1,
              borderColor: selected ? colors.primary : colors.border,
            }}
          >
            <Die
              face={face}
              color={colors.primary}
              pipColor={colors.primaryText}
              size={faceSize - 2}
            />
          </Pressable>
        );
      })}
    </View>
  );

  const qtyControls = (
    <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
      <StepperButton
        label="-"
        compact={compactControls}
        disabled={!enabled || quantity <= 1}
        onPress={() => setQuantity((q) => Math.max(1, q - 1))}
      />
      <Text
        style={{
          color: colors.textPrimary,
          fontFamily: typography.h2.fontFamily,
          fontSize: qtySize,
          minWidth: qtySize + 6,
          textAlign: "center",
        }}
      >
        {quantity}
      </Text>
      <StepperButton
        label="+"
        compact={compactControls}
        disabled={!enabled || quantity >= range.maxQuantity}
        onPress={() => setQuantity((q) => Math.min(range.maxQuantity, q + 1))}
      />
    </View>
  );

  const bidButton = (
    <Button
      label={!enabled ? "Waiting…" : legal ? `Bid ${quantity}×${faceValue}` : "Invalid"}
      disabled={!legal}
      fullWidth
      compact={compactControls}
      onPress={() => legal && onBid(bid)}
    />
  );

  return (
    <View style={{ gap: sizeTier === "compact" ? 8 : 12, opacity: enabled ? 1 : 0.85 }}>
      {compactControls ? (
        <>
          <View
            style={{
              flexDirection: "row",
              alignItems: "flex-start",
              justifyContent: "center",
              gap: spacing.md,
              width: "100%",
            }}
          >
            <View style={{ alignItems: "center" }}>
              {caption("Qty")}
              {qtyControls}
            </View>
            <View style={{ width: facesWidth, alignItems: "center" }}>
              {caption("Face", facesWidth)}
              {faceChips}
            </View>
          </View>
          <View style={{ width: "100%" }}>{bidButton}</View>
        </>
      ) : (
        <View className="flex-row flex-wrap items-end" style={{ gap: spacing.sm }}>
          <View style={{ gap: 2 }}>
            <Text
              style={{
                color: colors.textSecondary,
                fontFamily: typography.caption.fontFamily,
                fontSize: 12,
              }}
            >
              Qty
            </Text>
            {qtyControls}
          </View>
          <View style={{ gap: 2, flexGrow: 1, flexShrink: 1, minWidth: 0 }}>
            <Text
              style={{
                color: colors.textSecondary,
                fontFamily: typography.caption.fontFamily,
                fontSize: 12,
              }}
            >
              Face
            </Text>
            {faceChips}
          </View>
          <View
            style={{
              minWidth: 175,
              maxWidth: sizeTier === "roomy" ? 225 : 200,
              flexGrow: 0,
              justifyContent: "flex-end",
            }}
          >
            {bidButton}
          </View>
        </View>
      )}

      {showHints && enabled && legal ? (
        <Text
          style={{
            fontFamily: typography.caption.fontFamily,
            fontSize: 11,
            color: colors.textSecondary,
            textAlign: compactControls ? "center" : "left",
          }}
        >
          You hold {ownMatches} matching {ownMatches === 1 ? "die" : "dice"}. Chance:{" "}
          <Text style={{ color: probColor, fontFamily: typography.bodySemibold.fontFamily }}>
            {(probability * 100).toFixed(0)}%
          </Text>
        </Text>
      ) : null}
    </View>
  );
}
