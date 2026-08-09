import AsyncStorage from "@react-native-async-storage/async-storage";
import { SHUFFLE_DURATION_MS, useGameStore } from "../gameStore";
import type { GameState } from "../types";

function baseState(overrides: Partial<GameState> = {}): GameState {
  return {
    players: [
      {
        id: "human",
        name: "You",
        dice: [1, 2, 3, 4, 5],
        diceCount: 5,
        isAI: false,
        isEliminated: false,
        hasTriggeredPalifico: false,
      },
      {
        id: "ai-1",
        name: "Silver Fox",
        dice: [2, 2, 3, 4, 5],
        diceCount: 5,
        isAI: true,
        aiDifficulty: "easy",
        isEliminated: false,
        hasTriggeredPalifico: false,
      },
    ],
    currentPlayerIndex: 0,
    currentBid: { quantity: 3, faceValue: 2 },
    lastBidder: "ai-1",
    roundHistory: [],
    roundNumber: 1,
    isFirstBidOfRound: false,
    isPalificoRound: false,
    palificoPlayerId: null,
    onesWild: true,
    gameOver: false,
    winner: null,
    lastRoundResult: {
      challenger: "human",
      challengedPlayer: "ai-1",
      challengeType: "liar",
      currentBid: { quantity: 3, faceValue: 2 },
      allDice: {},
      actualCount: 1,
      challengerWins: true,
      loser: "ai-1",
      diceGained: false,
    },
    settings: {
      enableSpotOn: true,
      enablePalifico: false,
      playerCount: 2,
      aiDifficulty: "easy",
      playerName: "You",
    },
    ...overrides,
  };
}

beforeEach(async () => {
  await AsyncStorage.clear();
  jest.useFakeTimers();
  useGameStore.setState({
    gameState: null,
    phase: "setup",
    animatingReveal: false,
    animatingShuffle: false,
    tutorialMode: false,
    tutorialStep: 0,
    showTutorialPrompt: false,
    prefsLoaded: true,
    tutorialCompleted: true,
    showHints: false,
    soundEnabled: true,
  });
});

afterEach(() => {
  jest.clearAllTimers();
  jest.useRealTimers();
});

describe("gameStore shuffle", () => {
  it("sets animatingShuffle until the shuffle duration elapses", () => {
    useGameStore.setState({
      gameState: baseState(),
      phase: "round-result",
    });

    useGameStore.getState().continueToNextRound();

    expect(useGameStore.getState().animatingShuffle).toBe(true);
    expect(useGameStore.getState().phase).toBe("playing");

    jest.advanceTimersByTime(SHUFFLE_DURATION_MS - 1);
    expect(useGameStore.getState().animatingShuffle).toBe(true);

    jest.advanceTimersByTime(1);
    expect(useGameStore.getState().animatingShuffle).toBe(false);
  });

  it("waits for shuffle before starting an AI turn", async () => {
    // AI lost → AI opens the next round.
    useGameStore.setState({
      gameState: baseState({
        lastRoundResult: {
          challenger: "human",
          challengedPlayer: "ai-1",
          challengeType: "liar",
          currentBid: { quantity: 3, faceValue: 2 },
          allDice: {},
          actualCount: 1,
          challengerWins: true,
          loser: "ai-1",
          diceGained: false,
        },
      }),
      phase: "round-result",
    });

    useGameStore.getState().continueToNextRound();

    expect(useGameStore.getState().animatingShuffle).toBe(true);
    expect(useGameStore.getState().phase).toBe("playing");
    expect(useGameStore.getState().gameState?.players[useGameStore.getState().gameState!.currentPlayerIndex].isAI).toBe(
      true,
    );

    jest.advanceTimersByTime(SHUFFLE_DURATION_MS);
    await Promise.resolve();

    expect(useGameStore.getState().animatingShuffle).toBe(false);
    expect(useGameStore.getState().phase).toBe("ai-thinking");
  });

  it("clears animatingShuffle on reset and does not resurrect after the old timer", () => {
    useGameStore.setState({
      gameState: baseState(),
      phase: "round-result",
    });
    useGameStore.getState().continueToNextRound();
    expect(useGameStore.getState().animatingShuffle).toBe(true);

    useGameStore.getState().resetGame();
    expect(useGameStore.getState().animatingShuffle).toBe(false);
    expect(useGameStore.getState().phase).toBe("setup");

    jest.advanceTimersByTime(SHUFFLE_DURATION_MS + 50);
    expect(useGameStore.getState().animatingShuffle).toBe(false);
  });

  it("clears animatingShuffle when starting a new game", () => {
    useGameStore.setState({
      gameState: baseState(),
      phase: "playing",
      animatingShuffle: true,
      prefsLoaded: true,
      tutorialCompleted: true,
    });

    useGameStore.getState().startGame();
    expect(useGameStore.getState().animatingShuffle).toBe(false);
    expect(useGameStore.getState().phase).toBe("playing");
    expect(useGameStore.getState().gameState).not.toBeNull();
  });

  it("ignores placeBid while animatingShuffle is true", () => {
    const state = baseState({
      lastRoundResult: null,
      currentBid: null,
      isFirstBidOfRound: true,
      lastBidder: null,
      currentPlayerIndex: 0,
    });
    // Fresh round: human to open.
    useGameStore.setState({
      gameState: {
        ...state,
        players: state.players.map((p) => ({ ...p, dice: [1, 1, 1, 1, 1] })),
        roundNumber: 2,
      },
      phase: "playing",
      animatingShuffle: true,
    });

    useGameStore.getState().placeBid({ quantity: 1, faceValue: 1 });
    expect(useGameStore.getState().gameState?.currentBid).toBeNull();
    expect(useGameStore.getState().animatingShuffle).toBe(true);
  });
});
