import { usePathname } from "expo-router";
import React, { useCallback, useEffect, useRef } from "react";
import { StyleSheet, View } from "react-native";
import { useGameStore } from "../../engine/gameStore";
import { TutorialOverlay } from "./TutorialOverlay";
import { TUTORIAL_STEPS } from "./tutorialSteps";
import { useTutorialHighlightStore } from "./tutorialHighlightStore";

/**
 * Full-viewport tutorial chrome — mounted at the app root so the dimmer
 * covers the header as well as the game board (including interactive steps).
 * Only visible on `/play` so leaving the game never leaves a stuck overlay.
 */
export function TutorialHost() {
  const pathname = usePathname();
  const onPlayRoute = pathname === "/play";
  const tutorialMode = useGameStore((s) => s.tutorialMode);
  const tutorialStep = useGameStore((s) => s.tutorialStep);
  const gameState = useGameStore((s) => s.gameState);
  const phase = useGameStore((s) => s.phase);
  const advanceTutorialStep = useGameStore((s) => s.advanceTutorialStep);
  const completeTutorial = useGameStore((s) => s.completeTutorial);
  const skipTutorial = useGameStore((s) => s.skipTutorial);
  const continueToNextRound = useGameStore((s) => s.continueToNextRound);
  const measurements = useTutorialHighlightStore((s) => s.measurements);

  /** Prevents Strict Mode / re-render double-advances for auto steps. */
  const autoAdvancedFrom = useRef<Set<number>>(new Set());

  useEffect(() => {
    if (tutorialMode && tutorialStep === 0) {
      autoAdvancedFrom.current.clear();
    }
  }, [tutorialMode, tutorialStep]);

  useEffect(() => {
    if (!tutorialMode || !onPlayRoute || !gameState) return;
    const step = TUTORIAL_STEPS[tutorialStep];
    if (!step) return;
    if (autoAdvancedFrom.current.has(tutorialStep)) return;

    let shouldAdvance = false;

    if (step.action === "wait-for-bid") {
      shouldAdvance = gameState.roundHistory.some(
        (a) => a.type === "bid" && a.playerId === "human",
      );
    } else if (step.action === "wait-for-ai") {
      if (phase === "round-result" || phase === "game-over") {
        shouldAdvance = true;
      } else {
        const humanTurn =
          phase === "playing" &&
          gameState.players[gameState.currentPlayerIndex]?.id === "human";
        const aiBid = gameState.roundHistory.some(
          (a) => a.type === "bid" && a.playerId !== "human",
        );
        shouldAdvance = humanTurn && aiBid && !!gameState.currentBid;
      }
    } else if (step.action === "wait-for-round-result") {
      shouldAdvance = phase === "round-result" || phase === "game-over";
    }

    if (!shouldAdvance) return;
    autoAdvancedFrom.current.add(tutorialStep);
    advanceTutorialStep();
  }, [tutorialMode, onPlayRoute, tutorialStep, gameState, phase, advanceTutorialStep]);

  const onNext = useCallback(() => {
    const step = TUTORIAL_STEPS[tutorialStep];
    if (!step) return;
    if (step.action === "celebrate") {
      completeTutorial();
      const { phase: currentPhase, gameState: current } = useGameStore.getState();
      if (currentPhase === "round-result" && current && !current.gameOver) {
        continueToNextRound();
      }
      return;
    }
    advanceTutorialStep();
  }, [tutorialStep, advanceTutorialStep, completeTutorial, continueToNextRound]);

  if (!onPlayRoute || !tutorialMode || tutorialStep >= TUTORIAL_STEPS.length) return null;

  return (
    <View style={[StyleSheet.absoluteFill, { zIndex: 100 }]} pointerEvents="box-none">
      <TutorialOverlay
        stepIndex={tutorialStep}
        measurements={measurements}
        containerOffset={{ x: 0, y: 0 }}
        onNext={onNext}
        onSkip={skipTutorial}
      />
    </View>
  );
}
