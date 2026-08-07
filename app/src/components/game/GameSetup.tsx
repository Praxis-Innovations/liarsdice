import React from "react";
import { Pressable, Switch, Text, View } from "react-native";
import { MAX_PLAYERS, MIN_PLAYERS } from "../../engine/constants";
import type { GameSettings } from "../../engine/types";
import { headingProps } from "../../lib/heading";
import { useTheme } from "../../theme/ThemeProvider";
import { Button } from "../ui/Button";
import { StepperButton } from "../ui/Stepper";
import { TextField } from "../ui/TextField";
import {
  GAME_SETUP_DIFFICULTIES,
  GAME_SETUP_LAYOUT,
  GAME_SETUP_TEST_IDS,
} from "./gameSetupLayout";

interface GameSetupProps {
  settings: GameSettings;
  onUpdateSettings: (partial: Partial<GameSettings>) => void;
  onStart: () => void;
  onStartTutorial: () => void;
  /**
   * 0 = comfortable (desktop/tall)
   * 1 = phone / medium height — shorter copy, keep air between cards
   * 2 = short phone — fit without clipping CTAs
   */
  density?: 0 | 1 | 2;
}

export function GameSetup({
  settings,
  onUpdateSettings,
  onStart,
  onStartTutorial,
  density = 0,
}: GameSetupProps) {
  const { colors, radii, spacing, typography } = useTheme();

  const sectionGap = density === 0 ? spacing.xl : density === 1 ? spacing.lg : spacing.md + 4;
  const cardPad = density === 2 ? spacing.md : spacing.md + 4;
  const showRuleHints = density < 2;
  const selectedDifficulty =
    GAME_SETUP_DIFFICULTIES.find((d) => d.value === settings.aiDifficulty) ?? GAME_SETUP_DIFFICULTIES[1];
  const formMaxWidth =
    density === 2 ? GAME_SETUP_LAYOUT.maxWidth.dense : GAME_SETUP_LAYOUT.maxWidth.comfortable;
  const titleSize =
    density === 0
      ? GAME_SETUP_LAYOUT.titleSize.comfortable
      : density === 1
        ? GAME_SETUP_LAYOUT.titleSize.medium
        : GAME_SETUP_LAYOUT.titleSize.dense;

  const card = {
    backgroundColor: colors.surfaceRaised,
    borderRadius: radii.md,
    padding: cardPad,
    gap: density === 2 ? 8 : spacing.sm + 2,
  };
  const label = {
    color: colors.accent,
    fontFamily: typography.bodySemibold.fontFamily,
    fontSize: GAME_SETUP_LAYOUT.labelSize,
  };
  const rowCard = {
    ...card,
    flexDirection: GAME_SETUP_LAYOUT.rowDirection,
    alignItems: "center" as const,
    justifyContent: "space-between" as const,
  };

  return (
    <View
      testID={GAME_SETUP_TEST_IDS.root}
      style={{
        width: "100%",
        maxWidth: formMaxWidth,
        alignSelf: "center",
        gap: sectionGap,
        paddingHorizontal: spacing.sm,
      }}
    >
      <Text
        {...headingProps(1)}
        style={{
          color: colors.textPrimary,
          fontFamily: typography.h1.fontFamily,
          fontSize: titleSize,
          textAlign: "center",
        }}
      >
        New Game
      </Text>

      <View testID={GAME_SETUP_TEST_IDS.nameRow} style={rowCard}>
        <Text style={[label, { flexShrink: 0, marginRight: spacing.sm }]}>Your Name</Text>
        <TextField
          testID={GAME_SETUP_TEST_IDS.nameInput}
          compact
          value={settings.playerName}
          onChangeText={(text) => onUpdateSettings({ playerName: text })}
          maxLength={20}
          placeholder="Your name"
          style={{
            width: GAME_SETUP_LAYOUT.nameInput.width,
            maxWidth: GAME_SETUP_LAYOUT.nameInput.maxWidth,
          }}
        />
      </View>

      <View testID={GAME_SETUP_TEST_IDS.playersRow} style={rowCard}>
        <View style={{ gap: 2, flexShrink: 1, paddingRight: spacing.sm }}>
          <Text style={label}>Players</Text>
          <Text
            style={{
              color: colors.textSecondary,
              fontFamily: typography.caption.fontFamily,
              fontSize: GAME_SETUP_LAYOUT.captionSize,
            }}
          >
            {MIN_PLAYERS}–{MAX_PLAYERS} total
          </Text>
        </View>
        <View className="flex-row items-center" style={{ gap: spacing.sm }}>
          <StepperButton
            label="-"
            disabled={settings.playerCount <= MIN_PLAYERS}
            onPress={() => onUpdateSettings({ playerCount: Math.max(MIN_PLAYERS, settings.playerCount - 1) })}
          />
          <Text
            style={{
              color: colors.textPrimary,
              fontFamily: typography.h2.fontFamily,
              fontSize: GAME_SETUP_LAYOUT.playerCountSize,
              minWidth: 34,
              textAlign: "center",
            }}
          >
            {settings.playerCount}
          </Text>
          <StepperButton
            label="+"
            disabled={settings.playerCount >= MAX_PLAYERS}
            onPress={() => onUpdateSettings({ playerCount: Math.min(MAX_PLAYERS, settings.playerCount + 1) })}
          />
        </View>
      </View>

      <View testID={GAME_SETUP_TEST_IDS.difficultySection} style={card}>
        <Text style={label}>AI Difficulty</Text>
        <View
          testID={GAME_SETUP_TEST_IDS.difficultyRow}
          style={{
            flexDirection: GAME_SETUP_LAYOUT.difficultyDirection,
            gap: spacing.sm,
          }}
        >
          {GAME_SETUP_DIFFICULTIES.map((d) => {
            const selected = settings.aiDifficulty === d.value;
            return (
              <Pressable
                key={d.value}
                accessibilityRole="button"
                accessibilityState={{ selected }}
                onPress={() => onUpdateSettings({ aiDifficulty: d.value })}
                style={{
                  flex: 1,
                  borderRadius: radii.sm,
                  borderWidth: 2,
                  borderColor: selected ? colors.accent : colors.border,
                  backgroundColor: selected ? `${colors.accent}18` : colors.surface,
                  paddingVertical: density === 2 ? 10 : 12,
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Text
                  style={{
                    color: colors.textPrimary,
                    fontFamily: typography.bodySemibold.fontFamily,
                    fontSize: GAME_SETUP_LAYOUT.chipLabelSize,
                    textAlign: "center",
                  }}
                >
                  {d.label}
                </Text>
              </Pressable>
            );
          })}
        </View>
        <Text
          testID={GAME_SETUP_TEST_IDS.difficultyDesc}
          style={{
            color: colors.textSecondary,
            fontFamily: typography.caption.fontFamily,
            fontSize: GAME_SETUP_LAYOUT.captionSize,
            lineHeight: 20,
          }}
        >
          {selectedDifficulty.desc}
        </Text>
      </View>

      <View testID={GAME_SETUP_TEST_IDS.rulesSection} style={card}>
        <Text style={label}>Optional Rules</Text>

        <View className="flex-row items-center justify-between" style={{ minHeight: density === 2 ? 44 : 52 }}>
          <View style={{ flex: 1, marginRight: spacing.sm, paddingRight: spacing.xs }}>
            <Text
              style={{
                color: colors.textPrimary,
                fontFamily: typography.body.fontFamily,
                fontSize: GAME_SETUP_LAYOUT.bodySize,
              }}
            >
              Spot On
            </Text>
            {showRuleHints ? (
              <Text
                style={{
                  color: colors.textSecondary,
                  fontFamily: typography.caption.fontFamily,
                  fontSize: GAME_SETUP_LAYOUT.captionSize,
                }}
              >
                Exact-count bonus die
              </Text>
            ) : null}
          </View>
          <Switch
            value={settings.enableSpotOn}
            onValueChange={(value) => onUpdateSettings({ enableSpotOn: value })}
            trackColor={{ true: colors.accent, false: colors.border }}
          />
        </View>

        <View className="flex-row items-center justify-between" style={{ minHeight: density === 2 ? 44 : 52 }}>
          <View style={{ flex: 1, marginRight: spacing.sm, paddingRight: spacing.xs }}>
            <Text
              style={{
                color: colors.textPrimary,
                fontFamily: typography.body.fontFamily,
                fontSize: GAME_SETUP_LAYOUT.bodySize,
              }}
            >
              Palifico Rounds
            </Text>
            {showRuleHints ? (
              <Text
                style={{
                  color: colors.textSecondary,
                  fontFamily: typography.caption.fontFamily,
                  fontSize: GAME_SETUP_LAYOUT.captionSize,
                }}
              >
                Special round at 1 die
              </Text>
            ) : null}
          </View>
          <Switch
            value={settings.enablePalifico}
            onValueChange={(value) => onUpdateSettings({ enablePalifico: value })}
            trackColor={{ true: colors.accent, false: colors.border }}
          />
        </View>
      </View>

      <View testID={GAME_SETUP_TEST_IDS.actionsRow} className="flex-row" style={{ gap: spacing.sm }}>
        <View style={{ flex: 1 }}>
          <Button
            label={GAME_SETUP_LAYOUT.actionsOrder[0]}
            variant="ghost"
            fullWidth
            labelFontSize={16}
            onPress={onStartTutorial}
          />
        </View>
        <View style={{ flex: 1 }}>
          <Button
            label={GAME_SETUP_LAYOUT.actionsOrder[1]}
            fullWidth
            labelFontSize={16}
            onPress={onStart}
          />
        </View>
      </View>
    </View>
  );
}
