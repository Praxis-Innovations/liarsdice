import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import { applyAction, createGame, startNewRound } from "./game";
import { getAIDecision } from "./ai";
import { tutorialRaiseAction } from "./tutorialAi";
import type { Bid, GameAction, GameSettings, GameState, RNGFunction } from "./types";

const PREFERENCE_KEYS = {
  showHints: "liarsdice-hints",
  soundEnabled: "liarsdice-sound",
  tutorialCompleted: "liarsdice-tutorial",
} as const;

async function loadPreference(key: string, fallback: boolean): Promise<boolean> {
  const stored = await AsyncStorage.getItem(key);
  return stored !== null ? stored === "true" : fallback;
}

function savePreference(key: string, value: boolean): void {
  void AsyncStorage.setItem(key, String(value));
}

function seededRng(seed: number): RNGFunction {
  let s = seed;
  return () => {
    s = (s + 0x6d2b79f5) | 0;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const TUTORIAL_SEED = 49;
const TUTORIAL_AI_SEED = 777;
/** Per-AI think time — keep snappy with 2 AI opponents. */
const TUTORIAL_AI_DELAY = 1400;

const TUTORIAL_SETTINGS: GameSettings = {
  playerCount: 3,
  aiDifficulty: "easy",
  enableSpotOn: false,
  enablePalifico: false,
  playerName: "You",
};

type GamePhase = "setup" | "playing" | "ai-thinking" | "round-result" | "game-over";

interface GameStore {
  gameState: GameState | null;
  phase: GamePhase;
  settings: GameSettings;
  showHints: boolean;
  soundEnabled: boolean;
  tutorialCompleted: boolean;
  animatingReveal: boolean;
  tutorialMode: boolean;
  tutorialStep: number;
  showTutorialPrompt: boolean;
  prefsLoaded: boolean;

  updateSettings: (partial: Partial<GameSettings>) => void;
  startGame: () => void;
  placeBid: (bid: Bid) => void;
  challenge: () => void;
  spotOn: () => void;
  continueToNextRound: () => void;
  resetGame: () => void;
  toggleHints: () => void;
  toggleSound: () => void;
  completeTutorial: () => void;
  startTutorial: () => void;
  skipTutorial: () => void;
  advanceTutorialStep: () => void;
  dismissTutorialPrompt: () => void;
}

const DEFAULT_SETTINGS: GameSettings = {
  playerCount: 4,
  aiDifficulty: "medium",
  enableSpotOn: true,
  enablePalifico: true,
  playerName: "You",
};

const AI_THINK_DELAY_MIN = 800;
const AI_THINK_DELAY_MAX = 2000;

function aiDelay(): Promise<void> {
  const ms = AI_THINK_DELAY_MIN + Math.random() * (AI_THINK_DELAY_MAX - AI_THINK_DELAY_MIN);
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function fixedDelay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

let tutorialAiRng: RNGFunction | null = null;

export const useGameStore = create<GameStore>((set, get) => {
  if (typeof window !== "undefined") {
    void Promise.all([
      loadPreference(PREFERENCE_KEYS.showHints, false),
      loadPreference(PREFERENCE_KEYS.soundEnabled, true),
      loadPreference(PREFERENCE_KEYS.tutorialCompleted, false),
    ]).then(([showHints, soundEnabled, tutorialCompleted]) => {
      set({ showHints, soundEnabled, tutorialCompleted, prefsLoaded: true });
    });
  }

  return {
    gameState: null,
    phase: "setup",
    settings: DEFAULT_SETTINGS,
    showHints: false,
    soundEnabled: true,
    tutorialCompleted: false,
    animatingReveal: false,
    tutorialMode: false,
    tutorialStep: 0,
    showTutorialPrompt: false,
    prefsLoaded: false,

    updateSettings: (partial) => {
      set((state) => ({ settings: { ...state.settings, ...partial } }));
    },

    startGame: () => {
      const { settings, tutorialCompleted, prefsLoaded } = get();
      const state = createGame(settings);
      set({ gameState: state, phase: "playing" });

      if (prefsLoaded && !tutorialCompleted) {
        set({ showTutorialPrompt: true });
        return;
      }

      if (!prefsLoaded) {
        void Promise.all([
          loadPreference(PREFERENCE_KEYS.showHints, false),
          loadPreference(PREFERENCE_KEYS.soundEnabled, true),
          loadPreference(PREFERENCE_KEYS.tutorialCompleted, false),
        ]).then(([showHints, soundEnabled, tutorialCompleted]) => {
          set({ showHints, soundEnabled, tutorialCompleted, prefsLoaded: true });
          if (!tutorialCompleted) {
            set({ showTutorialPrompt: true });
            return;
          }
          const current = get();
          if (current.gameState && current.gameState.players[current.gameState.currentPlayerIndex].isAI) {
            void processAITurns(set, get);
          }
        });
        return;
      }

      if (state.players[state.currentPlayerIndex].isAI) {
        void processAITurns(set, get);
      }
    },

    placeBid: (bid) => {
      const { gameState } = get();
      if (!gameState || gameState.gameOver) return;

      const action: GameAction = { type: "bid", playerId: "human", bid };
      const newState = applyAction(gameState, action);
      if (newState === gameState) return;

      set({ gameState: newState, phase: "playing" });
      void processAITurns(set, get);
    },

    challenge: () => {
      const { gameState } = get();
      if (!gameState || gameState.gameOver) return;

      const action: GameAction = { type: "challenge", playerId: "human" };
      const newState = applyAction(gameState, action);

      if (newState.lastRoundResult) {
        set({ gameState: newState, phase: newState.gameOver ? "game-over" : "round-result", animatingReveal: true });
        setTimeout(() => set({ animatingReveal: false }), 2000);
      }
    },

    spotOn: () => {
      const { gameState } = get();
      if (!gameState || gameState.gameOver) return;

      const action: GameAction = { type: "spot-on", playerId: "human" };
      const newState = applyAction(gameState, action);

      if (newState.lastRoundResult) {
        set({ gameState: newState, phase: newState.gameOver ? "game-over" : "round-result", animatingReveal: true });
        setTimeout(() => set({ animatingReveal: false }), 2000);
      }
    },

    continueToNextRound: () => {
      const { gameState } = get();
      if (!gameState) return;

      const newState = startNewRound(gameState);

      if (newState.gameOver) {
        set({ gameState: newState, phase: "game-over" });
        return;
      }

      set({ gameState: newState, phase: "playing" });

      if (newState.players[newState.currentPlayerIndex].isAI) {
        void processAITurns(set, get);
      }
    },

    resetGame: () => {
      set({ gameState: null, phase: "setup", tutorialMode: false, tutorialStep: 0 });
    },

    toggleHints: () => {
      set((state) => {
        const next = !state.showHints;
        savePreference(PREFERENCE_KEYS.showHints, next);
        return { showHints: next };
      });
    },

    toggleSound: () => {
      set((state) => {
        const next = !state.soundEnabled;
        savePreference(PREFERENCE_KEYS.soundEnabled, next);
        return { soundEnabled: next };
      });
    },

    completeTutorial: () => {
      savePreference(PREFERENCE_KEYS.tutorialCompleted, true);
      set({ tutorialCompleted: true, tutorialMode: false, tutorialStep: 0 });
    },

    startTutorial: () => {
      const rng = seededRng(TUTORIAL_SEED);
      tutorialAiRng = seededRng(TUTORIAL_AI_SEED);
      const state = createGame(TUTORIAL_SETTINGS, rng);
      set({
        gameState: state,
        phase: "playing",
        tutorialMode: true,
        tutorialStep: 0,
        showTutorialPrompt: false,
        showHints: false,
      });
    },

    skipTutorial: () => {
      savePreference(PREFERENCE_KEYS.tutorialCompleted, true);
      set({
        tutorialCompleted: true,
        showTutorialPrompt: false,
        tutorialMode: false,
        tutorialStep: 0,
        gameState: null,
        phase: "setup",
      });
    },

    advanceTutorialStep: () => {
      set((state) => ({ tutorialStep: state.tutorialStep + 1 }));
    },

    dismissTutorialPrompt: () => {
      savePreference(PREFERENCE_KEYS.tutorialCompleted, true);
      const { gameState } = get();
      set({ tutorialCompleted: true, showTutorialPrompt: false });
      if (gameState && gameState.players[gameState.currentPlayerIndex].isAI) {
        void processAITurns(set, get);
      }
    },
  };
});

async function processAITurns(
  set: (partial: Partial<GameStore> | ((state: GameStore) => Partial<GameStore>)) => void,
  get: () => GameStore,
) {
  let state = get().gameState;
  if (!state) return;

  while (!state.gameOver && state.players[state.currentPlayerIndex].isAI) {
    const { tutorialMode } = get();
    set({ phase: "ai-thinking" });
    await (tutorialMode ? fixedDelay(TUTORIAL_AI_DELAY) : aiDelay());

    state = get().gameState;
    if (!state || state.gameOver) return;

    const currentPlayer = state.players[state.currentPlayerIndex];
    if (!currentPlayer.isAI) return;

    const rng = tutorialMode && tutorialAiRng ? tutorialAiRng : undefined;
    const action = tutorialMode
      ? tutorialRaiseAction(state, currentPlayer.id)
      : getAIDecision(state, currentPlayer.id, rng);
    const newState = applyAction(state, action);

    // Illegal/no-op action — don't spin forever on the same AI seat.
    if (newState === state) {
      set({ phase: "playing" });
      return;
    }

    if (newState.lastRoundResult) {
      set({ gameState: newState, phase: newState.gameOver ? "game-over" : "round-result", animatingReveal: true });
      setTimeout(() => set({ animatingReveal: false }), 2000);
      return;
    }

    set({ gameState: newState });
    state = newState;
  }

  set({ phase: "playing" });
}
