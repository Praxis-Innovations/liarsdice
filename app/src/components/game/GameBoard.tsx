import React, { useCallback, useEffect, useRef, useState } from "react";
import { LayoutChangeEvent, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useGameStore } from "../../engine/gameStore";
import type { DieValue } from "../../engine/types";
import { getBreakpoint } from "../../lib/breakpoints";
import { useHydrationSafeWindowDimensions } from "../../lib/useHydrationSafeWindowDimensions";
import { useTheme } from "../../theme/ThemeProvider";
import { useHeaderOffset } from "../shared/Header";
import { TutorialWelcome } from "../tutorial/TutorialWelcome";
import { useTutorialHighlightStore } from "../tutorial/tutorialHighlightStore";
import { TUTORIAL_STEPS } from "../tutorial/tutorialSteps";
import type { MeasuredRect, TutorialTargetRef } from "../tutorial/tutorialTypes";
import { ActionBar } from "./ActionBar";
import { BidPanel } from "./BidPanel";
import { GameOver } from "./GameOver";
import { GameSetup } from "./GameSetup";
import { GameTable } from "./GameTable";
import { MobileBidStrip } from "./MobileBidStrip";
import { PlayTopBar } from "./PlayTopBar";
import { RoundResult } from "./RoundResult";
import { TableBidCenter } from "./TableBidCenter";

const MAX_BOARD_WIDTH = 960;

export function GameBoard() {
  const gameState = useGameStore((s) => s.gameState);
  const phase = useGameStore((s) => s.phase);
  const settings = useGameStore((s) => s.settings);
  const showHints = useGameStore((s) => s.showHints);
  const animatingReveal = useGameStore((s) => s.animatingReveal);
  const animatingShuffle = useGameStore((s) => s.animatingShuffle);
  const tutorialMode = useGameStore((s) => s.tutorialMode);
  const tutorialStep = useGameStore((s) => s.tutorialStep);
  const showTutorialPrompt = useGameStore((s) => s.showTutorialPrompt);
  const updateSettings = useGameStore((s) => s.updateSettings);
  const startGame = useGameStore((s) => s.startGame);
  const placeBid = useGameStore((s) => s.placeBid);
  const challenge = useGameStore((s) => s.challenge);
  const spotOn = useGameStore((s) => s.spotOn);
  const continueToNextRound = useGameStore((s) => s.continueToNextRound);
  const resetGame = useGameStore((s) => s.resetGame);
  const toggleHints = useGameStore((s) => s.toggleHints);
  const startTutorial = useGameStore((s) => s.startTutorial);
  const skipTutorial = useGameStore((s) => s.skipTutorial);
  const dismissTutorialPrompt = useGameStore((s) => s.dismissTutorialPrompt);
  const advanceTutorialStep = useGameStore((s) => s.advanceTutorialStep);

  const { colors, spacing } = useTheme();
  const { width, height: windowHeight } = useHydrationSafeWindowDimensions();
  const insets = useSafeAreaInsets();
  const headerOffset = useHeaderOffset();
  const bp = getBreakpoint(width);
  const compact = bp === "phone";
  const insetBottom = Math.max(insets.bottom, 0);
  // Viewport under the global header, minus home-indicator — 90% is content, 10% split top/bottom.
  const playViewport = Math.max(0, windowHeight - headerOffset);
  const usableHeight = Math.max(0, playViewport - insetBottom);
  // Phones use all available height — fixed controls (bid strip, bid panel, action bar)
  // leave no room for the 10% air reservation and would crop the bottom on small devices.
  const contentBudget = compact ? usableHeight : Math.round(usableHeight * 0.9);
  const frameAir = Math.max(0, (usableHeight - contentBudget) / 2);
  const availableHeight = usableHeight;
  const pagePad = compact ? spacing.md + 4 : spacing.md;
  const dense = availableHeight < 580;
  const setupDensity: 0 | 1 | 2 = compact ? 2 : availableHeight < 720 ? 1 : 0;
  /** Phone stays tight; tablet/desktop get roomier play chrome. */
  const sizeTier: "compact" | "regular" | "roomy" =
    compact || (dense && bp === "tablet") ? "compact" : bp === "laptop" ? "roomy" : "regular";
  const tableMinH = sizeTier === "compact" ? 160 : 210;
  const sectionGap = sizeTier === "compact" ? 6 : spacing.sm;
  const gameContainerRef = useRef<View>(null) as React.RefObject<View>;
  const gameStatusRef = useRef<View>(null) as React.RefObject<View>;
  const humanPanelRef = useRef<View>(null) as React.RefObject<View>;
  const tableRef = useRef<View>(null) as React.RefObject<View>;
  const opponentsRef = useRef<View>(null) as React.RefObject<View>;
  const bidChromeRef = useRef<View>(null) as React.RefObject<View>;
  const bidPanelRef = useRef<View>(null) as React.RefObject<View>;
  const actionControlsRef = useRef<View>(null) as React.RefObject<View>;
  const roundResultRef = useRef<View>(null) as React.RefObject<View>;
  /** Keep the bottom chrome height stable when swapping controls ↔ result (mobile). */
  const [controlsDockH, setControlsDockH] = useState(0);

  const setTutorialMeasurements = useTutorialHighlightStore((s) => s.setMeasurements);
  const clearTutorialMeasurements = useTutorialHighlightStore((s) => s.clearMeasurements);

  const measureAll = useCallback(() => {
    const refs: Partial<Record<TutorialTargetRef, React.RefObject<View>>> = {
      gameStatus: gameStatusRef,
      humanPanel: humanPanelRef,
      table: tableRef,
      opponentPanels: opponentsRef,
      bidChrome: bidChromeRef,
      bidPanel: bidPanelRef,
      actionControls: actionControlsRef,
      roundResult: roundResultRef,
    };

    const newMeasurements: Partial<Record<TutorialTargetRef, MeasuredRect>> = {};
    let pending = Object.keys(refs).length;

    for (const [key, ref] of Object.entries(refs)) {
      if (ref.current) {
        ref.current.measureInWindow((x, y, w, h) => {
          if (w > 0 && h > 0) {
            newMeasurements[key as TutorialTargetRef] = { x, y, width: w, height: h };
          }
          pending--;
          if (pending === 0) {
            setTutorialMeasurements(newMeasurements);
          }
        });
      } else {
        pending--;
        if (pending === 0) {
          setTutorialMeasurements(newMeasurements);
        }
      }
    }
  }, [setTutorialMeasurements]);

  useEffect(() => {
    if (!tutorialMode) {
      clearTutorialMeasurements();
      return;
    }
    let cancelled = false;
    const id = requestAnimationFrame(() => {
      measureAll();
      // Result card mounts after Liar — remeasure once layout settles.
      if (phase === "round-result") {
        requestAnimationFrame(() => {
          if (!cancelled) measureAll();
        });
      }
    });
    return () => {
      cancelled = true;
      cancelAnimationFrame(id);
    };
  }, [tutorialMode, tutorialStep, phase, gameState, width, availableHeight, measureAll, clearTutorialMeasurements]);

  const handleTutorialSkip = useCallback(() => {
    skipTutorial();
  }, [skipTutorial]);

  const handleResultContinue = useCallback(() => {
    if (tutorialMode && TUTORIAL_STEPS[tutorialStep]?.id === "round-result") {
      advanceTutorialStep();
      return;
    }
    if (!gameState) return;
    if (gameState.gameOver) {
      resetGame();
      return;
    }
    continueToNextRound();
  }, [tutorialMode, tutorialStep, advanceTutorialStep, gameState, resetGame, continueToNextRound]);

  const onControlsDockLayout = useCallback(
    (e: LayoutChangeEvent) => {
      if (phase === "round-result") return;
      const h = Math.round(e.nativeEvent.layout.height);
      if (h > 0 && Math.abs(h - controlsDockH) > 1) setControlsDockH(h);
    },
    [phase, controlsDockH],
  );

  const shellStyle = {
    flex: 1,
    width: "100%" as const,
    backgroundColor: colors.background,
  };
  const boardStyle = (clip: boolean) => ({
    flex: 1,
    width: "100%" as const,
    maxWidth: MAX_BOARD_WIDTH,
    alignSelf: "center" as const,
    paddingHorizontal: pagePad,
    paddingTop: compact ? 4 : frameAir,
    paddingBottom: frameAir + insetBottom,
    overflow: (clip ? "hidden" : "visible") as "hidden" | "visible",
  });

  const wrapBoard = (
    content: React.ReactNode,
    opts?: {
      boardRef?: React.RefObject<View>;
      clip?: boolean;
    },
  ) => (
    <View style={shellStyle}>
      <View
        ref={opts?.boardRef}
        collapsable={false}
        style={boardStyle(opts?.clip ?? false)}
      >
        {content}
      </View>
    </View>
  );

  if (phase === "setup" || !gameState) {
    return wrapBoard(
      <View style={{ flex: 1, justifyContent: "center", minHeight: 0 }}>
        <GameSetup
          settings={settings}
          onUpdateSettings={updateSettings}
          onStart={startGame}
          onStartTutorial={startTutorial}
          density={setupDensity}
        />
      </View>,
    );
  }

  if (phase === "game-over" && !tutorialMode) {
    return wrapBoard(
      <View style={{ flex: 1, justifyContent: "center", minHeight: 0 }}>
        <GameOver state={gameState} onPlayAgain={resetGame} />
      </View>,
    );
  }

  const isHumanTurn = gameState.players[gameState.currentPlayerIndex].id === "human";
  const showingResult = phase === "round-result";
  const currentPlayerId = gameState.players[gameState.currentPlayerIndex].id;
  // Hold inputs while dice tumble so the player never bids on scrambled faces.
  const controlsEnabled = isHumanTurn && phase === "playing" && !animatingShuffle;

  // Count toward the bid: face value, plus wild ones when applicable.
  const resultBid = gameState.lastRoundResult?.currentBid ?? gameState.currentBid;
  const highlightValues: DieValue[] | undefined =
    showingResult && resultBid
      ? gameState.onesWild && resultBid.faceValue !== 1
        ? [resultBid.faceValue, 1]
        : [resultBid.faceValue]
      : undefined;

  return wrapBoard(
    <>
      <View
        style={{
          flex: 1,
          minHeight: 0,
          maxHeight: contentBudget,
          width: "100%",
          gap: sectionGap,
        }}
      >
        <PlayTopBar
          statusRef={gameStatusRef}
          state={gameState}
          phase={phase}
          dense={dense}
          compact={compact}
          tutorialMode={tutorialMode}
          showHints={showHints}
          onBack={tutorialMode ? handleTutorialSkip : resetGame}
          onToggleHints={toggleHints}
        />

        {/* Table absorbs leftover height inside the 90% frame. */}
        <View
          style={{
            flex: 1,
            width: "100%",
            minHeight: tableMinH,
          }}
        >
          <GameTable
            players={gameState.players}
            currentPlayerId={currentPlayerId}
            showDice={showingResult}
            highlightValues={highlightValues}
            onesWild={gameState.onesWild}
            revealedDice={showingResult ? gameState.lastRoundResult?.allDice : undefined}
            dense={dense}
            sizeTier={sizeTier}
            shuffling={animatingShuffle}
            humanSeatRef={humanPanelRef}
            tableRef={tableRef}
            opponentsRef={opponentsRef}
            renderCenter={({ maxWidth, maxHeight }) => {
              // Phone: felt stays empty during play; show Round over after a challenge.
              if (compact && !showingResult) return null;
              return (
                <View ref={bidChromeRef} collapsable={false}>
                  <TableBidCenter
                    state={gameState}
                    dense={false}
                    sizeTier={sizeTier}
                    maxWidth={maxWidth}
                    maxHeight={maxHeight}
                    roundOver={showingResult}
                  />
                </View>
              );
            }}
          />
        </View>

        {showingResult && gameState.lastRoundResult ? (
          <View
            ref={roundResultRef}
            collapsable={false}
            style={{
              width: "100%",
              flexShrink: 0,
              // Lock to the controls dock height so the table doesn't jump on mobile.
              ...(compact && controlsDockH > 0
                ? { height: controlsDockH, minHeight: controlsDockH }
                : null),
            }}
          >
            <RoundResult
              state={gameState}
              onContinue={handleResultContinue}
              animating={animatingReveal}
              compact={compact}
              fillDock={compact}
              maxWidth={width - pagePad * 2}
            />
          </View>
        ) : (
          <View
            onLayout={onControlsDockLayout}
            style={{
              gap: sectionGap,
              flexShrink: 0,
              width: "100%",
            }}
          >
            {compact ? (
              <View ref={bidChromeRef} collapsable={false}>
                <MobileBidStrip state={gameState} dense={dense} />
              </View>
            ) : null}
            <View ref={bidPanelRef} collapsable={false}>
              <BidPanel
                state={gameState}
                onBid={placeBid}
                showHints={showHints}
                enabled={controlsEnabled}
                sizeTier={sizeTier}
              />
            </View>
            <View ref={actionControlsRef} collapsable={false}>
              <ActionBar
                state={gameState}
                onChallenge={challenge}
                onSpotOn={spotOn}
                showHints={showHints}
                enabled={controlsEnabled && !!gameState.currentBid}
              />
            </View>
          </View>
        )}
      </View>

      {showTutorialPrompt ? (
        <TutorialWelcome onStart={startTutorial} onSkip={dismissTutorialPrompt} />
      ) : null}
    </>,
    {
      boardRef: gameContainerRef,
      clip: true,
    },
  );
}
