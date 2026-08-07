import React from "react";
import { Platform, Share, Text, View } from "react-native";
import Svg, { Path, Rect } from "react-native-svg";
import type { GameState } from "../../engine/types";
import { headingProps } from "../../lib/heading";
import { useTheme } from "../../theme/ThemeProvider";
import { Button } from "../ui/Button";

interface GameOverProps {
  state: GameState;
  onPlayAgain: () => void;
}

function TrophyIcon({ color }: { color: string }) {
  return (
    <Svg width={56} height={56} viewBox="0 0 40 40">
      <Path d="M12 6h16v9a8 8 0 0 1-16 0z" fill={color} />
      <Path d="M9 8H6a1 1 0 0 0-1 1v2a6 6 0 0 0 6 6" stroke={color} strokeWidth={2.5} fill="none" />
      <Path d="M31 8h3a1 1 0 0 1 1 1v2a6 6 0 0 1-6 6" stroke={color} strokeWidth={2.5} fill="none" />
      <Rect x={17} y={23} width={6} height={7} fill={color} />
      <Rect x={12} y={30} width={16} height={4} rx={2} fill={color} />
    </Svg>
  );
}

export function GameOver({ state, onPlayAgain }: GameOverProps) {
  const { colors, radii, spacing, typography } = useTheme();
  const winner = state.players.find((p) => p.id === state.winner);
  const isHumanWinner = state.winner === "human";

  const handleShare = () => {
    const message = isHumanWinner
      ? `I won a game of Liar's Dice against ${state.players.length - 1} AI opponents on ${state.settings.aiDifficulty} difficulty!`
      : `I just played Liar's Dice against ${state.players.length - 1} AI opponents!`;
    void Share.share(Platform.OS === "web" ? { message, title: "Liar's Dice", url: message } : { message, title: "Liar's Dice" }).catch(() => {});
  };

  return (
    <View style={{ alignItems: "center", gap: spacing.sm }}>
      <TrophyIcon color={isHumanWinner ? colors.accent : colors.textSecondary} />

      <Text
        {...headingProps(1)}
        style={{ color: colors.accent, fontFamily: typography.display.fontFamily, fontSize: 32, textAlign: "center" }}
      >
        {isHumanWinner ? "You Win!" : "Game Over"}
      </Text>

      <Text style={{ color: colors.textSecondary, fontFamily: typography.body.fontFamily, fontSize: 16, textAlign: "center" }}>
        {isHumanWinner ? "You outbluffed everyone!" : `${winner?.name ?? "Unknown"} is the last player standing.`}
      </Text>

      <View
        style={{
          backgroundColor: colors.surfaceRaised,
          borderRadius: radii.md,
          padding: spacing.lg,
          width: "100%",
          maxWidth: 360,
          marginTop: spacing.sm,
          gap: spacing.xs,
        }}
      >
        <Text style={{ color: colors.accent, fontFamily: typography.bodySemibold.fontFamily, fontSize: 13, marginBottom: 4 }}>
          Game Stats
        </Text>
        {[
          ["Rounds Played", String(state.roundNumber)],
          ["Players", String(state.players.length)],
          ["Difficulty", state.settings.aiDifficulty],
        ].map(([label, value]) => (
          <View key={label} className="flex-row justify-between">
            <Text style={{ color: colors.textSecondary, fontFamily: typography.body.fontFamily, fontSize: 14 }}>{label}</Text>
            <Text style={{ color: colors.textPrimary, fontFamily: typography.bodyMedium.fontFamily, fontSize: 14, textTransform: "capitalize" }}>
              {value}
            </Text>
          </View>
        ))}
      </View>

      <View className="flex-row" style={{ gap: spacing.sm, width: "100%", maxWidth: 360, marginTop: spacing.md }}>
        <View style={{ flex: 1 }}>
          <Button label="Play Again" fullWidth labelFontSize={16} onPress={onPlayAgain} />
        </View>
        <View style={{ flex: 1 }}>
          <Button label="Share Result" variant="ghost" fullWidth labelFontSize={16} onPress={handleShare} />
        </View>
      </View>
    </View>
  );
}
