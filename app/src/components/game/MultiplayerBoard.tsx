// View layer for server-authoritative multiplayer matches.
// Game state arrives entirely from the Nakama server via multiplayerStore.
// This is a self-contained UI — it does NOT reuse the solo GameBoard components
// since those are tightly coupled to the solo gameStore interface.

import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  Text,
  View,
} from "react-native";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useMultiplayerStore } from "../../store/multiplayerStore";
import { useTheme } from "../../theme/ThemeProvider";
import { headingProps } from "../../lib/heading";
import { Button } from "../ui/Button";
import { Die } from "../shared/Die";
import type { DieFace } from "../shared/Die";
import type { DieValue, GameState } from "../../engine/types";
import { ChatPanel } from "../chat/ChatPanel";

// ─── Sub-components ───────────────────────────────────────────────────────────

function PlayerRow({
  playerId,
  name,
  diceCount,
  dice,
  isCurrentTurn,
  isMe,
  isEliminated,
}: {
  playerId: string;
  name: string;
  diceCount: number;
  dice: DieValue[];
  isCurrentTurn: boolean;
  isMe: boolean;
  isEliminated: boolean;
}) {
  const { colors, spacing, typography } = useTheme();
  return (
    <View
      style={{
        flexDirection: "row",
        alignItems: "center",
        gap: spacing.sm,
        padding: spacing.sm,
        borderRadius: 10,
        backgroundColor: isCurrentTurn ? colors.surface : "transparent",
        opacity: isEliminated ? 0.4 : 1,
      }}
    >
      <View style={{ width: 90 }}>
        <Text
          style={{
            fontFamily: typography.bodyMedium.fontFamily,
            fontSize: 14,
            color: isCurrentTurn ? colors.primary : colors.textPrimary,
          }}
          numberOfLines={1}
        >
          {name}
          {isMe ? " (you)" : ""}
        </Text>
        <Text
          style={{
            fontFamily: typography.caption.fontFamily,
            fontSize: 11,
            color: colors.textSecondary,
          }}
        >
          {isEliminated ? "Eliminated" : `${diceCount} ${diceCount === 1 ? "die" : "dice"}`}
        </Text>
      </View>

      <View style={{ flexDirection: "row", gap: 4, flexWrap: "wrap" }}>
        {isMe && dice.length > 0
          ? dice.map((val, i) => (
              <Die key={i} face={val as DieFace} color={colors.primary} size={26} />
            ))
          : Array.from({ length: diceCount }).map((_, i) => (
              // Hidden opponent dice shown as face-down placeholders.
              <Die key={i} face={null} color={colors.border} size={26} />
            ))}
      </View>
    </View>
  );
}

function BidDisplay({ gameState }: { gameState: GameState }) {
  const { colors, spacing, typography } = useTheme();
  const { currentBid } = gameState;

  if (!currentBid) {
    return (
      <View style={{ alignItems: "center", padding: spacing.md }}>
        <Text
          style={{
            fontFamily: typography.body.fontFamily,
            fontSize: 14,
            color: colors.textSecondary,
          }}
        >
          No bid yet — first player to open
        </Text>
      </View>
    );
  }

  return (
    <View
      style={{
        alignItems: "center",
        gap: spacing.xs,
        padding: spacing.md,
        backgroundColor: colors.surface,
        borderRadius: 12,
      }}
    >
      <Text
        style={{
          fontFamily: typography.caption.fontFamily,
          fontSize: 12,
          color: colors.textSecondary,
          textTransform: "uppercase",
          letterSpacing: 1,
        }}
      >
        Current bid
      </Text>
      <View style={{ flexDirection: "row", alignItems: "center", gap: spacing.sm }}>
        <Text
          style={{
            fontFamily: typography.h3.fontFamily,
            fontSize: 28,
            color: colors.textPrimary,
          }}
        >
          {currentBid.quantity} ×
        </Text>
        <Die face={currentBid.faceValue as DieFace} color={colors.primary} size={36} />
      </View>
      {gameState.onesWild && (
        <Text
          style={{
            fontFamily: typography.caption.fontFamily,
            fontSize: 11,
            color: colors.textSecondary,
          }}
        >
          Ones are wild
        </Text>
      )}
    </View>
  );
}

type BidControlsProps = {
  gameState: GameState;
  onBid: (q: number, fv: number) => void;
  onChallenge: () => void;
  onSpotOn: () => void;
};

function BidControls({ gameState, onBid, onChallenge, onSpotOn }: BidControlsProps) {
  const { colors, spacing, typography } = useTheme();
  const { currentBid, settings } = gameState;

  const totalDice = gameState.players.reduce(
    (sum, p) => sum + (p.isEliminated ? 0 : p.diceCount),
    0,
  );

  const [qty, setQty] = useState(currentBid ? currentBid.quantity + 1 : 1);
  const [fv, setFv] = useState<DieValue>(currentBid ? (currentBid.faceValue as DieValue) : 1);

  const minQty = currentBid ? currentBid.quantity + 1 : 1;

  return (
    <View style={{ gap: spacing.sm, padding: spacing.md }}>
      {/* Quantity stepper */}
      <View style={{ flexDirection: "row", alignItems: "center", gap: spacing.sm }}>
        <Text
          style={{
            width: 70,
            fontFamily: typography.caption.fontFamily,
            fontSize: 12,
            color: colors.textSecondary,
          }}
        >
          Quantity
        </Text>
        <Pressable
          onPress={() => setQty((q) => Math.max(minQty, q - 1))}
          style={{
            width: 36,
            height: 36,
            borderRadius: 8,
            backgroundColor: colors.surface,
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Text style={{ color: colors.textPrimary, fontSize: 20 }}>−</Text>
        </Pressable>
        <Text
          style={{
            width: 32,
            textAlign: "center",
            fontFamily: typography.bodyMedium.fontFamily,
            fontSize: 18,
            color: colors.textPrimary,
          }}
        >
          {qty}
        </Text>
        <Pressable
          onPress={() => setQty((q) => Math.min(totalDice, q + 1))}
          style={{
            width: 36,
            height: 36,
            borderRadius: 8,
            backgroundColor: colors.surface,
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Text style={{ color: colors.textPrimary, fontSize: 20 }}>+</Text>
        </Pressable>
      </View>

      {/* Face value picker */}
      <View style={{ flexDirection: "row", alignItems: "center", gap: spacing.xs }}>
        <Text
          style={{
            width: 70,
            fontFamily: typography.caption.fontFamily,
            fontSize: 12,
            color: colors.textSecondary,
          }}
        >
          Face value
        </Text>
        {([1, 2, 3, 4, 5, 6] as DieValue[]).map((v) => (
          <Pressable
            key={v}
            onPress={() => setFv(v)}
            style={{
              opacity: fv === v ? 1 : 0.45,
              transform: [{ scale: fv === v ? 1.12 : 1 }],
            }}
          >
            <Die face={v as DieFace} color={fv === v ? colors.primary : colors.textSecondary} size={30} />
          </Pressable>
        ))}
      </View>

      {/* Action buttons */}
      <View style={{ flexDirection: "row", gap: spacing.sm, marginTop: spacing.xs }}>
        <Button
          label="Place bid"
          onPress={() => onBid(qty, fv)}
          style={{ flex: 1 }}
        />
        {currentBid && (
          <Button
            label="Challenge"
            variant="danger"
            onPress={onChallenge}
            style={{ flex: 1 }}
          />
        )}
        {currentBid && settings.enableSpotOn && (
          <Button
            label="Spot on!"
            variant="secondary"
            onPress={onSpotOn}
            style={{ flex: 1 }}
          />
        )}
      </View>
    </View>
  );
}

// ─── Main component ──────────────────────────────────────────────────────────

export function MultiplayerBoard() {
  const { colors, spacing, typography } = useTheme();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const store = useMultiplayerStore();
  const [chatOpen, setChatOpen] = useState(false);

  const { phase, gameState, roundResult, myUserId, winnerId, matchId } = store;

  // Join the match-scoped chat channel when a match is active.
  useEffect(() => {
    if (matchId && (phase === "lobby" || phase === "playing" || phase === "round-result")) {
      void store.joinChannel(matchId, 1);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [matchId]);

  const handleLeave = () => {
    store.leaveMatch();
    store.reset();
    router.replace("/(app)/lobby");
  };

  // ── Connecting / lobby ──────────────────────────────────────────────────────
  if (phase === "idle" || phase === "connecting" || phase === "lobby") {
    return (
      <View
        style={{
          flex: 1,
          backgroundColor: colors.background,
          alignItems: "center",
          justifyContent: "center",
          gap: spacing.lg,
        }}
      >
        <ActivityIndicator size="large" color={colors.primary} />
        <Text
          style={{
            fontFamily: typography.body.fontFamily,
            fontSize: typography.body.fontSize,
            color: colors.textSecondary,
          }}
        >
          {phase === "lobby" ? "Waiting for all players to ready up…" : "Connecting to server…"}
        </Text>
        <Button label="Cancel" variant="ghost" onPress={handleLeave} />
      </View>
    );
  }

  // ── Error ───────────────────────────────────────────────────────────────────
  if (phase === "error") {
    return (
      <View
        style={{
          flex: 1,
          backgroundColor: colors.background,
          alignItems: "center",
          justifyContent: "center",
          gap: spacing.md,
          padding: spacing.lg,
        }}
      >
        <Text
          style={{
            fontFamily: typography.bodyMedium.fontFamily,
            fontSize: typography.body.fontSize,
            color: colors.danger,
            textAlign: "center",
          }}
        >
          {store.errorMessage ?? "Connection error"}
        </Text>
        <Button label="Back to lobby" onPress={handleLeave} />
      </View>
    );
  }

  // ── Round result reveal ─────────────────────────────────────────────────────
  if (phase === "round-result" && roundResult && gameState) {
    const loser = gameState.players.find((p) => p.id === roundResult.loser);
    const winner =
      roundResult.challengeType === "liar"
        ? gameState.players.find((p) => p.id === roundResult.challenger)
        : roundResult.challengerWins
          ? gameState.players.find((p) => p.id === roundResult.challenger)
          : gameState.players.find((p) => p.id === roundResult.challengedPlayer);

    return (
      <View
        style={{
          flex: 1,
          backgroundColor: colors.background,
          alignItems: "center",
          justifyContent: "center",
          gap: spacing.md,
          padding: spacing.lg,
        }}
      >
        <Text
          {...headingProps(2)}
          style={{
            fontFamily: typography.h3.fontFamily,
            fontSize: typography.h3.fontSize,
            color: colors.textPrimary,
            textAlign: "center",
          }}
        >
          {roundResult.challengeType === "spot-on" ? "Spot on!" : "Challenge!"}
        </Text>
        <Text
          style={{
            fontFamily: typography.body.fontFamily,
            fontSize: typography.body.fontSize,
            color: colors.textSecondary,
            textAlign: "center",
          }}
        >
          {roundResult.challengerWins
            ? `${winner?.name ?? "Challenger"} wins the challenge!`
            : `${winner?.name ?? "Bidder"} was right!`}
          {"\n"}
          {loser?.name ?? "Loser"} loses a die.
        </Text>
        <Text
          style={{
            fontFamily: typography.caption.fontFamily,
            fontSize: typography.caption.fontSize,
            color: colors.textSecondary,
          }}
        >
          Next round starting soon…
        </Text>
      </View>
    );
  }

  // ── Game over ───────────────────────────────────────────────────────────────
  if (phase === "game-over" || gameState?.gameOver) {
    const resolvedWinnerId = winnerId ?? gameState?.winner ?? null;
    const winnerPlayer = gameState?.players.find((p) => p.id === resolvedWinnerId);
    const isWinner = resolvedWinnerId === myUserId;

    return (
      <View
        style={{
          flex: 1,
          backgroundColor: colors.background,
          alignItems: "center",
          justifyContent: "center",
          gap: spacing.md,
          padding: spacing.lg,
        }}
      >
        <Text
          {...headingProps(1)}
          style={{
            fontFamily: typography.h2.fontFamily,
            fontSize: typography.h2.fontSize,
            color: isWinner ? colors.primary : colors.textPrimary,
            textAlign: "center",
          }}
        >
          {isWinner ? "You won!" : "Game over"}
        </Text>
        {winnerPlayer && !isWinner ? (
          <Text
            style={{
              fontFamily: typography.body.fontFamily,
              fontSize: typography.body.fontSize,
              color: colors.textSecondary,
              textAlign: "center",
            }}
          >
            {winnerPlayer.name} wins this round.
          </Text>
        ) : null}
        <Button label="Back to lobby" onPress={handleLeave} style={{ marginTop: spacing.md }} />
      </View>
    );
  }

  // ── Active game ─────────────────────────────────────────────────────────────
  if (!gameState) return null;

  const isMyTurn = gameState.players[gameState.currentPlayerIndex]?.id === myUserId;
  const currentPlayerName =
    gameState.players[gameState.currentPlayerIndex]?.name ?? "Unknown";

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      {/* Header */}
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
          paddingHorizontal: spacing.md,
          paddingVertical: spacing.sm,
          backgroundColor: colors.surfaceRaised,
          borderBottomWidth: 1,
          borderBottomColor: colors.border,
        }}
      >
        <Text
          style={{
            fontFamily: typography.bodyMedium.fontFamily,
            fontSize: 13,
            color: colors.textSecondary,
          }}
        >
          Round {gameState.roundNumber}
        </Text>
        <Text
          style={{
            fontFamily: typography.bodyMedium.fontFamily,
            fontSize: 13,
            color: isMyTurn ? colors.primary : colors.textSecondary,
          }}
        >
          {isMyTurn ? "Your turn" : `${currentPlayerName}'s turn`}
        </Text>
        <View style={{ flexDirection: "row", gap: spacing.sm, alignItems: "center" }}>
          <Pressable onPress={() => setChatOpen((o) => !o)}>
            <Text
              style={{
                fontFamily: typography.body.fontFamily,
                fontSize: 13,
                color: chatOpen ? colors.primary : colors.textSecondary,
              }}
            >
              Chat
            </Text>
          </Pressable>
          <Pressable onPress={handleLeave}>
            <Text
              style={{
                fontFamily: typography.body.fontFamily,
                fontSize: 13,
                color: colors.textSecondary,
              }}
            >
              Leave
            </Text>
          </Pressable>
        </View>
      </View>

      <ScrollView contentContainerStyle={{ padding: spacing.md, gap: spacing.sm }}>
        {/* Player roster */}
        <View style={{ gap: 4 }}>
          {gameState.players.map((p) => (
            <PlayerRow
              key={p.id}
              playerId={p.id}
              name={p.name}
              diceCount={p.diceCount}
              dice={p.dice}
              isCurrentTurn={gameState.players[gameState.currentPlayerIndex]?.id === p.id}
              isMe={p.id === myUserId}
              isEliminated={p.isEliminated}
            />
          ))}
        </View>

        {/* Current bid */}
        <BidDisplay gameState={gameState} />
      </ScrollView>

      {/* Controls — only shown when it's this player's turn */}
      {isMyTurn ? (
        <View
          style={{
            backgroundColor: colors.surfaceRaised,
            borderTopWidth: 1,
            borderTopColor: colors.border,
            paddingBottom: chatOpen ? 0 : insets.bottom || spacing.md,
          }}
        >
          <BidControls
            gameState={gameState}
            onBid={(q, fv) => store.placeBid(q, fv)}
            onChallenge={() => store.challenge()}
            onSpotOn={() => store.spotOn()}
          />
        </View>
      ) : (
        <View
          style={{
            padding: spacing.md,
            paddingBottom: chatOpen ? spacing.md : (insets.bottom || 0) + spacing.md,
            backgroundColor: colors.surface,
            alignItems: "center",
            borderTopWidth: 1,
            borderTopColor: colors.border,
          }}
        >
          <Text
            style={{
              fontFamily: typography.body.fontFamily,
              fontSize: typography.body.fontSize,
              color: colors.textSecondary,
            }}
          >
            Waiting for {currentPlayerName}…
          </Text>
        </View>
      )}

      {/* Chat panel — toggled via header button */}
      {chatOpen && (
        <View style={{ paddingBottom: insets.bottom || 0 }}>
          <ChatPanel maxHeight={280} placeholder="Message your opponent…" />
        </View>
      )}
    </View>
  );
}
