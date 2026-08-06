import React from "react";
import { ScrollView, Text, View } from "react-native";
import type { GameState } from "../../engine/types";
import { useTheme } from "../../theme/ThemeProvider";

interface BidHistoryProps {
  state: GameState;
}

export function BidHistory({ state }: BidHistoryProps) {
  const { colors, radii, spacing, typography } = useTheme();
  if (state.roundHistory.length === 0) return null;

  return (
    <View style={{ backgroundColor: colors.surfaceRaised, borderRadius: radii.md, padding: spacing.md }}>
      <Text style={{ color: colors.accent, fontFamily: typography.bodySemibold.fontFamily, fontSize: 12, marginBottom: spacing.xs }}>
        Bid History
      </Text>
      <ScrollView style={{ maxHeight: 128 }}>
        {state.roundHistory.map((action, i) => {
          const player = state.players.find((p) => p.id === action.playerId);
          return (
            <View key={i} className="flex-row" style={{ gap: spacing.xs, marginBottom: 4 }}>
              <Text
                style={{
                  color: action.playerId === "human" ? colors.accent : colors.textPrimary,
                  fontFamily: typography.bodySemibold.fontFamily,
                  fontSize: 12,
                }}
              >
                {player?.name}
              </Text>
              {action.type === "bid" && action.bid && (
                <Text style={{ color: colors.textSecondary, fontFamily: typography.body.fontFamily, fontSize: 12 }}>
                  bid {action.bid.quantity} &times; {action.bid.faceValue}s
                </Text>
              )}
              {action.type === "challenge" && (
                <Text style={{ color: colors.danger, fontFamily: typography.bodySemibold.fontFamily, fontSize: 12 }}>Liar!</Text>
              )}
              {action.type === "spot-on" && (
                <Text style={{ color: colors.secondary, fontFamily: typography.bodySemibold.fontFamily, fontSize: 12 }}>
                  Spot On!
                </Text>
              )}
            </View>
          );
        })}
      </ScrollView>
    </View>
  );
}
