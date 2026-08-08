import React from "react";
import { Text, View } from "react-native";
import { DICE_PER_PLAYER } from "../../engine/constants";
import type { DieValue, Player } from "../../engine/types";
import { useTheme } from "../../theme/ThemeProvider";
import { DiceRow } from "./DiceDisplay";
import { fitDieInSeat, type OutwardAlign, type PlaySizeTier } from "./tableSeating";

interface PlayerPanelProps {
  player: Player;
  isCurrentTurn: boolean;
  isHuman: boolean;
  showDice: boolean;
  highlightValues?: DieValue[];
  onesWild: boolean;
  lastAction?: string;
  seatWidth?: number;
  seatHeight?: number;
  dieSizePx?: number;
  compactSeat?: boolean;
  diceColumns?: number;
  sizeTier?: PlaySizeTier;
  outwardAlign?: OutwardAlign;
}

export const PlayerPanel = React.forwardRef<View, PlayerPanelProps>(function PlayerPanel(
  {
    player,
    isCurrentTurn,
    isHuman,
    showDice,
    highlightValues,
    onesWild,
    seatWidth,
    seatHeight,
    dieSizePx,
    compactSeat = false,
    diceColumns = 5,
    sizeTier = "compact",
    outwardAlign = "center",
  },
  ref,
) {
  const { colors, radii, spacing, typography } = useTheme();

  const seatStyle =
    seatWidth != null
      ? {
          width: seatWidth,
          maxWidth: seatWidth,
          height: seatHeight,
        }
      : isHuman
        ? { width: "100%" as const, maxWidth: "100%" as const }
        : { flexGrow: 1, flexBasis: 140, maxWidth: "100%" as const };

  const pad = compactSeat ? (sizeTier === "compact" ? 8 : 10) : spacing.sm;
  const nameSize = compactSeat ? (sizeTier === "roomy" ? 19 : sizeTier === "regular" ? 17 : 16) : isHuman ? 16 : 15;
  const chip = sizeTier === "roomy" ? 32 : sizeTier === "regular" ? 30 : 28;
  const displayName = isHuman ? "You" : player.name;

  // Always fit a single row of dice inside the card width.
  const cols = Math.max(diceColumns, DICE_PER_PLAYER);
  const dieCap = dieSizePx ?? (sizeTier === "roomy" ? 26 : sizeTier === "regular" ? 20 : 15);
  const fittedDie =
    compactSeat && seatWidth != null
      ? fitDieInSeat(seatWidth, seatHeight ?? 80, cols, DICE_PER_PLAYER, dieCap, 8)
      : dieCap;

  if (player.isEliminated) {
    return (
      <View
        ref={ref}
        collapsable={false}
        style={{
          ...seatStyle,
          opacity: 0.45,
          gap: 2,
          padding: pad,
          borderRadius: radii.md,
          borderWidth: 1,
          borderColor: colors.border,
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: colors.surface,
        }}
      >
        <Text
          style={{
            color: colors.textSecondary,
            fontFamily: typography.bodySemibold.fontFamily,
            fontSize: nameSize,
            textDecorationLine: "line-through",
            textAlign: "center",
          }}
          numberOfLines={1}
        >
          {displayName}
        </Text>
        <Text
          style={{
            color: colors.danger,
            fontFamily: typography.caption.fontFamily,
            fontSize: 11,
            textAlign: "center",
          }}
        >
          Out
        </Text>
      </View>
    );
  }

  return (
    <View
      ref={ref}
      collapsable={false}
      style={{
        ...seatStyle,
        gap: compactSeat ? 4 : spacing.xs,
        padding: pad,
        borderRadius: radii.md,
        borderWidth: isCurrentTurn ? 2 : 1,
        borderColor: isCurrentTurn ? colors.accent : colors.border,
        backgroundColor: isHuman ? colors.surfaceRaised : colors.surface,
        justifyContent: compactSeat ? "flex-start" : undefined,
        alignItems: compactSeat ? "stretch" : undefined,
        overflow: "hidden",
      }}
    >
      {compactSeat ? (
        <View
          style={{
            flexDirection: outwardAlign === "right" ? "row-reverse" : "row",
            alignItems: "center",
            gap: sizeTier === "compact" ? 6 : 8,
            width: "100%",
            minHeight: chip,
          }}
        >
          <Text
            style={{
              color: colors.textPrimary,
              fontFamily: typography.bodySemibold.fontFamily,
              fontSize: nameSize,
              flex: 1,
              minWidth: 0,
            }}
            numberOfLines={1}
          >
            {displayName}
          </Text>
          {isCurrentTurn ? (
            <View
              style={{
                paddingHorizontal: 5,
                paddingVertical: 2,
                borderRadius: radii.pill,
                backgroundColor: `${colors.accent}33`,
                flexShrink: 0,
              }}
            >
              <Text
                style={{
                  color: colors.accent,
                  fontFamily: typography.bodySemibold.fontFamily,
                  fontSize: 11,
                  letterSpacing: 0.3,
                }}
              >
                TURN
              </Text>
            </View>
          ) : null}
        </View>
      ) : (
        <View className="flex-row items-center justify-between" style={{ gap: 4 }}>
          <Text
            style={{
              color: isCurrentTurn ? colors.accent : colors.textPrimary,
              fontFamily: typography.bodySemibold.fontFamily,
              fontSize: nameSize,
              flexShrink: 1,
            }}
            numberOfLines={1}
          >
            {displayName}
          </Text>
          {isCurrentTurn ? (
            <Text style={{ color: colors.accent, fontFamily: typography.caption.fontFamily, fontSize: 10 }}>
              turn
            </Text>
          ) : null}
        </View>
      )}

      <View
        style={
          compactSeat
            ? {
                width: "100%",
                alignItems: "center",
                justifyContent: "center",
              }
            : undefined
        }
      >
        <DiceRow
          dice={player.dice}
          size="sm"
          dieSizePx={fittedDie}
          hidden={!showDice}
          highlightValues={highlightValues}
          wildValue={onesWild}
          bare
          noWrap
          tight
        />
      </View>
    </View>
  );
});
