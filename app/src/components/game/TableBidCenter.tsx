import React, { useEffect, useRef } from "react";
import { ScrollView, Text, View } from "react-native";
import type { GameAction, GameState } from "../../engine/types";
import { useTheme } from "../../theme/ThemeProvider";
import type { PlaySizeTier } from "./tableSeating";

interface TableBidCenterProps {
  state: GameState;
  dense?: boolean;
  sizeTier?: PlaySizeTier;
  maxHeight?: number;
  maxWidth?: number;
}

function bidActions(history: GameAction[]): GameAction[] {
  return history.filter((a) => a.type === "bid" && a.bid);
}

function shortName(full: string, max = 12): string {
  if (full.length <= max) return full;
  return `${full.slice(0, max - 1)}…`;
}

/** Center-table bid log — prior bids scroll; current bid stays pinned. */
export function TableBidCenter({
  state,
  dense = false,
  sizeTier = "compact",
  maxHeight = 200,
  maxWidth = 200,
}: TableBidCenterProps) {
  const { colors, radii, typography } = useTheme();
  const scrollRef = useRef<ScrollView>(null);
  const bids = bidActions(state.roundHistory);
  const pad = sizeTier === "compact" ? 10 : sizeTier === "regular" ? 14 : 16;
  const cardMaxH = Math.max(sizeTier === "compact" ? 96 : 110, maxHeight);
  const tierCap = sizeTier === "roomy" ? 325 : sizeTier === "regular" ? 275 : 168;
  const cardMaxW = Math.max(sizeTier === "compact" ? 140 : 165, Math.min(maxWidth, tierCap));
  const currentSize = sizeTier === "roomy" ? 35 : sizeTier === "regular" ? 30 : dense ? 18 : 22;
  const priorSize = sizeTier === "roomy" ? 19 : sizeTier === "regular" ? 17 : dense ? 13 : 15;

  const prior = bids.length > 1 ? bids.slice(0, -1) : [];
  const current = bids.length > 0 ? bids[bids.length - 1] : null;

  useEffect(() => {
    if (prior.length === 0) return;
    // Keep the newest prior bid in view as the round grows.
    requestAnimationFrame(() => {
      scrollRef.current?.scrollToEnd({ animated: true });
    });
  }, [prior.length]);

  if (bids.length === 0 || !current) {
    return (
      <View
        pointerEvents="none"
        style={{
          alignItems: "center",
          justifyContent: "center",
          paddingHorizontal: pad + 4,
          paddingVertical: pad,
          borderRadius: radii.md,
          backgroundColor: colors.surfaceRaised,
          borderWidth: 1,
          borderColor: colors.border,
          maxWidth: cardMaxW,
          maxHeight: cardMaxH,
        }}
      >
        <Text
          style={{
            color: colors.textPrimary,
            fontFamily: typography.h3.fontFamily,
            fontSize: sizeTier === "roomy" ? 25 : sizeTier === "regular" ? 22 : 19,
            textAlign: "center",
          }}
        >
          Open the round
        </Text>
        <Text
          style={{
            color: colors.textSecondary,
            fontFamily: typography.caption.fontFamily,
            fontSize: 11,
            marginTop: 2,
            textAlign: "center",
          }}
        >
          No bid yet
        </Text>
      </View>
    );
  }

  const currentPlayer = state.players.find((p) => p.id === current.playerId);
  const currentName = current.playerId === "human" ? "You" : (currentPlayer?.name ?? "Unknown");
  const currentLabel = `${current.bid!.quantity} × ${current.bid!.faceValue}s`;
  const headerH = 22;
  const currentBlockH = sizeTier === "compact" ? 52 : 64;
  const dividerH = dense ? 9 : 13;
  const historyMaxH = Math.max(40, cardMaxH - headerH - currentBlockH - dividerH - pad * 2);

  return (
    <View
      pointerEvents="box-none"
      style={{
        width: cardMaxW,
        maxHeight: cardMaxH,
        borderRadius: radii.md,
        backgroundColor: colors.surfaceRaised,
        borderWidth: 1.5,
        borderColor: colors.accent,
        paddingHorizontal: pad,
        paddingTop: pad - 2,
        paddingBottom: pad - 2,
        overflow: "hidden",
      }}
    >
      <Text
        style={{
          color: colors.textSecondary,
          fontFamily: typography.caption.fontFamily,
          fontSize: 9,
          letterSpacing: 0.6,
          textTransform: "uppercase",
          textAlign: "center",
          marginBottom: 4,
        }}
      >
        Round bids
      </Text>

      {prior.length > 0 ? (
        <ScrollView
          ref={scrollRef}
          style={{ flexGrow: 0, flexShrink: 1, maxHeight: historyMaxH }}
          contentContainerStyle={{ gap: 4, paddingBottom: 4 }}
          showsVerticalScrollIndicator
          nestedScrollEnabled
          keyboardShouldPersistTaps="handled"
        >
          {prior.map((action, i) => {
            const player = state.players.find((p) => p.id === action.playerId);
            const name = action.playerId === "human" ? "You" : (player?.name ?? "?");
            const bid = action.bid!;
            return (
              <View
                key={`${action.playerId}-${i}-${bid.quantity}-${bid.faceValue}`}
                className="flex-row items-center justify-between"
                style={{ gap: 8 }}
              >
                <Text
                  style={{
                    color: colors.textSecondary,
                    fontFamily: typography.caption.fontFamily,
                    fontSize: priorSize - 1,
                    flex: 1,
                    minWidth: 0,
                  }}
                  numberOfLines={1}
                >
                  {shortName(name, sizeTier === "compact" ? 10 : 16)}
                </Text>
                <Text
                  style={{
                    color: colors.textPrimary,
                    fontFamily: typography.bodySemibold.fontFamily,
                    fontSize: priorSize,
                    flexShrink: 0,
                    textAlign: "right",
                  }}
                >
                  {bid.quantity}×{bid.faceValue}s
                </Text>
              </View>
            );
          })}
        </ScrollView>
      ) : null}

      {prior.length > 0 ? (
        <View
          style={{
            height: 1,
            backgroundColor: colors.border,
            marginVertical: dense ? 4 : 6,
          }}
        />
      ) : null}

      <View
        className="flex-row items-center justify-between"
        style={{
          gap: 8,
          paddingVertical: dense ? 4 : 6,
          paddingHorizontal: 6,
          borderRadius: radii.sm,
          backgroundColor: `${colors.accent}18`,
        }}
      >
        <Text
          style={{
            color: colors.accent,
            fontFamily: typography.caption.fontFamily,
            fontSize: sizeTier === "compact" ? 14 : 16,
            flex: 1,
            minWidth: 0,
          }}
          numberOfLines={1}
        >
          {shortName(currentName, sizeTier === "compact" ? 12 : 18)}
        </Text>
        <Text
          style={{
            color: colors.textPrimary,
            fontFamily: typography.h2.fontFamily,
            fontSize: currentSize,
            lineHeight: currentSize + 4,
            flexShrink: 0,
            textAlign: "right",
          }}
        >
          {currentLabel}
        </Text>
      </View>
    </View>
  );
}
