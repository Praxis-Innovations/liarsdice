import React from "react";
import { Pressable, ScrollView, Text, View } from "react-native";
import { useGameStore } from "../../engine/gameStore";
import { useTheme } from "../../theme/ThemeProvider";
import { Footer } from "../shared/Footer";
import { ActionBar } from "./ActionBar";
import { BidHistory } from "./BidHistory";
import { BidPanel } from "./BidPanel";
import { DiceRow } from "./DiceDisplay";
import { GameOver } from "./GameOver";
import { GameSetup } from "./GameSetup";
import { GameStatus } from "./GameStatus";
import { PlayerPanel } from "./PlayerPanel";
import { RoundResult } from "./RoundResult";

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

  if (phase === "setup" || !gameState) {
    return (
      <ScrollView style={{ flex: 1, backgroundColor: colors.background }} contentContainerStyle={{ flexGrow: 1 }}>
        <View style={{ padding: spacing.lg, flexGrow: 1, justifyContent: "center" }}>
          <GameSetup settings={settings} onUpdateSettings={updateSettings} onStart={startGame} />
        </View>
        <Footer />
      </ScrollView>
    );
  }

  if (phase === "game-over") {
    return (
      <ScrollView style={{ flex: 1, backgroundColor: colors.background }} contentContainerStyle={{ flexGrow: 1 }}>
        <View style={{ padding: spacing.lg, flexGrow: 1 }}>
          <GameOver state={gameState} onPlayAgain={resetGame} />
        </View>
        <Footer />
      </ScrollView>
    );
  }

  const humanPlayer = gameState.players.find((p) => p.id === "human");
  const isHumanTurn = gameState.players[gameState.currentPlayerIndex].id === "human";
  const showingResult = phase === "round-result";

  const lastActions = new Map<string, string>();
  for (const action of gameState.roundHistory) {
    if (action.type === "bid" && action.bid) {
      lastActions.set(action.playerId, `Bid ${action.bid.quantity} × ${action.bid.faceValue}s`);
    } else if (action.type === "challenge") {
      lastActions.set(action.playerId, "Called Liar!");
    } else if (action.type === "spot-on") {
      lastActions.set(action.playerId, "Called Spot On!");
    }
  }

  return (
    <ScrollView style={{ flex: 1, backgroundColor: colors.background }} contentContainerStyle={{ flexGrow: 1 }}>
      <View style={{ padding: spacing.md, maxWidth: 900, width: "100%", alignSelf: "center", flexGrow: 1 }}>
      <View className="flex-row items-center justify-between" style={{ marginBottom: spacing.md }}>
        <Pressable onPress={resetGame}>
          <Text style={{ color: colors.textSecondary, fontFamily: typography.caption.fontFamily, fontSize: 12 }}>&larr; New Game</Text>
        </Pressable>
        <View className="flex-row" style={{ gap: spacing.sm }}>
          <Pressable
            onPress={toggleHints}
            style={{
              paddingHorizontal: spacing.sm,
              paddingVertical: 4,
              borderRadius: radii.sm,
              backgroundColor: showHints ? `${colors.accent}22` : "transparent",
            }}
          >
            <Text style={{ color: showHints ? colors.accent : colors.textSecondary, fontFamily: typography.caption.fontFamily, fontSize: 11 }}>
              {showHints ? "Hints On" : "Hints Off"}
            </Text>
          </Pressable>
          <Pressable onPress={toggleSound} style={{ paddingHorizontal: spacing.sm, paddingVertical: 4 }}>
            <Text style={{ color: colors.textSecondary, fontFamily: typography.caption.fontFamily, fontSize: 11 }}>
              {soundEnabled ? "Sound On" : "Sound Off"}
            </Text>
          </Pressable>
        </View>
      </View>

      <GameStatus state={gameState} phase={phase} />

      {showingResult && gameState.lastRoundResult ? (
        <RoundResult state={gameState} onContinue={gameState.gameOver ? resetGame : continueToNextRound} animating={animatingReveal} />
      ) : (
        <View style={{ gap: spacing.md }}>
          <View className="flex-row flex-wrap" style={{ gap: spacing.sm }}>
            {gameState.players.map((player) => (
              <PlayerPanel
                key={player.id}
                player={player}
                isCurrentTurn={gameState.players[gameState.currentPlayerIndex].id === player.id}
                isHuman={player.id === "human"}
                showDice={showingResult}
                highlightValues={showingResult && gameState.currentBid ? [gameState.currentBid.faceValue] : undefined}
                onesWild={gameState.onesWild}
                lastAction={lastActions.get(player.id)}
              />
            ))}
          </View>

          {humanPlayer && !humanPlayer.isEliminated ? (
            <View style={{ backgroundColor: colors.surfaceRaised, borderRadius: radii.md, padding: spacing.md }}>
              <Text style={{ color: colors.accent, fontFamily: typography.bodySemibold.fontFamily, fontSize: 12, marginBottom: spacing.sm }}>
                Your Dice
              </Text>
              <DiceRow dice={humanPlayer.dice} size="lg" wildValue={gameState.onesWild} />
            </View>
          ) : null}

          <View style={{ gap: spacing.sm }}>
            <BidHistory state={gameState} />

            {isHumanTurn && phase === "playing" ? (
              <>
                <BidPanel state={gameState} onBid={placeBid} showHints={showHints} />
                <ActionBar state={gameState} onChallenge={challenge} onSpotOn={spotOn} showHints={showHints} />
              </>
            ) : null}
          </View>
        </View>
      )}
      </View>
      <Footer />
    </ScrollView>
  );
}
