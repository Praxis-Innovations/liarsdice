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
  zoomLevel: number;
  onBack: () => void;
  onToggleHints: () => void;
  onZoomIn: () => void;
  onZoomOut: () => void;
  statusRef?: React.RefObject<View | null>;
}

function IconButton({
  label,
  active,
  disabled,
  onPress,
  children,
}: {
  label: string;
  active?: boolean;
  disabled?: boolean;
  onPress: () => void;
  children: React.ReactNode;
}) {
  const { colors } = useTheme();
  return (
    <Pressable
      onPress={disabled ? undefined : onPress}
      accessibilityLabel={label}
      hitSlop={6}
      style={{
        width: 34,
        height: 34,
        borderRadius: 17,
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: active ? `${colors.accent}28` : colors.surfaceRaised,
        borderWidth: 1,
        borderColor: active ? colors.accent : colors.border,
        flexShrink: 0,
        opacity: disabled ? 0.35 : 1,
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
  zoomLevel,
  onBack,
  onToggleHints,
  onZoomIn,
  onZoomOut,
  statusRef,
}: PlayTopBarProps) {
  const { colors, spacing } = useTheme();

  const backBtn = (
    <IconButton label={tutorialMode ? "Exit tutorial" : "New game"} onPress={onBack}>
      <Ionicons name="arrow-back" size={18} color={colors.textPrimary} />
    </IconButton>
  );

  const hintsToggle = !tutorialMode ? (
    <IconButton
      label={showHints ? "Disable hints" : "Enable hints"}
      active={showHints}
      onPress={onToggleHints}
    >
      <Ionicons
        name={showHints ? "bulb" : "bulb-outline"}
        size={18}
        color={showHints ? colors.accent : colors.textSecondary}
      />
    </IconButton>
  ) : null;

  const zoomButtons = (
    <>
      <IconButton label="Zoom out" disabled={zoomLevel <= 0.5} onPress={onZoomOut}>
        <Ionicons name="remove" size={18} color={zoomLevel <= 0.5 ? colors.textSecondary : colors.textPrimary} />
      </IconButton>
      <IconButton label="Zoom in" disabled={zoomLevel >= 1.5} onPress={onZoomIn}>
        <Ionicons name="add" size={18} color={zoomLevel >= 1.5 ? colors.textSecondary : colors.textPrimary} />
      </IconButton>
    </>
  );

  // Phone: single row — mode badge hidden via compact, turn badge fits inline.
  if (compact) {
    return (
      <View
        ref={statusRef}
        collapsable={false}
        className="flex-row items-center"
        style={{ gap: 8, marginBottom: dense ? 2 : spacing.xs, marginTop: 0 }}
      >
        {backBtn}
        <RoundChip state={state} dense />
        <View style={{ flex: 1 }} />
        <GameStatus state={state} phase={phase} dense compact />
        <DiceCountChip state={state} dense />
        {zoomButtons}
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
        {zoomButtons}
        {hintsToggle}
      </View>
    </View>
  );
}
