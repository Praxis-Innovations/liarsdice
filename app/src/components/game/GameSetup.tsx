import React from "react";
import { Pressable, Switch, Text, View } from "react-native";
import { MAX_PLAYERS, MIN_PLAYERS } from "../../engine/constants";
import type { AIDifficulty, GameSettings } from "../../engine/types";
import { headingProps } from "../../lib/heading";
import { useTheme } from "../../theme/ThemeProvider";
import { Button } from "../ui/Button";
import { StepperButton } from "../ui/Stepper";
import { TextField } from "../ui/TextField";

interface GameSetupProps {
  settings: GameSettings;
  onUpdateSettings: (partial: Partial<GameSettings>) => void;
  onStart: () => void;
}

const DIFFICULTIES: { value: AIDifficulty; label: string; desc: string }[] = [
  { value: "easy", label: "Easy", desc: "Predictable bids, challenges too late" },
  { value: "medium", label: "Medium", desc: "Good probability math, occasional bluffs" },
  { value: "hard", label: "Hard", desc: "Strategic bluffing, optimal play" },
];

export function GameSetup({ settings, onUpdateSettings, onStart }: GameSetupProps) {
  const { colors, radii, spacing, typography } = useTheme();

  const card = { backgroundColor: colors.surfaceRaised, borderRadius: radii.md, padding: spacing.md, gap: spacing.sm };
  const label = { color: colors.accent, fontFamily: typography.bodySemibold.fontFamily, fontSize: 13 };

  return (
    <View style={{ width: "100%", maxWidth: 420, alignSelf: "center", gap: spacing.md }}>
      <Text
        {...headingProps(1)}
        style={{ color: colors.textPrimary, fontFamily: typography.h1.fontFamily, fontSize: 28, textAlign: "center" }}
      >
        New Game
      </Text>

      <View style={card}>
        <Text style={label}>Your Name</Text>
        <TextField
          value={settings.playerName}
          onChangeText={(text) => onUpdateSettings({ playerName: text })}
          maxLength={20}
          placeholder="Enter your name"
        />
      </View>

      <View style={card}>
        <Text style={label}>Players ({settings.playerCount})</Text>
        <View className="flex-row items-center justify-center" style={{ gap: spacing.md }}>
          <StepperButton
            label="-"
            disabled={settings.playerCount <= MIN_PLAYERS}
            onPress={() => onUpdateSettings({ playerCount: Math.max(MIN_PLAYERS, settings.playerCount - 1) })}
          />
          <Text style={{ color: colors.textPrimary, fontFamily: typography.h2.fontFamily, fontSize: 22, width: 32, textAlign: "center" }}>
            {settings.playerCount}
          </Text>
          <StepperButton
            label="+"
            disabled={settings.playerCount >= MAX_PLAYERS}
            onPress={() => onUpdateSettings({ playerCount: Math.min(MAX_PLAYERS, settings.playerCount + 1) })}
          />
        </View>
        <View className="flex-row justify-between">
          <Text style={{ color: colors.textSecondary, fontFamily: typography.caption.fontFamily, fontSize: 11 }}>{MIN_PLAYERS} players</Text>
          <Text style={{ color: colors.textSecondary, fontFamily: typography.caption.fontFamily, fontSize: 11 }}>{MAX_PLAYERS} players</Text>
        </View>
      </View>

      <View style={card}>
        <Text style={label}>AI Difficulty</Text>
        {DIFFICULTIES.map((d) => {
          const selected = settings.aiDifficulty === d.value;
          return (
            <Pressable
              key={d.value}
              onPress={() => onUpdateSettings({ aiDifficulty: d.value })}
              style={{
                borderRadius: radii.sm,
                borderWidth: 2,
                borderColor: selected ? colors.accent : colors.border,
                backgroundColor: selected ? `${colors.accent}18` : colors.surface,
                padding: spacing.sm,
              }}
            >
              <Text style={{ color: colors.textPrimary, fontFamily: typography.bodySemibold.fontFamily, fontSize: 14 }}>{d.label}</Text>
              <Text style={{ color: colors.textSecondary, fontFamily: typography.caption.fontFamily, fontSize: 11, marginTop: 2 }}>
                {d.desc}
              </Text>
            </Pressable>
          );
        })}
      </View>

      <View style={card}>
        <Text style={label}>Optional Rules</Text>

        <View className="flex-row items-center justify-between">
          <View style={{ flex: 1, marginRight: spacing.sm }}>
            <Text style={{ color: colors.textPrimary, fontFamily: typography.body.fontFamily, fontSize: 14 }}>Spot On</Text>
            <Text style={{ color: colors.textSecondary, fontFamily: typography.caption.fontFamily, fontSize: 11 }}>
              Gain a die by guessing the exact count
            </Text>
          </View>
          <Switch
            value={settings.enableSpotOn}
            onValueChange={(value) => onUpdateSettings({ enableSpotOn: value })}
            trackColor={{ true: colors.accent, false: colors.border }}
          />
        </View>

        <View className="flex-row items-center justify-between">
          <View style={{ flex: 1, marginRight: spacing.sm }}>
            <Text style={{ color: colors.textPrimary, fontFamily: typography.body.fontFamily, fontSize: 14 }}>Palifico Rounds</Text>
            <Text style={{ color: colors.textSecondary, fontFamily: typography.caption.fontFamily, fontSize: 11 }}>
              Special round when a player reaches 1 die
            </Text>
          </View>
          <Switch
            value={settings.enablePalifico}
            onValueChange={(value) => onUpdateSettings({ enablePalifico: value })}
            trackColor={{ true: colors.accent, false: colors.border }}
          />
        </View>
      </View>

      <Button label="Start Game" fullWidth onPress={onStart} />
    </View>
  );
}
