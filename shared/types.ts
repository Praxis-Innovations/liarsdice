// Source of truth for types shared across the app and the Nakama server runtime.
// Synced into app/src/shared/types.ts by scripts/sync-shared.js.

// ─── User / Profile ──────────────────────────────────────────────────────────

export interface Profile {
  id: string;
  displayName: string;
  avatarUrl: string | null;
  createdAt: string;
  updatedAt: string;
}

// ─── Multiplayer match messages ───────────────────────────────────────────────

/** Op-codes for client→server and server→client socket messages. */
export const MatchOpCode = {
  // Client → server
  PLACE_BID: 1,
  CHALLENGE: 2,
  SPOT_ON: 3,
  READY: 4,

  // Server → client
  GAME_STATE: 101,
  ROUND_RESULT: 102,
  GAME_OVER: 103,
  PLAYER_JOINED: 104,
  PLAYER_LEFT: 105,
} as const;

export type MatchOpCode = (typeof MatchOpCode)[keyof typeof MatchOpCode];

/** Sent by the server after every action that changes game state. */
export interface GameStateMessage {
  gameState: unknown; // typed as GameState in engine consumers
  currentPlayerId: string;
}

/** Sent by the server when a challenge or spot-on resolves. */
export interface RoundResultMessage {
  result: unknown; // typed as RoundResult in engine consumers
}

/** Payload for PLACE_BID from client. */
export interface PlaceBidPayload {
  quantity: number;
  faceValue: number;
}

// ─── Leaderboard ─────────────────────────────────────────────────────────────

export interface LeaderboardRecord {
  userId: string;
  username: string;
  displayName: string;
  score: number;
  rank: number;
}

// ─── Economy ─────────────────────────────────────────────────────────────────

export const Currency = {
  COINS: "coins",
  GEMS: "gems",
} as const;

export type Currency = (typeof Currency)[keyof typeof Currency];
