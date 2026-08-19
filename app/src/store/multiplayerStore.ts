// Thin client-side store for server-authoritative multiplayer matches.
// Game state is driven entirely by messages from the Nakama server; this store
// is a view layer that surfaces the latest state to UI components.

import { Socket, Session } from "@heroiclabs/nakama-js";
import { create } from "zustand";
import { nakamaClient } from "../lib/nakama";
import type { GameState, RoundResult } from "../engine/types";
import { MatchOpCode } from "../shared/types";

// ─── Types ───────────────────────────────────────────────────────────────────

export type MultiplayerPhase =
  | "idle"
  | "connecting"
  | "lobby"        // in match, waiting for all READY
  | "playing"      // game in progress
  | "round-result" // brief reveal phase between rounds
  | "game-over"
  | "error";

export interface MultiplayerStore {
  phase: MultiplayerPhase;
  matchId: string | null;
  myUserId: string | null;
  gameState: GameState | null;
  roundResult: RoundResult | null;
  winnerId: string | null;
  errorMessage: string | null;
  socket: Socket | null;

  // Actions
  connect: (session: Session) => Promise<void>;
  disconnect: () => void;
  createMatch: (options?: { maxPlayers?: number }) => Promise<string>;
  findMatch: (options?: { maxPlayers?: number }) => Promise<string>;
  joinMatch: (matchId: string) => Promise<void>;
  leaveMatch: () => void;
  sendReady: () => void;
  placeBid: (quantity: number, faceValue: number) => void;
  challenge: () => void;
  spotOn: () => void;
  reset: () => void;
}

// ─── Store ───────────────────────────────────────────────────────────────────

export const useMultiplayerStore = create<MultiplayerStore>((set, get) => ({
  phase: "idle",
  matchId: null,
  myUserId: null,
  gameState: null,
  roundResult: null,
  winnerId: null,
  errorMessage: null,
  socket: null,

  connect: async (session: Session) => {
    const existing = get().socket;
    if (existing) return; // Already connected — idempotent.

    set({ phase: "connecting" });
    try {
      const socket = nakamaClient.createSocket();
      await socket.connect(session, false);

      const decoder = new TextDecoder();

      socket.onmatchdata = (matchData) => {
        const { matchId, socket: currentSocket } = get();
        if (!matchId || !currentSocket) return;

        const code = matchData.op_code as (typeof MatchOpCode)[keyof typeof MatchOpCode];
        const raw = typeof matchData.data === "string"
          ? matchData.data
          : decoder.decode(matchData.data);

        if (code === MatchOpCode.GAME_STATE) {
          const { gameState, currentPlayerId } = JSON.parse(raw) as {
            gameState: GameState;
            currentPlayerId: string;
          };
          set({ gameState, phase: "playing" });
          void currentPlayerId; // used by UI to highlight whose turn it is
        } else if (code === MatchOpCode.ROUND_RESULT) {
          const { result } = JSON.parse(raw) as { result: RoundResult };
          set({ roundResult: result, phase: "round-result" });
          // Auto-advance after 3 seconds so the reveal is visible.
          setTimeout(() => {
            set((state) => ({
              roundResult: null,
              phase: state.phase === "round-result" ? "playing" : state.phase,
            }));
          }, 3000);
        } else if (code === MatchOpCode.GAME_OVER) {
          const { winnerId } = JSON.parse(raw) as {
            winnerId: string | null;
            reason: string;
          };
          set({ phase: "game-over", winnerId });
        }
      };

      socket.ondisconnect = () => {
        const { phase } = get();
        if (phase !== "idle") {
          set({ socket: null, phase: "error", errorMessage: "Connection lost. Please rejoin." });
        }
      };

      set({ socket, myUserId: session.user_id ?? null, phase: "idle" });
    } catch (err) {
      set({
        phase: "error",
        errorMessage: err instanceof Error ? err.message : "Failed to connect",
      });
    }
  },

  disconnect: () => {
    const { socket } = get();
    if (socket) {
      try {
        socket.disconnect(false);
      } catch {
        // Best-effort.
      }
    }
    set({ socket: null, phase: "idle", matchId: null, gameState: null });
  },

  createMatch: async (options = {}) => {
    const { socket } = get();
    if (!socket) throw new Error("Not connected — call connect() first");

    const payload = JSON.stringify({ maxPlayers: options.maxPlayers ?? 2 });
    const result = await socket.rpc("create_match", payload);
    const { matchId } = JSON.parse(result.payload ?? "{}") as { matchId: string };
    return matchId;
  },

  findMatch: async (options = {}) => {
    const { socket } = get();
    if (!socket) throw new Error("Not connected — call connect() first");

    const payload = JSON.stringify({ maxPlayers: options.maxPlayers ?? 2 });
    const result = await socket.rpc("find_match", payload);
    const { matchId } = JSON.parse(result.payload ?? "{}") as { matchId: string };
    return matchId;
  },

  joinMatch: async (matchId: string) => {
    const { socket } = get();
    if (!socket) throw new Error("Not connected — call connect() first");

    set({ phase: "connecting" });
    try {
      await socket.joinMatch(matchId);
      set({ matchId, phase: "lobby" });
    } catch (err) {
      set({
        phase: "error",
        errorMessage: err instanceof Error ? err.message : "Failed to join match",
      });
    }
  },

  leaveMatch: () => {
    const { socket, matchId } = get();
    if (socket && matchId) {
      void socket.leaveMatch(matchId);
    }
    set({ matchId: null, gameState: null, phase: "idle", roundResult: null, winnerId: null });
  },

  sendReady: () => {
    const { socket, matchId } = get();
    if (!socket || !matchId) return;
    socket.sendMatchState(matchId, MatchOpCode.READY, "");
  },

  placeBid: (quantity: number, faceValue: number) => {
    const { socket, matchId, phase } = get();
    if (!socket || !matchId || phase !== "playing") return;
    socket.sendMatchState(matchId, MatchOpCode.PLACE_BID, JSON.stringify({ quantity, faceValue }));
  },

  challenge: () => {
    const { socket, matchId, phase } = get();
    if (!socket || !matchId || phase !== "playing") return;
    socket.sendMatchState(matchId, MatchOpCode.CHALLENGE, "");
  },

  spotOn: () => {
    const { socket, matchId, phase } = get();
    if (!socket || !matchId || phase !== "playing") return;
    socket.sendMatchState(matchId, MatchOpCode.SPOT_ON, "");
  },

  reset: () => {
    set({
      phase: "idle",
      matchId: null,
      gameState: null,
      roundResult: null,
      winnerId: null,
      errorMessage: null,
    });
  },
}));
