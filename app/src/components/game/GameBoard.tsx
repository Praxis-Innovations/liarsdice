import React, { useCallback, useEffect, useRef, useState } from "react";
import { Pressable, ScrollView, Text, View, useWindowDimensions } from "react-native";
import { useGameStore } from "../../engine/gameStore";
import { getBreakpoint } from "../../lib/breakpoints";
import { useTheme } from "../../theme/ThemeProvider";
import { Footer } from "../shared/Footer";
import { TutorialOverlay, type MeasuredRect } from "../tutorial/TutorialOverlay";
import { TutorialWelcome } from "../tutorial/TutorialWelcome";
import { TUTORIAL_STEPS } from "../tutorial/tutorialSteps";
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
    tutorialMode,
    tutorialStep,
    showTutorialPrompt,
    updateSettings,
    startGame,
    placeBid,
    challenge,
    spotOn,
    continueToNextRound,
    resetGame,
    toggleHints,
    toggleSound,
    startTutorial,
    skipTutorial,
    advanceTutorialStep,
    dismissTutorialPrompt,
    completeTutorial,
  } = useGameStore();

  const { colors, radii, spacing, typography } = useTheme();
  const { width, height: screenHeight } = useWindowDimensions();
  const bp = getBreakpoint(width);
  const compact = bp === "phone";
  const pagePad = compact ? spacing.xs : spacing.md;
  const columnWidth = Math.min(width, 720);
  const scrollContent = { flexGrow: 1, width: "100%" as const };

  const gameContainerRef = useRef<View>(null) as React.RefObject<View>;
  const gameStatusRef = useRef<View>(null) as React.RefObject<View>;
  const humanPanelRef = useRef<View>(null) as React.RefObject<View>;
  const opponentPanelsRef = useRef<View>(null) as React.RefObject<View>;
  const bidPanelRef = useRef<View>(null) as React.RefObject<View>;
  const actionControlsRef = useRef<View>(null) as React.RefObject<View>;
  const scrollViewRef = useRef<ScrollView>(null) as React.RefObject<ScrollView>;

  const [measurements, setMeasurements] = useState<Record<string, MeasuredRect>>({});
  const [containerOffset, setContainerOffset] = useState({ x: 0, y: 0 });

  const measureAll = useCallback(() => {
    if (gameContainerRef.current) {
      gameContainerRef.current.measureInWindow((cx, cy) => {
        setContainerOffset({ x: cx, y: cy });
      });
    }

    const refs: Record<string, React.RefObject<View>> = {
      gameStatus: gameStatusRef,
      humanPanel: humanPanelRef,
      opponentPanels: opponentPanelsRef,
      bidPanel: bidPanelRef,
      actionControls: actionControlsRef,
    };

    const newMeasurements: Record<string, MeasuredRect> = {};
    let pending = Object.keys(refs).length;

    for (const [key, ref] of Object.entries(refs)) {
      if (ref.current) {
        ref.current.measureInWindow((x, y, w, h) => {
          if (w > 0 && h > 0) {
            newMeasurements[key] = { x, y, width: w, height: h };
          }
          pending--;
          if (pending === 0) {
            setMeasurements(newMeasurements);
          }
        });
      } else {
        pending--;
        if (pending === 0) {
          setMeasurements(newMeasurements);
        }
      }
    }
  }, []);

  useEffect(() => {
    if (!tutorialMode) return;
    const id = requestAnimationFrame(() => {
      requestAnimationFrame(measureAll);
    });
    return () => cancelAnimationFrame(id);
  }, [tutorialMode, tutorialStep, phase, width, screenHeight, measureAll]);

  const prevPhaseRef = useRef(phase);
  useEffect(() => {
    if (!tutorialMode) {
      prevPhaseRef.current = phase;
      return;
    }

    const prevPhase = prevPhaseRef.current;
    prevPhaseRef.current = phase;

    const step = TUTORIAL_STEPS[tutorialStep];
    if (!step) return;

    if (step.action === "wait-for-ai" && prevPhase === "ai-thinking" && phase === "playing") {
      advanceTutorialStep();
    }
    if (step.action === "wait-for-round-result" && phase === "round-result") {
      advanceTutorialStep();
    }
  }, [phase, tutorialMode, tutorialStep, advanceTutorialStep]);

  const prevHistoryLenRef = useRef(0);
  useEffect(() => {
    if (!tutorialMode || !gameState) return;

    const currentLen = gameState.roundHistory.length;
    const step = TUTORIAL_STEPS[tutorialStep];

    if (step?.action === "wait-for-bid" && currentLen > prevHistoryLenRef.current) {
      const lastAction = gameState.roundHistory[currentLen - 1];
      if (lastAction?.playerId === "human" && lastAction.type === "bid") {
        advanceTutorialStep();
      }
    }

    prevHistoryLenRef.current = currentLen;
  }, [gameState?.roundHistory.length, tutorialMode, tutorialStep, advanceTutorialStep, gameState]);

  const handleTutorialNext = useCallback(() => {
    const step = TUTORIAL_STEPS[tutorialStep];
    if (!step) return;

    if (step.action === "celebrate") {
      completeTutorial();
      resetGame();
      return;
    }

    advanceTutorialStep();
  }, [tutorialStep, advanceTutorialStep, completeTutorial, resetGame]);

  const handleTutorialSkip = useCallback(() => {
    skipTutorial();
  }, [skipTutorial]);

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
          <GameSetup settings={settings} onUpdateSettings={updateSettings} onStart={startGame} onStartTutorial={startTutorial} />
        </View>
        <Footer />
      </ScrollView>
    );
  }

  if (phase === "game-over" && !tutorialMode) {
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

  const showBidPanel = isHumanTurn && phase === "playing";
  const showActionControls = isHumanTurn && phase === "playing" && gameState.currentBid;

  const gameContent = (
    <View
      style={{
        padding: pagePad,
        width: columnWidth,
        alignSelf: "center",
        flex: 1,
      }}
    >
      <View className="flex-row items-center justify-between" style={{ marginBottom: compact ? 4 : spacing.sm }}>
        <Pressable onPress={tutorialMode ? handleTutorialSkip : resetGame} hitSlop={8}>
          <Text style={{ color: colors.textSecondary, fontFamily: typography.caption.fontFamily, fontSize: 12 }}>
            {tutorialMode ? "← Exit Tutorial" : "← New Game"}
          </Text>
        </Pressable>
        {!tutorialMode ? (
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
        ) : null}
      </View>

      <View ref={gameStatusRef} collapsable={false}>
        <GameStatus state={gameState} phase={phase} />
      </View>

      {showingResult && gameState.lastRoundResult ? (
        <RoundResult
          state={gameState}
          onContinue={gameState.gameOver ? resetGame : continueToNextRound}
          animating={animatingReveal}
        />
      ) : (
        <View style={{ gap: compact ? 6 : spacing.sm, flex: 1 }}>
          <View ref={opponentPanelsRef} collapsable={false} className="flex-row flex-wrap" style={{ gap: seatGap }}>
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
            <View ref={humanPanelRef} collapsable={false}>
              <PlayerPanel
                player={human}
                isCurrentTurn={isHumanTurn}
                isHuman
                showDice={false}
                highlightValues={highlightValues}
                onesWild={gameState.onesWild}
                lastAction={lastActions.get(human.id)}
              />
            </View>
          ) : null}

          <BidHistory state={gameState} />

          {showBidPanel ? (
            <View
              style={{
                gap: compact ? 6 : spacing.sm,
                paddingTop: compact ? 4 : spacing.sm,
                borderTopWidth: 1,
                borderTopColor: colors.border,
              }}
            >
              <View ref={bidPanelRef} collapsable={false}>
                <BidPanel state={gameState} onBid={placeBid} showHints={showHints} />
              </View>
              <View ref={actionControlsRef} collapsable={false}>
                <ActionBar state={gameState} onChallenge={challenge} onSpotOn={spotOn} showHints={showHints} />
              </View>
            </View>
          ) : null}
        </View>
      )}
    </View>
  );

  return (
    <View ref={gameContainerRef} collapsable={false} style={{ flex: 1, backgroundColor: colors.background }}>
      <ScrollView
        ref={scrollViewRef}
        style={{ flex: 1 }}
        contentContainerStyle={scrollContent}
        scrollEventThrottle={16}
      >
        {gameContent}
        {!tutorialMode ? <Footer /> : null}
      </ScrollView>

      {showTutorialPrompt ? (
        <TutorialWelcome onStart={startTutorial} onSkip={dismissTutorialPrompt} />
      ) : null}

      {tutorialMode && tutorialStep < TUTORIAL_STEPS.length ? (
        <TutorialOverlay
          stepIndex={tutorialStep}
          measurements={measurements}
          containerOffset={containerOffset}
          onNext={handleTutorialNext}
          onSkip={handleTutorialSkip}
        />
      ) : null}
    </View>
  );
}
