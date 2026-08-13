import { Ionicons } from "@expo/vector-icons";
import React, { useEffect, useState } from "react";
import { LayoutChangeEvent, Pressable, Text, View } from "react-native";
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
/** Caption line (12px type + margin) shared so Qty / Face / Bid columns align. */
const CAPTION_BLOCK = 18;

/** Default qty: open at 1, otherwise one above the last bid (most common raise). */
function defaultBidQuantity(
  currentBid: Bid | null,
  range: { minQuantity: number; maxQuantity: number },
): number {
  if (!currentBid) return range.minQuantity;
  return Math.min(Math.max(currentBid.quantity + 1, range.minQuantity), range.maxQuantity);
}

/** Default face: open at min face, otherwise keep the last bid's face. */
function defaultBidFace(currentBid: Bid | null, range: { minFaceValue: DieValue }): DieValue {
  return currentBid?.faceValue ?? range.minFaceValue;
}

export function BidPanel({
  state,
  onBid,
  showHints,
  enabled = true,
  sizeTier = "compact",
}: BidPanelProps) {
  const { colors, spacing, typography, isDark } = useTheme();
  // Light: ivory dice. Dark: violet chips (reads better on purple surfaces).
  const faceDieColor = isDark ? "#A78BFA" : "#FFF8EE";
  const faceDiePip = isDark ? "#FFFFFF" : colors.textPrimary;
  const faceDieSelect = isDark ? "#A78BFA" : colors.textSecondary;
  const range = getLegalBidRange(state.currentBid, state);
  const [quantity, setQuantity] = useState(() => defaultBidQuantity(state.currentBid, range));
  const [faceValue, setFaceValue] = useState<DieValue>(() => defaultBidFace(state.currentBid, range));
  // Phone: measure the face strip so six chips fit exactly in the table width.
  const [facesRowW, setFacesRowW] = useState(0);

  useEffect(() => {
    const newRange = getLegalBidRange(state.currentBid, state);
    setQuantity(defaultBidQuantity(state.currentBid, newRange));
    setFaceValue(defaultBidFace(state.currentBid, newRange));
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
  const preferredFaceCell = faceSize + 6;
  const faceRowWidth = (cell: number) => cell * FACES.length + faceGap * (FACES.length - 1);
  // Exact width of the six face chips so the label shares that box (tablet+).
  const facesWidth = faceRowWidth(preferredFaceCell);
  // Mobile: shrink chips if Qty + Face would overflow the centered row.
  const qtyReserve = 110;
  const fittedFaceCell =
    compactControls && facesRowW > 0
      ? Math.max(
          22,
          Math.min(
            preferredFaceCell,
            Math.floor(
              (facesRowW - qtyReserve - faceGap * (FACES.length - 1)) / FACES.length,
            ),
          ),
        )
      : preferredFaceCell;
  const fittedDieSize = Math.max(14, fittedFaceCell - 6);
  const controlRowH = compactControls ? fittedFaceCell : preferredFaceCell;

  const onFacesRowLayout = (e: LayoutChangeEvent) => {
    const w = e.nativeEvent.layout.width;
    if (w > 0 && Math.abs(w - facesRowW) > 0.5) setFacesRowW(w);
  };

  const caption = (label: string, width?: number | `${number}%`) => (
    <Text
      style={{
        color: colors.textSecondary,
        fontFamily: typography.caption.fontFamily,
        fontSize: 12,
        lineHeight: 16,
        textAlign: "center",
        width: width ?? "100%",
        height: CAPTION_BLOCK,
      }}
    >
      {label}
    </Text>
  );

  const faceChips = (cell: number, diePx: number) => {
    const rowW = faceRowWidth(cell);
    return (
      <View
        style={{
          flexDirection: "row",
          width: rowW,
          gap: faceGap,
          height: cell,
          justifyContent: "flex-start",
          flexWrap: "nowrap",
        }}
      >
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
                width: cell,
                height: cell,
                flexGrow: 0,
                flexShrink: 0,
                borderRadius: 8,
                alignItems: "center",
                justifyContent: "center",
                opacity: disabled ? 0.35 : 1,
              backgroundColor: selected
                ? isDark
                  ? `${faceDieSelect}33`
                  : `${colors.textSecondary}22`
                : "transparent",
              borderWidth: selected ? 2 : 1,
              borderColor: selected ? faceDieSelect : colors.border,
            }}
          >
            <Die
              face={face}
              color={faceDieColor}
              pipColor={faceDiePip}
              size={diePx}
            />
            </Pressable>
          );
        })}
      </View>
    );
  };

  const qtyControls = (
    <View
      style={{
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        gap: 6,
        height: controlRowH,
      }}
    >
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

  const bidIcon = (
    <Ionicons
      name="arrow-up-circle"
      size={compactControls ? 16 : 18}
      color={colors.primaryText}
    />
  );

  // Mobile: match Liar!/Spot On! height. Tablet+: match the dice row.
  const bidButton = (matchDiceHeight: boolean) => (
    <Button
      label={!enabled ? "Waiting…" : legal ? `Bid ${quantity}×${faceValue}s` : "Invalid"}
      disabled={!legal}
      fullWidth
      compact={compactControls}
      onPress={() => legal && onBid(bid)}
      icon={bidIcon}
      style={
        matchDiceHeight
          ? { height: controlRowH, paddingVertical: 0, justifyContent: "center" }
          : { paddingVertical: 12 }
      }
    />
  );

  return (
    <View style={{ gap: sizeTier === "compact" ? 8 : 12, opacity: enabled ? 1 : 0.85, width: "100%" }}>
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
            onLayout={onFacesRowLayout}
          >
            <View style={{ alignItems: "center", flexShrink: 0 }}>
              {caption("Qty")}
              {qtyControls}
            </View>
            <View style={{ alignItems: "center", flexShrink: 0 }}>
              {caption("Face", faceRowWidth(fittedFaceCell))}
              {faceChips(fittedFaceCell, fittedDieSize)}
            </View>
          </View>
          <View style={{ width: "100%" }}>{bidButton(false)}</View>
        </>
      ) : (
        <View
          style={{
            flexDirection: "row",
            alignItems: "flex-start",
            gap: spacing.sm,
            width: "100%",
          }}
        >
          <View style={{ alignItems: "center", flexShrink: 0 }}>
            {caption("Qty")}
            {qtyControls}
          </View>
          <View style={{ alignItems: "center", flexShrink: 0 }}>
            {caption("Face", facesWidth)}
            {faceChips(preferredFaceCell, faceSize - 2)}
          </View>
          <View
            style={{
              marginLeft: "auto",
              width: sizeTier === "roomy" ? 200 : 180,
              flexShrink: 0,
            }}
          >
            {/* Spacer matches Qty/Face captions so the button lines up with the dice. */}
            <View style={{ height: CAPTION_BLOCK }} />
            {bidButton(true)}
          </View>
        </View>
      )}

      <View style={{ height: 16 }}>
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
    </View>
  );
}
