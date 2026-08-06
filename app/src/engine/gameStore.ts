import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import { applyAction, createGame, startNewRound } from "./game";
import { getAIDecision } from "./ai";
import type { Bid, GameAction, GameSettings, GameState } from "./types";

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

type GamePhase = "setup" | "playing" | "ai-thinking" | "round-result" | "game-over";

interface GameStore {
  gameState: GameState | null;
  phase: GamePhase;
  settings: GameSettings;
  showHints: boolean;
  soundEnabled: boolean;
  tutorialCompleted: boolean;
  animatingReveal: boolean;

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

export const useGameStore = create<GameStore>((set, get) => ({
  gameState: null,
  phase: "setup",
  settings: DEFAULT_SETTINGS,
  showHints: false,
  soundEnabled: true,
  tutorialCompleted: false,
  animatingReveal: false,

  updateSettings: (partial) => {
    set((state) => ({ settings: { ...state.settings, ...partial } }));
  },

  startGame: () => {
    const { settings } = get();
    const state = createGame(settings);
    set({ gameState: state, phase: "playing" });

    void (async () => {
      const [showHints, soundEnabled, tutorialCompleted] = await Promise.all([
        loadPreference(PREFERENCE_KEYS.showHints, false),
        loadPreference(PREFERENCE_KEYS.soundEnabled, true),
        loadPreference(PREFERENCE_KEYS.tutorialCompleted, false),
      ]);
      set({ showHints, soundEnabled, tutorialCompleted });
    })();

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
    set({ gameState: null, phase: "setup" });
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
    set({ tutorialCompleted: true });
  },
}));

async function processAITurns(
  set: (partial: Partial<GameStore> | ((state: GameStore) => Partial<GameStore>)) => void,
  get: () => GameStore,
) {
  let state = get().gameState;
  if (!state) return;

  while (!state.gameOver && state.players[state.currentPlayerIndex].isAI) {
    set({ phase: "ai-thinking" });
    await aiDelay();

    state = get().gameState;
    if (!state || state.gameOver) return;

    const currentPlayer = state.players[state.currentPlayerIndex];
    if (!currentPlayer.isAI) return;

    const action = getAIDecision(state, currentPlayer.id);
    const newState = applyAction(state, action);

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
