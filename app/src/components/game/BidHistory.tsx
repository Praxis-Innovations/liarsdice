import React from "react";
import { Text, View } from "react-native";
import type { GameState } from "../../engine/types";
import { useTheme } from "../../theme/ThemeProvider";

interface BidHistoryProps {
  state: GameState;
}

/** Compact recent-bid line — full card history was too heavy for play. */
export function BidHistory({ state }: BidHistoryProps) {
  const { colors, spacing, typography } = useTheme();
  if (state.roundHistory.length === 0) return null;

  const recent = state.roundHistory.slice(-4);

  return (
    <View style={{ gap: 2 }}>
      {recent.map((action, i) => {
        const player = state.players.find((p) => p.id === action.playerId);
        const nameColor = action.playerId === "human" ? colors.accent : colors.textSecondary;
        let detail = "";
        let detailColor = colors.textSecondary;
        if (action.type === "bid" && action.bid) {
          detail = `${action.bid.quantity} × ${action.bid.faceValue}s`;
        } else if (action.type === "challenge") {
          detail = "Liar!";
          detailColor = colors.danger;
        } else if (action.type === "spot-on") {
          detail = "Spot On!";
          detailColor = colors.secondary;
        }

        return (
          <View key={`${action.playerId}-${i}`} className="flex-row" style={{ gap: spacing.xs }}>
            <Text style={{ color: nameColor, fontFamily: typography.caption.fontFamily, fontSize: 11 }}>
              {player?.name}
            </Text>
            <Text style={{ color: detailColor, fontFamily: typography.caption.fontFamily, fontSize: 11 }}>{detail}</Text>
          </View>
        );
      })}
    </View>
  );
}
