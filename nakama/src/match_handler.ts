import { rollDice, startNewRound, applyAction, getActivePlayers } from "./engine/game";
import type { GameState, Player, GameAction, DieValue } from "./engine/types";
import { DICE_PER_PLAYER } from "./engine/constants";
import { MatchOpCode } from "./shared/types";

// ─── Match state ─────────────────────────────────────────────────────────────

export interface MatchLabel {
  name: string;
  open: boolean;
  playerCount: number;
  maxPlayers: number;
}

export interface MatchState {
  presences: Record<string, nkruntime.Presence>; // userId -> presence
  playerOrder: string[]; // ordered user IDs; index maps to player slot
  gameState: GameState | null;
  phase: "lobby" | "playing" | "ended";
  readySet: Record<string, boolean>; // userId -> ready
  maxPlayers: number;
  label: MatchLabel;
  // Round-result pending: we broadcast ROUND_RESULT and wait one tick before advancing round
  pendingRoundAdvance: boolean;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function makeGameState(state: MatchState): GameState {
  const players: Player[] = state.playerOrder.map((userId, i) => {
    const presence = state.presences[userId];
    return {
      id: userId,
      name: presence?.username ?? `Player ${i + 1}`,
      dice: rollDice(DICE_PER_PLAYER),
      diceCount: DICE_PER_PLAYER,
      isAI: false,
      isEliminated: false,
      hasTriggeredPalifico: false,
    };
  });

  return {
    players,
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
      enablePalifico: true,
      playerCount: state.playerOrder.length,
      aiDifficulty: "medium",
      playerName: state.presences[state.playerOrder[0]]?.username ?? "Player 1",
    },
  };
}

function currentUserId(gs: GameState): string {
  return gs.players[gs.currentPlayerIndex]?.id ?? "";
}

function encodeLabel(label: MatchLabel): string {
  return JSON.stringify(label);
}

function broadcastGameState(
  dispatcher: nkruntime.MatchDispatcher,
  state: MatchState,
): void {
  if (!state.gameState) return;
  const presenceList = Object.values(state.presences);
  if (presenceList.length === 0) return;

  // Each player gets their own view (only sees their own dice on live players).
  for (const userId of state.playerOrder) {
    const presence = state.presences[userId];
    if (!presence) continue;

    // Build a view where other players' dice are hidden (empty array).
    const viewPlayers = state.gameState.players.map((p) => {
      if (p.id === userId || p.isEliminated) {
        return p; // own dice + eliminated players visible (all dice revealed)
      }
      return { ...p, dice: new Array(p.diceCount).fill(0) as DieValue[] };
    });

    const view: GameState = { ...state.gameState, players: viewPlayers };
    const msg = JSON.stringify({
      gameState: view,
      currentPlayerId: currentUserId(state.gameState),
    });

    try {
      dispatcher.broadcastMessage(MatchOpCode.GAME_STATE, msg, [presence], null, true);
    } catch {
      // Presence may have disconnected between iterations.
    }
  }
}

// ─── MatchHandler implementation ──────────────────────────────────────────────

export const matchInit: nkruntime.MatchInitFunction<MatchState> = (
  _ctx,
  logger,
  _nk,
  params,
): { state: MatchState; tickRate: number; label: string } => {
  const maxPlayers = parseInt(String(params["maxPlayers"] ?? "2"), 10) || 2;
  const matchName = String(params["name"] ?? "");

  const label: MatchLabel = {
    name: matchName,
    open: true,
    playerCount: 0,
    maxPlayers,
  };

  const state: MatchState = {
    presences: {},
    playerOrder: [],
    gameState: null,
    phase: "lobby",
    readySet: {},
    maxPlayers,
    label,
    pendingRoundAdvance: false,
  };

  logger.info("Match initialized — max players: %d", maxPlayers);
  return { state, tickRate: 5, label: encodeLabel(label) };
};

export const matchJoinAttempt: nkruntime.MatchJoinAttemptFunction<MatchState> = (
  _ctx,
  logger,
  _nk,
  _dispatcher,
  _tick,
  state,
  presence,
  _metadata,
): { state: MatchState; accept: boolean; rejectMessage?: string } => {
  if (state.phase !== "lobby") {
    logger.warn("Join rejected — match already in progress");
    return { state, accept: false, rejectMessage: "Match already in progress" };
  }
  if (state.playerOrder.length >= state.maxPlayers) {
    logger.warn("Join rejected — match full");
    return { state, accept: false, rejectMessage: "Match is full" };
  }
  if (state.presences[presence.userId]) {
    // Reconnect — allow.
    return { state, accept: true };
  }
  return { state, accept: true };
};

export const matchJoin: nkruntime.MatchJoinFunction<MatchState> = (
  _ctx,
  logger,
  _nk,
  dispatcher,
  _tick,
  state,
  presences,
): { state: MatchState } | null => {
  for (const p of presences) {
    if (!state.presences[p.userId]) {
      state.playerOrder.push(p.userId);
    }
    state.presences[p.userId] = p;
    logger.info("Player joined: %s (%s)", p.username, p.userId);
  }

  state.label.playerCount = state.playerOrder.length;
  state.label.open = state.playerOrder.length < state.maxPlayers;
  dispatcher.matchLabelUpdate(encodeLabel(state.label));

  return { state };
};

export const matchLeave: nkruntime.MatchLeaveFunction<MatchState> = (
  _ctx,
  logger,
  _nk,
  dispatcher,
  _tick,
  state,
  presences,
): { state: MatchState } | null => {
  for (const p of presences) {
    delete state.presences[p.userId];
    logger.info("Player left: %s (%s)", p.username, p.userId);
  }

  if (state.phase === "playing" && state.gameState) {
    // If someone leaves mid-game, end the match.
    const remaining = state.playerOrder.filter((uid) => state.presences[uid]);
    if (remaining.length < 2) {
      state.phase = "ended";
      const msg = JSON.stringify({ reason: "opponent_left" });
      const remainingPresences = remaining
        .map((uid) => state.presences[uid])
        .filter(Boolean);
      if (remainingPresences.length > 0) {
        dispatcher.broadcastMessage(
          MatchOpCode.GAME_OVER,
          msg,
          remainingPresences,
          null,
          true,
        );
      }
    }
  }

  // If lobby empties, allow match to terminate.
  if (Object.keys(state.presences).length === 0) {
    return null;
  }

  state.label.playerCount = Object.keys(state.presences).length;
  state.label.open = state.label.playerCount < state.maxPlayers && state.phase === "lobby";
  dispatcher.matchLabelUpdate(encodeLabel(state.label));

  return { state };
};

export const matchLoop: nkruntime.MatchLoopFunction<MatchState> = (
  _ctx,
  logger,
  nk,
  dispatcher,
  _tick,
  state,
  messages,
): { state: MatchState } | null => {
  // End match if it's over and empty.
  if (state.phase === "ended" && Object.keys(state.presences).length === 0) {
    return null;
  }

  // Handle pending round advance (broadcast result → wait 1 tick → start new round).
  if (state.pendingRoundAdvance && state.gameState) {
    state.pendingRoundAdvance = false;
    if (!state.gameState.gameOver) {
      state.gameState = startNewRound(state.gameState);
      broadcastGameState(dispatcher, state);
    }
    return { state };
  }

  // Process incoming messages.
  for (const msg of messages) {
    const sender = msg.sender;
    const opCode = msg.opCode as typeof MatchOpCode[keyof typeof MatchOpCode];

    if (state.phase === "lobby") {
      if (opCode === MatchOpCode.READY) {
        state.readySet[sender.userId] = true;
        logger.info("Player ready: %s", sender.userId);

        const allReady =
          state.playerOrder.length >= 2 &&
          state.playerOrder.every((uid) => state.readySet[uid]);

        if (allReady) {
          state.gameState = makeGameState(state);
          state.phase = "playing";
          state.label.open = false;
          dispatcher.matchLabelUpdate(encodeLabel(state.label));
          broadcastGameState(dispatcher, state);
          logger.info("Game started with %d players", state.playerOrder.length);
        }
      }
      continue;
    }

    if (state.phase !== "playing" || !state.gameState) continue;

    // Validate it's the sender's turn.
    const expectedUserId = currentUserId(state.gameState);
    if (sender.userId !== expectedUserId) {
      logger.warn(
        "Out-of-turn message from %s (expected %s)",
        sender.userId,
        expectedUserId,
      );
      continue;
    }

    let action: GameAction | null = null;

    if (opCode === MatchOpCode.PLACE_BID) {
      try {
        const payload = JSON.parse(msg.data) as { quantity: number; faceValue: number };
        action = {
          type: "bid",
          playerId: sender.userId,
          bid: { quantity: payload.quantity, faceValue: payload.faceValue as DieValue },
        };
      } catch {
        logger.warn("Invalid PLACE_BID payload from %s", sender.userId);
        continue;
      }
    } else if (opCode === MatchOpCode.CHALLENGE) {
      action = { type: "challenge", playerId: sender.userId };
    } else if (opCode === MatchOpCode.SPOT_ON) {
      action = { type: "spot-on", playerId: sender.userId };
    }

    if (!action) continue;

    const prevState = state.gameState;
    state.gameState = applyAction(state.gameState, action);

    // Detect if a round just resolved (challenge or spot-on).
    const roundResolved =
      action.type !== "bid" && state.gameState.lastRoundResult !== prevState.lastRoundResult;

    if (roundResolved && state.gameState.lastRoundResult) {
      // Broadcast round result to all players (all dice revealed).
      const resultMsg = JSON.stringify({ result: state.gameState.lastRoundResult });
      const presenceList = Object.values(state.presences);
      dispatcher.broadcastMessage(
        MatchOpCode.ROUND_RESULT,
        resultMsg,
        presenceList,
        null,
        true,
      );
    }

    if (state.gameState.gameOver) {
      const presenceList = Object.values(state.presences);
      const active = getActivePlayers(state.gameState);
      const winnerId = active[0]?.id ?? null;
      const gameOverMsg = JSON.stringify({ winnerId, reason: "game_complete" });
      dispatcher.broadcastMessage(
        MatchOpCode.GAME_OVER,
        gameOverMsg,
        presenceList,
        null,
        true,
      );
      state.phase = "ended";

      // Award coins and record leaderboard win.
      for (const userId of state.playerOrder) {
        const isWinner = userId === winnerId;
        const coins = isWinner ? 100 : 10; // winner: 100 coins; others: 10 participation
        try {
          nk.walletUpdate(userId, { coins }, { match: "game_complete", winner: isWinner }, true);
        } catch {
          logger.warn("Failed to update wallet for %s", userId);
        }
      }

      if (winnerId) {
        const winnerPresence = state.presences[winnerId];
        try {
          nk.leaderboardRecordWrite(
            "liarsdice_wins",
            winnerId,
            winnerPresence?.username,
            1,
          );
        } catch {
          logger.warn("Failed to record leaderboard win for %s", winnerId);
        }
      }
    } else if (roundResolved) {
      state.pendingRoundAdvance = true;
    } else {
      broadcastGameState(dispatcher, state);
    }
  }

  return { state };
};

export const matchSignal: nkruntime.MatchSignalFunction<MatchState> = (
  _ctx,
  _logger,
  _nk,
  _dispatcher,
  _tick,
  state,
  data,
): { state: MatchState; data: string } => {
  return { state, data };
};

export const matchTerminate: nkruntime.MatchTerminateFunction<MatchState> = (
  _ctx,
  logger,
  _nk,
  _dispatcher,
  _tick,
  state,
  _graceSeconds,
): { state: MatchState } | null => {
  logger.info("Match terminated");
  return { state };
};
