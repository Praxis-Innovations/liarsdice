import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { Pressable, View } from "react-native";
import type { GameState } from "../../engine/types";
import { useTheme } from "../../theme/ThemeProvider";
import { DiceCountChip, GameStatus, RoundChip } from "./GameStatus";

interface PlayTopBarProps {
  state: GameState;
  phase: string;
  dense: boolean;
  /** Phone / tight layout — stack to avoid overlap. */
  compact: boolean;
  tutorialMode: boolean;
  showHints: boolean;
  onBack: () => void;
  onToggleHints: () => void;
  statusRef?: React.RefObject<View | null>;
}

function IconButton({
  label,
  active,
  onPress,
  compact = false,
  children,
}: {
  label: string;
  active?: boolean;
  onPress: () => void;
  compact?: boolean;
  children: React.ReactNode;
}) {
  const { colors } = useTheme();
  // Match MetaChip / StatusBadge height on phone (~24–26px).
  const size = compact ? 26 : 32;
  return (
    <Pressable
      onPress={onPress}
      accessibilityLabel={label}
      hitSlop={6}
      style={{
        width: size,
        height: size,
        borderRadius: size / 2,
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: active ? `${colors.accent}28` : colors.surfaceRaised,
        borderWidth: 1,
        borderColor: active ? colors.accent : colors.border,
        flexShrink: 0,
      }}
    >
      {children}
    </Pressable>
  );
}

/** Play chrome: round + dice meta, status badges, hints toggle. */
export function PlayTopBar({
  state,
  phase,
  dense,
  compact,
  tutorialMode,
  showHints,
  onBack,
  onToggleHints,
  statusRef,
}: PlayTopBarProps) {
  const { colors, spacing } = useTheme();

  const iconSize = compact ? 15 : 17;

  const backBtn = (
    <IconButton label={tutorialMode ? "Exit tutorial" : "New game"} onPress={onBack} compact={compact}>
      <Ionicons name="arrow-back" size={iconSize} color={colors.textPrimary} />
    </IconButton>
  );

  const hintsToggle = !tutorialMode ? (
    <IconButton
      label={showHints ? "Disable hints" : "Enable hints"}
      active={showHints}
      onPress={onToggleHints}
      compact={compact}
    >
      <Ionicons
        name={showHints ? "bulb" : "bulb-outline"}
        size={iconSize}
        color={showHints ? colors.accent : colors.textSecondary}
      />
    </IconButton>
  ) : null;

  // Phone: single row — mode badge hidden via compact, turn badge fits inline.
  if (compact) {
    return (
      <View
        ref={statusRef}
        collapsable={false}
        className="flex-row items-center"
        style={{ gap: 8, marginBottom: 0, marginTop: 0 }}
      >
        {backBtn}
        <RoundChip state={state} dense />
        <View style={{ flex: 1 }} />
        <GameStatus state={state} phase={phase} dense compact />
        <DiceCountChip state={state} dense />
        {hintsToggle}
      </View>
    );
  }

  return (
    <View
      ref={statusRef}
      collapsable={false}
      className="flex-row items-center"
      style={{
        gap: spacing.sm,
        marginBottom: dense ? spacing.xs : spacing.sm,
      }}
    >
      <View className="flex-row items-center" style={{ gap: spacing.sm, flex: 1, minWidth: 0 }}>
        {backBtn}
        <RoundChip state={state} dense={dense} />
      </View>

      <DiceCountChip state={state} dense={dense} />

      <View className="flex-row items-center justify-end" style={{ gap: 6, flex: 1, minWidth: 0 }}>
        <GameStatus state={state} phase={phase} dense={dense} />
        {hintsToggle}
      </View>
    </View>
  );
}
