import React, { useState } from "react";
import { LayoutChangeEvent, Text, View } from "react-native";
import type { DieValue, Player } from "../../engine/types";
import { useTheme } from "../../theme/ThemeProvider";
import { PlayerPanel } from "./PlayerPanel";
import {
  layoutTableSeats,
  openCenterFromSeats,
  type PlaySizeTier,
  type SeatLayout,
} from "./tableSeating";

export type CenterBounds = { maxWidth: number; maxHeight: number };
export type { PlaySizeTier };

interface GameTableProps {
  players: Player[];
  currentPlayerId: string;
  showDice: boolean;
  highlightValues?: DieValue[];
  onesWild: boolean;
  revealedDice?: Record<string, DieValue[]>;
  renderCenter?: (bounds: CenterBounds) => React.ReactNode;
  dense?: boolean;
  sizeTier?: PlaySizeTier;
  /** Dice tumbling after a new round is dealt. */
  shuffling?: boolean;
  humanSeatRef?: React.RefObject<View | null>;
  /** Whole table — tutorial "The Table" spotlight. */
  tableRef?: React.RefObject<View | null>;
  /** Opponent seats only — excludes the human seat. */
  opponentsRef?: React.RefObject<View | null>;
}

const TIER = {
  compact: {
    // ~10% smaller seats than the prior phone baseline for tighter mobile fit.
    maxDieSize: 14,
    minDieSize: 9,
    minGap: 4,
    minSeatWidth: (n: number) => (n >= 5 ? 133 : 144),
    // Keep the center card inside the open felt so rim seats stay clear on phones.
    centerMaxW: 168,
    centerWFrac: 0.4,
    centerHFrac: 0.34,
    centerPadFrac: 0.2,
  },
  regular: {
    maxDieSize: 23,
    minDieSize: 15,
    minGap: 8,
    minSeatWidth: (n: number) => (n >= 5 ? 195 : 210),
    centerMaxW: 310,
    centerWFrac: 0.62,
    centerHFrac: 0.62,
    centerPadFrac: 0.06,
  },
  roomy: {
    maxDieSize: 28,
    minDieSize: 18,
    minGap: 10,
    minSeatWidth: (n: number) => (n >= 5 ? 220 : 245),
    centerMaxW: 440,
    centerWFrac: 0.72,
    centerHFrac: 0.7,
    centerPadFrac: 0.04,
  },
} as const;

export function GameTable({
  players,
  currentPlayerId,
  showDice,
  highlightValues,
  onesWild,
  revealedDice,
  renderCenter,
  dense = false,
  sizeTier = "compact",
  shuffling = false,
  humanSeatRef,
  tableRef,
  opponentsRef,
}: GameTableProps) {
  const { colors, radii, typography } = useTheme();
  const [arena, setArena] = useState({ width: 0, height: 0 });
  const tier = TIER[sizeTier];

  const onLayout = (e: LayoutChangeEvent) => {
    const { width, height } = e.nativeEvent.layout;
    if (width !== arena.width || height !== arena.height) {
      setArena({ width, height });
    }
  };

  const humanIndex = Math.max(
    0,
    players.findIndex((p) => p.id === "human"),
  );

  const table =
    arena.width > 0 && arena.height > 0 && players.length >= 2
      ? layoutTableSeats(arena.width, arena.height, players.length, humanIndex, {
          maxDieSize: dense && sizeTier !== "compact" ? tier.maxDieSize - 2 : tier.maxDieSize,
          minDieSize: tier.minDieSize,
          minGap: tier.minGap,
          minSeatWidth: tier.minSeatWidth(players.length),
          sizeTier,
        })
      : null;

  const seats: SeatLayout[] = table?.seats ?? [];
  const felt = table?.felt ?? null;

  const centerPadX = felt ? felt.width * tier.centerPadFrac : 16;
  const centerPadY = felt ? felt.height * tier.centerPadFrac : 16;
  const openCenter =
    felt && seats.length > 0
      ? openCenterFromSeats(felt, seats, centerPadX, centerPadY, tier.minGap)
      : null;

  const centerBounds: CenterBounds = openCenter
    ? {
        maxWidth: Math.min(openCenter.width, tier.centerMaxW, felt!.width * tier.centerWFrac),
        maxHeight: Math.max(
          sizeTier === "compact" ? 88 : 96,
          Math.min(openCenter.height, felt!.height * tier.centerHFrac),
        ),
      }
    : felt
      ? {
          maxWidth: Math.min(felt.width * tier.centerWFrac, tier.centerMaxW),
          maxHeight: Math.max(sizeTier === "compact" ? 88 : 96, felt.height * tier.centerHFrac),
        }
      : { maxWidth: 160, maxHeight: 120 };

  const opponentSeats = seats.filter((seat) => players[seat.playerIndex]?.id !== "human");
  const opponentsBounds =
    opponentSeats.length > 0
      ? opponentSeats.reduce(
          (acc, seat) => ({
            x: Math.min(acc.x, seat.x),
            y: Math.min(acc.y, seat.y),
            right: Math.max(acc.right, seat.x + seat.width),
            bottom: Math.max(acc.bottom, seat.y + seat.height),
          }),
          {
            x: opponentSeats[0].x,
            y: opponentSeats[0].y,
            right: opponentSeats[0].x + opponentSeats[0].width,
            bottom: opponentSeats[0].y + opponentSeats[0].height,
          },
        )
      : null;

  return (
    <View
      ref={tableRef}
      testID="game-table"
      collapsable={false}
      onLayout={onLayout}
      style={{
        flex: 1,
        minHeight: sizeTier === "compact" ? 160 : 210,
        borderRadius: radii.lg,
        borderWidth: 1,
        borderColor: colors.border,
        backgroundColor: colors.surface,
        overflow: "hidden",
      }}
    >
      {felt ? (
        <View
          pointerEvents="none"
          style={{
            position: "absolute",
            left: felt.x,
            top: felt.y,
            width: felt.width,
            height: felt.height,
            borderRadius: Math.min(felt.width, felt.height) / 2,
            borderWidth: 2,
            borderStyle: "dashed",
            borderColor: colors.border,
            backgroundColor: colors.background,
            opacity: 0.95,
          }}
        />
      ) : null}

      {renderCenter && felt ? (
        <View
          pointerEvents="box-none"
          style={{
            position: "absolute",
            left: openCenter?.x ?? felt.x + centerPadX,
            width: openCenter?.width ?? Math.max(0, felt.width - centerPadX * 2),
            top: openCenter?.y ?? felt.y + centerPadY,
            height: openCenter?.height ?? Math.max(0, felt.height - centerPadY * 2),
            alignItems: "center",
            justifyContent: "center",
            zIndex: 5,
            overflow: "hidden",
          }}
        >
          {renderCenter(centerBounds)}
        </View>
      ) : null}

      {seats.length === 0 && players.length > 0 ? (
        <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
          <Text style={{ color: colors.textSecondary, fontFamily: typography.caption.fontFamily, fontSize: 12 }}>
            Setting the table…
          </Text>
        </View>
      ) : null}

      {seats.map((seat) => {
        const player = players[seat.playerIndex];
        if (!player) return null;
        const isHuman = player.id === "human";
        return (
          <View
            key={player.id}
            style={{
              position: "absolute",
              left: seat.x,
              top: seat.y,
              width: seat.width,
              height: seat.height,
              zIndex: isHuman ? 2 : 1,
            }}
          >
            <PlayerPanel
              ref={isHuman ? humanSeatRef : undefined}
              player={
                revealedDice?.[player.id]
                  ? { ...player, dice: revealedDice[player.id] }
                  : player
              }
              isCurrentTurn={currentPlayerId === player.id && !showDice}
              isHuman={isHuman}
              showDice={isHuman || showDice}
              highlightValues={highlightValues}
              onesWild={onesWild}
              seatWidth={seat.width}
              seatHeight={seat.height}
              dieSizePx={seat.dieSize}
              diceColumns={seat.diceColumns}
              compactSeat
              sizeTier={sizeTier}
              shuffling={shuffling}
            />
          </View>
        );
      })}

      {/* Invisible measure target for tutorial — opponents only, no visual change. */}
      {opponentsBounds ? (
        <View
          ref={opponentsRef}
          collapsable={false}
          pointerEvents="none"
          style={{
            position: "absolute",
            left: opponentsBounds.x,
            top: opponentsBounds.y,
            width: Math.max(1, opponentsBounds.right - opponentsBounds.x),
            height: Math.max(1, opponentsBounds.bottom - opponentsBounds.y),
            zIndex: 0,
          }}
        />
      ) : null}
    </View>
  );
}
