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

export interface ChatMessage {
  id: string;
  senderId: string;
  username: string;
  text: string;
  createdAt: string;
  isMe: boolean;
}

export interface MultiplayerStore {
  phase: MultiplayerPhase;
  matchId: string | null;
  myUserId: string | null;
  gameState: GameState | null;
  roundResult: RoundResult | null;
  winnerId: string | null;
  errorMessage: string | null;
  socket: Socket | null;

  // Chat
  chatMessages: ChatMessage[];
  chatChannelId: string | null;

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

  // Chat actions
  joinChannel: (target: string, type?: number) => Promise<void>;
  leaveChannel: () => void;
  sendChatMessage: (text: string) => void;
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
  chatMessages: [],
  chatChannelId: null,

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

      socket.onchannelmessage = (msg) => {
        const { myUserId: uid } = get();
        let text = "";
        try {
          const parsed = typeof msg.content === "string"
            ? (JSON.parse(msg.content) as { text?: string })
            : (msg.content as { text?: string });
          text = parsed.text ?? "";
        } catch {
          text = String(msg.content ?? "");
        }
        if (!text) return;
        const chatMsg: ChatMessage = {
          id: msg.message_id,
          senderId: msg.sender_id,
          username: msg.username,
          text,
          createdAt: msg.create_time,
          isMe: msg.sender_id === uid,
        };
        set((state) => ({ chatMessages: [...state.chatMessages, chatMsg] }));
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
    const { socket, chatChannelId } = get();
    if (socket) {
      if (chatChannelId) {
        try { void socket.leaveChat(chatChannelId); } catch { /* best-effort */ }
      }
      try { socket.disconnect(false); } catch { /* best-effort */ }
    }
    set({ socket: null, phase: "idle", matchId: null, gameState: null, chatChannelId: null, chatMessages: [] });
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
    const { socket, matchId, chatChannelId } = get();
    if (socket) {
      if (matchId) void socket.leaveMatch(matchId);
      if (chatChannelId) { try { void socket.leaveChat(chatChannelId); } catch { /* best-effort */ } }
    }
    set({ matchId: null, gameState: null, phase: "idle", roundResult: null, winnerId: null, chatChannelId: null, chatMessages: [] });
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

  joinChannel: async (target, type = 1) => {
    const { socket } = get();
    if (!socket) return;
    try {
      const channel = await socket.joinChat(target, type, true, false);
      set({ chatChannelId: channel.id, chatMessages: [] });
    } catch {
      // Chat join failed — non-fatal, game continues without chat.
    }
  },

  leaveChannel: () => {
    const { socket, chatChannelId } = get();
    if (socket && chatChannelId) {
      try { void socket.leaveChat(chatChannelId); } catch { /* best-effort */ }
    }
    set({ chatChannelId: null, chatMessages: [] });
  },

  sendChatMessage: (text) => {
    const { socket, chatChannelId } = get();
    if (!socket || !chatChannelId || !text.trim()) return;
    void socket.writeChatMessage(chatChannelId, { text: text.trim() });
  },
}));
