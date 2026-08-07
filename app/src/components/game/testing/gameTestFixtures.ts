import type { GameState, Player } from "../../../engine/types";

export function makePlayer(overrides: Partial<Player> & Pick<Player, "id" | "name">): Player {
  return {
    dice: [1, 2, 3, 4, 5],
    diceCount: 5,
    isAI: overrides.id !== "human",
    isEliminated: false,
    hasTriggeredPalifico: false,
    ...(overrides.id !== "human" ? { aiDifficulty: "easy" as const } : {}),
    ...overrides,
  };
}

/** Minimal playable 2-player state for UI contract tests. */
export function makeGameState(overrides: Partial<GameState> = {}): GameState {
  return {
    players: [
      makePlayer({ id: "human", name: "You", isAI: false }),
      makePlayer({ id: "ai-1", name: "Silver Fox", isAI: true, aiDifficulty: "easy" }),
    ],
    currentPlayerIndex: 0,
    currentBid: null,
    lastBidder: null,
    roundHistory: [],
    roundNumber: 1,
    isFirstBidOfRound: true,
    isPalificoRound: false,
    palificoPlayerId: null,
    onesWild: true,
    gameOver: false,
    winner: null,
    lastRoundResult: null,
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
