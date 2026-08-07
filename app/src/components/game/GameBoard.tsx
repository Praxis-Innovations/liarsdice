import React from "react";
import { Pressable, ScrollView, Text, View, useWindowDimensions } from "react-native";
import { useGameStore } from "../../engine/gameStore";
import { getBreakpoint } from "../../lib/breakpoints";
import { useTheme } from "../../theme/ThemeProvider";
import { Footer } from "../shared/Footer";
import { ActionBar } from "./ActionBar";
import { BidHistory } from "./BidHistory";
import { BidPanel } from "./BidPanel";
import { GameOver } from "./GameOver";
import { GameSetup } from "./GameSetup";
import { GameStatus } from "./GameStatus";
import { PlayerPanel } from "./PlayerPanel";
import { RoundResult } from "./RoundResult";

function opponentColumnCount(width: number, opponentCount: number): number {
  if (width < 480) return 1;
  if (width < 720) return Math.min(2, opponentCount);
  return Math.min(3, opponentCount);
}

export function GameBoard() {
  const {
    gameState,
    phase,
    settings,
    showHints,
    soundEnabled,
    animatingReveal,
    updateSettings,
    startGame,
    placeBid,
    challenge,
    spotOn,
    continueToNextRound,
    resetGame,
    toggleHints,
    toggleSound,
  } = useGameStore();

  const { colors, radii, spacing, typography } = useTheme();
  const { width } = useWindowDimensions();
  const bp = getBreakpoint(width);
  const compact = bp === "phone";
  const pagePad = compact ? spacing.sm : spacing.md;
  // Explicit pixel column width — percentage width + maxWidth is unreliable on RN-web.
  const columnWidth = Math.min(width, 720);

  // RN-web ScrollView content shrink-wraps unless width is forced.
  const scrollContent = { flexGrow: 1, width: "100%" as const };

  if (phase === "setup" || !gameState) {
    return (
      <ScrollView style={{ flex: 1, backgroundColor: colors.background }} contentContainerStyle={scrollContent}>
        <View
          style={{
            padding: compact ? spacing.md : spacing.lg,
            flexGrow: 1,
            justifyContent: "center",
            width: columnWidth,
            alignSelf: "center",
          }}
        >
          <GameSetup settings={settings} onUpdateSettings={updateSettings} onStart={startGame} />
        </View>
        <Footer />
      </ScrollView>
    );
  }

  if (phase === "game-over") {
    return (
      <ScrollView style={{ flex: 1, backgroundColor: colors.background }} contentContainerStyle={scrollContent}>
        <View
          style={{
            padding: compact ? spacing.md : spacing.lg,
            flexGrow: 1,
            width: columnWidth,
            alignSelf: "center",
          }}
        >
          <GameOver state={gameState} onPlayAgain={resetGame} />
        </View>
        <Footer />
      </ScrollView>
    );
  }

  const isHumanTurn = gameState.players[gameState.currentPlayerIndex].id === "human";
  const showingResult = phase === "round-result";
  const opponents = gameState.players.filter((p) => p.id !== "human");
  const human = gameState.players.find((p) => p.id === "human");
  const columns = opponentColumnCount(width, opponents.length);
  const contentWidth = Math.max(0, columnWidth - pagePad * 2);
  const seatGap = spacing.sm;
  const seatWidth =
    columns <= 1
      ? contentWidth
      : Math.floor((contentWidth - seatGap * (columns - 1)) / columns);

  const lastActions = new Map<string, string>();
  for (const action of gameState.roundHistory) {
    if (action.type === "bid" && action.bid) {
      lastActions.set(action.playerId, `${action.bid.quantity} × ${action.bid.faceValue}s`);
    } else if (action.type === "challenge") {
      lastActions.set(action.playerId, "Liar!");
    } else if (action.type === "spot-on") {
      lastActions.set(action.playerId, "Spot On!");
    }
  }

  const highlightValues =
    showingResult && gameState.currentBid ? [gameState.currentBid.faceValue] : undefined;

  return (
    <ScrollView style={{ flex: 1, backgroundColor: colors.background }} contentContainerStyle={scrollContent}>
      <View
        style={{
          padding: pagePad,
          width: columnWidth,
          alignSelf: "center",
          flexGrow: 1,
        }}
      >
        <View className="flex-row items-center justify-between" style={{ marginBottom: spacing.sm }}>
          <Pressable onPress={resetGame} hitSlop={8}>
            <Text style={{ color: colors.textSecondary, fontFamily: typography.caption.fontFamily, fontSize: 12 }}>
              ← New Game
            </Text>
          </Pressable>
          <View className="flex-row" style={{ gap: spacing.xs }}>
            <Pressable
              onPress={toggleHints}
              style={{
                paddingHorizontal: spacing.sm,
                paddingVertical: 4,
                borderRadius: radii.sm,
                backgroundColor: showHints ? `${colors.accent}22` : "transparent",
              }}
            >
              <Text
                style={{
                  color: showHints ? colors.accent : colors.textSecondary,
                  fontFamily: typography.caption.fontFamily,
                  fontSize: 11,
                }}
              >
                Hints
              </Text>
            </Pressable>
            <Pressable onPress={toggleSound} style={{ paddingHorizontal: spacing.sm, paddingVertical: 4 }}>
              <Text style={{ color: colors.textSecondary, fontFamily: typography.caption.fontFamily, fontSize: 11 }}>
                {soundEnabled ? "Sound" : "Muted"}
              </Text>
            </Pressable>
          </View>
        </View>

        <GameStatus state={gameState} phase={phase} />

        {showingResult && gameState.lastRoundResult ? (
          <RoundResult
            state={gameState}
            onContinue={gameState.gameOver ? resetGame : continueToNextRound}
            animating={animatingReveal}
          />
        ) : (
          <View style={{ gap: compact ? spacing.sm : spacing.md }}>
            <View className="flex-row flex-wrap" style={{ gap: seatGap }}>
              {opponents.map((player) => (
                <PlayerPanel
                  key={player.id}
                  player={player}
                  isCurrentTurn={gameState.players[gameState.currentPlayerIndex].id === player.id}
                  isHuman={false}
                  showDice={showingResult}
                  highlightValues={highlightValues}
                  onesWild={gameState.onesWild}
                  lastAction={lastActions.get(player.id)}
                  seatWidth={seatWidth}
                />
              ))}
            </View>

            {human && !human.isEliminated ? (
              <PlayerPanel
                player={human}
                isCurrentTurn={isHumanTurn}
                isHuman
                showDice={false}
                highlightValues={highlightValues}
                onesWild={gameState.onesWild}
                lastAction={lastActions.get(human.id)}
              />
            ) : null}

            <BidHistory state={gameState} />

            {isHumanTurn && phase === "playing" ? (
              <View
                style={{
                  gap: spacing.sm,
                  paddingTop: spacing.sm,
                  borderTopWidth: 1,
                  borderTopColor: colors.border,
                }}
              >
                <BidPanel state={gameState} onBid={placeBid} showHints={showHints} />
                <ActionBar state={gameState} onChallenge={challenge} onSpotOn={spotOn} showHints={showHints} />
              </View>
            ) : null}
          </View>
        )}
      </View>
      <Footer />
    </ScrollView>
  );
}
