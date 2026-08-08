import React, { useEffect, useRef } from "react";
import { ScrollView, Text, View } from "react-native";
import type { GameAction, GameState } from "../../engine/types";
import { useTheme } from "../../theme/ThemeProvider";

function bidActions(history: GameAction[]): GameAction[] {
  return history.filter((a) => a.type === "bid" && a.bid);
}

function shortName(full: string, max = 14): string {
  if (full.length <= max) return full;
  return `${full.slice(0, max - 1)}…`;
}

function playerLabel(state: GameState, playerId: string): string {
  if (playerId === "human") return "You";
  return state.players.find((p) => p.id === playerId)?.name ?? "?";
}

/**
 * Phone-only bid chrome under the table — vertical list so the felt stays clear.
 */
export function MobileBidStrip({ state }: { state: GameState }) {
  const { colors, radii, typography, spacing } = useTheme();
  const scrollRef = useRef<ScrollView>(null);
  const bids = bidActions(state.roundHistory);

  useEffect(() => {
    if (bids.length === 0) return;
    requestAnimationFrame(() => {
      scrollRef.current?.scrollToEnd({ animated: true });
    });
  }, [bids.length]);

  if (bids.length === 0) {
    return (
      <View
        style={{
          borderRadius: radii.md,
          borderWidth: 1,
          borderColor: colors.border,
          backgroundColor: colors.surfaceRaised,
          paddingVertical: 12,
          paddingHorizontal: spacing.md,
          alignItems: "center",
          height: 148,
          justifyContent: "center",
        }}
      >
        <Text
          style={{
            color: colors.textPrimary,
            fontFamily: typography.bodySemibold.fontFamily,
            fontSize: 14,
          }}
        >
          Open the round
        </Text>
        <Text
          style={{
            color: colors.textSecondary,
            fontFamily: typography.caption.fontFamily,
            fontSize: 12,
            marginTop: 2,
          }}
        >
          No bid yet
        </Text>
      </View>
    );
  }

  const current = bids[bids.length - 1];
  const prior = bids.slice(0, -1);
  const currentName = shortName(playerLabel(state, current.playerId));
  const currentLabel = `${current.bid!.quantity} × ${current.bid!.faceValue}s`;

  return (
    <View
      style={{
        borderRadius: radii.md,
        borderWidth: 1.5,
        borderColor: colors.accent,
        backgroundColor: colors.surfaceRaised,
        paddingHorizontal: spacing.sm,
        paddingTop: 8,
        paddingBottom: 8,
        height: 148,
        justifyContent: "flex-end",
      }}
    >
      <Text
        style={{
          color: colors.textSecondary,
          fontFamily: typography.caption.fontFamily,
          fontSize: 10,
          letterSpacing: 0.5,
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
          style={{ flexGrow: 0, flexShrink: 1 }}
          contentContainerStyle={{ gap: 4, paddingBottom: 4 }}
          showsVerticalScrollIndicator={prior.length > 4}
          nestedScrollEnabled
        >
          {prior.map((action, i) => {
            const bid = action.bid!;
            return (
              <View
                key={`${action.playerId}-${i}-${bid.quantity}-${bid.faceValue}`}
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "space-between",
                  gap: 8,
                }}
              >
                <Text
                  style={{
                    color: colors.textSecondary,
                    fontFamily: typography.caption.fontFamily,
                    fontSize: 13,
                    flex: 1,
                    minWidth: 0,
                  }}
                  numberOfLines={1}
                >
                  {shortName(playerLabel(state, action.playerId))}
                </Text>
                <Text
                  style={{
                    color: colors.textPrimary,
                    fontFamily: typography.bodySemibold.fontFamily,
                    fontSize: 13,
                    flexShrink: 0,
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
        <View style={{ height: 1, backgroundColor: colors.border, marginVertical: 4 }} />
      ) : null}

      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 8,
          paddingHorizontal: 8,
          paddingVertical: 6,
          borderRadius: radii.sm,
          backgroundColor: `${colors.accent}22`,
        }}
      >
        <Text
          style={{
            color: colors.accent,
            fontFamily: typography.caption.fontFamily,
            fontSize: 13,
            flex: 1,
            minWidth: 0,
          }}
          numberOfLines={1}
        >
          {currentName}
        </Text>
        <Text
          style={{
            color: colors.textPrimary,
            fontFamily: typography.h3.fontFamily,
            fontSize: 20,
            flexShrink: 0,
          }}
        >
          {currentLabel}
        </Text>
      </View>
    </View>
  );
}
