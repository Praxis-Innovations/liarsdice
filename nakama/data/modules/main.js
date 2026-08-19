"use strict";
var __defProp = Object.defineProperty;
var __defProps = Object.defineProperties;
var __getOwnPropDescs = Object.getOwnPropertyDescriptors;
var __getOwnPropSymbols = Object.getOwnPropertySymbols;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __propIsEnum = Object.prototype.propertyIsEnumerable;
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __spreadValues = (a, b) => {
  for (var prop in b || (b = {}))
    if (__hasOwnProp.call(b, prop))
      __defNormalProp(a, prop, b[prop]);
  if (__getOwnPropSymbols)
    for (var prop of __getOwnPropSymbols(b)) {
      if (__propIsEnum.call(b, prop))
        __defNormalProp(a, prop, b[prop]);
    }
  return a;
};
var __spreadProps = (a, b) => __defProps(a, __getOwnPropDescs(b));

// src/engine/constants.ts
var DICE_PER_PLAYER = 5;

// src/engine/rules.ts
function isLegalBid(bid, currentBid, state) {
  if (bid.quantity < 1) return false;
  if (bid.faceValue < 1 || bid.faceValue > 6) return false;
  const totalDice = state.players.reduce((sum, p) => sum + (p.isEliminated ? 0 : p.diceCount), 0);
  if (bid.quantity > totalDice) return false;
  if (!currentBid) return true;
  if (state.isPalificoRound) {
    return bid.faceValue === currentBid.faceValue && bid.quantity > currentBid.quantity;
  }
  if (state.onesWild) {
    return isLegalBidWithWilds(bid, currentBid);
  }
  return isLegalBidStandard(bid, currentBid);
}
function isLegalBidStandard(bid, currentBid) {
  if (bid.quantity > currentBid.quantity) return true;
  if (bid.quantity === currentBid.quantity && bid.faceValue > currentBid.faceValue) return true;
  return false;
}
function isLegalBidWithWilds(bid, currentBid) {
  if (currentBid.faceValue === 1 && bid.faceValue === 1) {
    return bid.quantity > currentBid.quantity;
  }
  if (currentBid.faceValue !== 1 && bid.faceValue === 1) {
    return bid.quantity >= Math.ceil(currentBid.quantity / 2);
  }
  if (currentBid.faceValue === 1 && bid.faceValue !== 1) {
    return bid.quantity >= currentBid.quantity * 2 + 1;
  }
  return isLegalBidStandard(bid, currentBid);
}
function canChallenge(state) {
  return state.currentBid !== null;
}
function canSpotOn(state) {
  if (!state.settings.enableSpotOn) return false;
  if (state.currentBid === null) return false;
  if (state.roundHistory.length < 2) return false;
  return true;
}

// src/engine/resolution.ts
function countMatchingDice(allDice, faceValue, onesWild) {
  let count = 0;
  for (const dice of Object.values(allDice)) {
    for (const die of dice) {
      if (die === faceValue) {
        count++;
      } else if (onesWild && die === 1 && faceValue !== 1) {
        count++;
      }
    }
  }
  return count;
}
function getAllDice(state) {
  const allDice = {};
  for (const player of state.players) {
    if (!player.isEliminated) {
      allDice[player.id] = [...player.dice];
    }
  }
  return allDice;
}
function resolveChallenge(state) {
  const currentBid = state.currentBid;
  const challenger = state.players[state.currentPlayerIndex];
  const bidder = state.players.find((p) => p.id === state.lastBidder);
  const allDice = getAllDice(state);
  const actualCount = countMatchingDice(allDice, currentBid.faceValue, state.onesWild);
  const bidMet = actualCount >= currentBid.quantity;
  const challengerWins = !bidMet;
  const loser = challengerWins ? bidder.id : challenger.id;
  return {
    challenger: challenger.id,
    challengedPlayer: bidder.id,
    challengeType: "liar",
    currentBid,
    allDice,
    actualCount,
    challengerWins,
    loser,
    diceGained: false
  };
}
function resolveSpotOn(state, callerId) {
  const currentBid = state.currentBid;
  const caller = state.players.find((p) => p.id === callerId);
  const bidder = state.players.find((p) => p.id === state.lastBidder);
  const allDice = getAllDice(state);
  const actualCount = countMatchingDice(allDice, currentBid.faceValue, state.onesWild);
  const isExact = actualCount === currentBid.quantity;
  const challengerWins = isExact;
  const loser = isExact ? "" : callerId;
  const diceGained = isExact && caller.diceCount < DICE_PER_PLAYER;
  return {
    challenger: callerId,
    challengedPlayer: bidder.id,
    challengeType: "spot-on",
    currentBid,
    allDice,
    actualCount,
    challengerWins,
    loser,
    diceGained
  };
}

// src/engine/wild-rules.ts
function determineOnesWildAfterFirstBid(state, bidFaceValue) {
  if (state.isPalificoRound) return false;
  if (state.isFirstBidOfRound && bidFaceValue === 1) return false;
  if (state.isFirstBidOfRound) return true;
  return state.onesWild;
}
function shouldTriggerPalifico(state, playerId) {
  if (!state.settings.enablePalifico) return false;
  const player = state.players.find((p) => p.id === playerId);
  if (!player) return false;
  return player.diceCount === 1 && !player.hasTriggeredPalifico;
}

// src/engine/game.ts
function defaultRng() {
  return Math.random();
}
function rollDice(count, rng = defaultRng) {
  const dice = [];
  for (let i = 0; i < count; i++) {
    dice.push(Math.floor(rng() * 6) + 1);
  }
  return dice;
}
function getActivePlayers(state) {
  return state.players.filter((p) => !p.isEliminated);
}
function getNextPlayerIndex(state) {
  const { players } = state;
  let idx = (state.currentPlayerIndex + 1) % players.length;
  while (players[idx].isEliminated) {
    idx = (idx + 1) % players.length;
  }
  return idx;
}
function startNewRound(state, rng = defaultRng) {
  var _a, _b;
  const newPlayers = state.players.map((p) => {
    if (p.isEliminated) return p;
    return __spreadProps(__spreadValues({}, p), { dice: rollDice(p.diceCount, rng) });
  });
  const active = newPlayers.filter((p) => !p.isEliminated);
  if (active.length <= 1) {
    return __spreadProps(__spreadValues({}, state), {
      players: newPlayers,
      gameOver: true,
      winner: (_b = (_a = active[0]) == null ? void 0 : _a.id) != null ? _b : null
    });
  }
  let isPalificoRound = false;
  let palificoPlayerId = null;
  if (state.lastRoundResult) {
    const loser = newPlayers.find((p) => p.id === state.lastRoundResult.loser);
    if (loser && !loser.isEliminated && shouldTriggerPalifico(
      __spreadProps(__spreadValues({}, state), { players: newPlayers }),
      loser.id
    )) {
      isPalificoRound = true;
      palificoPlayerId = loser.id;
    }
  }
  let starterIndex;
  if (state.lastRoundResult) {
    const loserId = state.lastRoundResult.loser;
    const loserPlayer = newPlayers.find((p) => p.id === loserId);
    if (loserPlayer && !loserPlayer.isEliminated) {
      starterIndex = newPlayers.indexOf(loserPlayer);
    } else {
      starterIndex = state.currentPlayerIndex;
      while (newPlayers[starterIndex].isEliminated) {
        starterIndex = (starterIndex + 1) % newPlayers.length;
      }
    }
  } else {
    starterIndex = 0;
  }
  return __spreadProps(__spreadValues({}, state), {
    players: newPlayers,
    currentPlayerIndex: starterIndex,
    currentBid: null,
    lastBidder: null,
    roundHistory: [],
    roundNumber: state.roundNumber + 1,
    isFirstBidOfRound: true,
    isPalificoRound,
    palificoPlayerId,
    onesWild: !isPalificoRound,
    gameOver: false,
    winner: null,
    lastRoundResult: null
  });
}
function applyAction(state, action) {
  switch (action.type) {
    case "bid":
      return applyBid(state, action);
    case "challenge":
      return applyChallenge(state);
    case "spot-on":
      return applySpotOn(state, action.playerId);
    default:
      return state;
  }
}
function applyBid(state, action) {
  const bid = action.bid;
  if (!isLegalBid(bid, state.currentBid, state)) {
    return state;
  }
  const onesWild = determineOnesWildAfterFirstBid(state, bid.faceValue);
  return __spreadProps(__spreadValues({}, state), {
    currentBid: bid,
    lastBidder: action.playerId,
    currentPlayerIndex: getNextPlayerIndex(state),
    roundHistory: [...state.roundHistory, action],
    isFirstBidOfRound: false,
    onesWild
  });
}
function applyChallenge(state) {
  if (!canChallenge(state)) return state;
  const result = resolveChallenge(state);
  return applyRoundResult(state, result);
}
function applySpotOn(state, callerId) {
  if (!canSpotOn(state)) return state;
  const result = resolveSpotOn(state, callerId);
  return applyRoundResult(state, result);
}
function applyRoundResult(state, result) {
  var _a, _b;
  let newPlayers = state.players.map((p) => {
    if (p.id === result.loser) {
      const newDiceCount = p.diceCount - 1;
      return __spreadProps(__spreadValues({}, p), {
        diceCount: newDiceCount,
        isEliminated: newDiceCount <= 0
      });
    }
    if (result.diceGained && p.id === result.challenger) {
      return __spreadProps(__spreadValues({}, p), {
        diceCount: Math.min(p.diceCount + 1, DICE_PER_PLAYER)
      });
    }
    return p;
  });
  if (result.challengeType === "spot-on" && result.challengerWins) {
    const loserPlayer2 = newPlayers.find((p) => p.id === result.loser);
    if (loserPlayer2 && loserPlayer2.diceCount === 1 && !loserPlayer2.hasTriggeredPalifico) {
      newPlayers = newPlayers.map(
        (p) => p.id === result.loser ? __spreadProps(__spreadValues({}, p), { hasTriggeredPalifico: true }) : p
      );
    }
  }
  const activePlayers = newPlayers.filter((p) => !p.isEliminated);
  const gameOver = activePlayers.length <= 1;
  const loserPlayer = newPlayers.find((p) => p.id === result.loser);
  if (loserPlayer && loserPlayer.diceCount === 1 && !loserPlayer.hasTriggeredPalifico) {
    newPlayers = newPlayers.map(
      (p) => p.id === result.loser ? __spreadProps(__spreadValues({}, p), { hasTriggeredPalifico: true }) : p
    );
  }
  return __spreadProps(__spreadValues({}, state), {
    players: newPlayers,
    lastRoundResult: result,
    gameOver,
    winner: gameOver ? (_b = (_a = activePlayers[0]) == null ? void 0 : _a.id) != null ? _b : null : null,
    roundHistory: [...state.roundHistory, {
      type: result.challengeType === "liar" ? "challenge" : "spot-on",
      playerId: result.challenger
    }]
  });
}

// src/shared/types.ts
var MatchOpCode = {
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
  PLAYER_LEFT: 105
};

// src/match_handler.ts
function makeGameState(state) {
  var _a, _b;
  const players = state.playerOrder.map((userId, i) => {
    var _a2;
    const presence = state.presences[userId];
    return {
      id: userId,
      name: (_a2 = presence == null ? void 0 : presence.username) != null ? _a2 : `Player ${i + 1}`,
      dice: rollDice(DICE_PER_PLAYER),
      diceCount: DICE_PER_PLAYER,
      isAI: false,
      isEliminated: false,
      hasTriggeredPalifico: false
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
      playerName: (_b = (_a = state.presences[state.playerOrder[0]]) == null ? void 0 : _a.username) != null ? _b : "Player 1"
    }
  };
}
function currentUserId(gs) {
  var _a, _b;
  return (_b = (_a = gs.players[gs.currentPlayerIndex]) == null ? void 0 : _a.id) != null ? _b : "";
}
function encodeLabel(label) {
  return JSON.stringify(label);
}
function broadcastGameState(dispatcher, state) {
  if (!state.gameState) return;
  const presenceList = Object.values(state.presences);
  if (presenceList.length === 0) return;
  for (const userId of state.playerOrder) {
    const presence = state.presences[userId];
    if (!presence) continue;
    const viewPlayers = state.gameState.players.map((p) => {
      if (p.id === userId || p.isEliminated) {
        return p;
      }
      return __spreadProps(__spreadValues({}, p), { dice: new Array(p.diceCount).fill(0) });
    });
    const view = __spreadProps(__spreadValues({}, state.gameState), { players: viewPlayers });
    const msg = JSON.stringify({
      gameState: view,
      currentPlayerId: currentUserId(state.gameState)
    });
    try {
      dispatcher.broadcastMessage(MatchOpCode.GAME_STATE, msg, [presence], null, true);
    } catch (e) {
    }
  }
}
var matchInit = (_ctx, logger, _nk, params) => {
  var _a, _b;
  const maxPlayers = parseInt(String((_a = params["maxPlayers"]) != null ? _a : "2"), 10) || 2;
  const matchName = String((_b = params["name"]) != null ? _b : "");
  const label = {
    name: matchName,
    open: true,
    playerCount: 0,
    maxPlayers
  };
  const state = {
    presences: {},
    playerOrder: [],
    gameState: null,
    phase: "lobby",
    readySet: {},
    maxPlayers,
    label,
    pendingRoundAdvance: false
  };
  logger.info("Match initialized \u2014 max players: %d", maxPlayers);
  return { state, tickRate: 5, label: encodeLabel(label) };
};
var matchJoinAttempt = (_ctx, logger, _nk, _dispatcher, _tick, state, presence, _metadata) => {
  if (state.phase !== "lobby") {
    logger.warn("Join rejected \u2014 match already in progress");
    return { state, accept: false, rejectMessage: "Match already in progress" };
  }
  if (state.playerOrder.length >= state.maxPlayers) {
    logger.warn("Join rejected \u2014 match full");
    return { state, accept: false, rejectMessage: "Match is full" };
  }
  if (state.presences[presence.userId]) {
    return { state, accept: true };
  }
  return { state, accept: true };
};
var matchJoin = (_ctx, logger, _nk, dispatcher, _tick, state, presences) => {
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
var matchLeave = (_ctx, logger, _nk, dispatcher, _tick, state, presences) => {
  for (const p of presences) {
    delete state.presences[p.userId];
    logger.info("Player left: %s (%s)", p.username, p.userId);
  }
  if (state.phase === "playing" && state.gameState) {
    const remaining = state.playerOrder.filter((uid) => state.presences[uid]);
    if (remaining.length < 2) {
      state.phase = "ended";
      const msg = JSON.stringify({ reason: "opponent_left" });
      const remainingPresences = remaining.map((uid) => state.presences[uid]).filter(Boolean);
      if (remainingPresences.length > 0) {
        dispatcher.broadcastMessage(
          MatchOpCode.GAME_OVER,
          msg,
          remainingPresences,
          null,
          true
        );
      }
    }
  }
  if (Object.keys(state.presences).length === 0) {
    return null;
  }
  state.label.playerCount = Object.keys(state.presences).length;
  state.label.open = state.label.playerCount < state.maxPlayers && state.phase === "lobby";
  dispatcher.matchLabelUpdate(encodeLabel(state.label));
  return { state };
};
var matchLoop = (_ctx, logger, nk, dispatcher, _tick, state, messages) => {
  var _a, _b;
  if (state.phase === "ended" && Object.keys(state.presences).length === 0) {
    return null;
  }
  if (state.pendingRoundAdvance && state.gameState) {
    state.pendingRoundAdvance = false;
    if (!state.gameState.gameOver) {
      state.gameState = startNewRound(state.gameState);
      broadcastGameState(dispatcher, state);
    }
    return { state };
  }
  for (const msg of messages) {
    const sender = msg.sender;
    const opCode = msg.opCode;
    if (state.phase === "lobby") {
      if (opCode === MatchOpCode.READY) {
        state.readySet[sender.userId] = true;
        logger.info("Player ready: %s", sender.userId);
        const allReady = state.playerOrder.length >= 2 && state.playerOrder.every((uid) => state.readySet[uid]);
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
    const expectedUserId = currentUserId(state.gameState);
    if (sender.userId !== expectedUserId) {
      logger.warn(
        "Out-of-turn message from %s (expected %s)",
        sender.userId,
        expectedUserId
      );
      continue;
    }
    let action = null;
    if (opCode === MatchOpCode.PLACE_BID) {
      try {
        const payload = JSON.parse(msg.data);
        action = {
          type: "bid",
          playerId: sender.userId,
          bid: { quantity: payload.quantity, faceValue: payload.faceValue }
        };
      } catch (e) {
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
    const roundResolved = action.type !== "bid" && state.gameState.lastRoundResult !== prevState.lastRoundResult;
    if (roundResolved && state.gameState.lastRoundResult) {
      const resultMsg = JSON.stringify({ result: state.gameState.lastRoundResult });
      const presenceList = Object.values(state.presences);
      dispatcher.broadcastMessage(
        MatchOpCode.ROUND_RESULT,
        resultMsg,
        presenceList,
        null,
        true
      );
    }
    if (state.gameState.gameOver) {
      const presenceList = Object.values(state.presences);
      const active = getActivePlayers(state.gameState);
      const winnerId = (_b = (_a = active[0]) == null ? void 0 : _a.id) != null ? _b : null;
      const gameOverMsg = JSON.stringify({ winnerId, reason: "game_complete" });
      dispatcher.broadcastMessage(
        MatchOpCode.GAME_OVER,
        gameOverMsg,
        presenceList,
        null,
        true
      );
      state.phase = "ended";
      if (winnerId) {
        const winnerPresence = state.presences[winnerId];
        try {
          nk.leaderboardRecordWrite(
            "liarsdice_wins",
            winnerId,
            winnerPresence == null ? void 0 : winnerPresence.username,
            1
          );
        } catch (e) {
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
var matchSignal = (_ctx, _logger, _nk, _dispatcher, _tick, state, data) => {
  return { state, data };
};
var matchTerminate = (_ctx, logger, _nk, _dispatcher, _tick, state, _graceSeconds) => {
  logger.info("Match terminated");
  return { state };
};

// src/rpc/match.ts
var rpcCreateMatch = (_ctx, logger, nk, payload) => {
  var _a, _b;
  let name = "";
  let maxPlayers = 2;
  if (payload) {
    try {
      const p = JSON.parse(payload);
      name = (_a = p.name) != null ? _a : "";
      maxPlayers = Math.min(Math.max((_b = p.maxPlayers) != null ? _b : 2, 2), 6);
    } catch (e) {
      logger.warn("rpcCreateMatch: invalid payload");
    }
  }
  const params = {
    maxPlayers: String(maxPlayers)
  };
  if (name) params["name"] = name;
  const matchId = nk.matchCreate("liarsdice", params);
  logger.info("Created match %s (max players: %d)", matchId, maxPlayers);
  return JSON.stringify({ matchId });
};
var rpcJoinMatch = (_ctx, logger, _nk, payload) => {
  if (!payload) {
    throw new Error("matchId is required");
  }
  let matchId = "";
  try {
    const p = JSON.parse(payload);
    matchId = p.matchId;
  } catch (e) {
    throw new Error("Invalid payload \u2014 expected { matchId: string }");
  }
  logger.info("rpcJoinMatch: returning match ID %s to client", matchId);
  return JSON.stringify({ matchId });
};
var rpcFindMatch = (ctx, logger, nk, payload) => {
  var _a;
  let maxPlayers = 2;
  if (payload) {
    try {
      const p = JSON.parse(payload);
      maxPlayers = Math.min(Math.max((_a = p.maxPlayers) != null ? _a : 2, 2), 6);
    } catch (e) {
    }
  }
  const query = `+label.open:true +label.maxPlayers:${maxPlayers}`;
  const matches = nk.matchList(10, true, null, 1, maxPlayers - 1, query);
  if (matches.length > 0) {
    const matchId2 = matches[0].matchId;
    logger.info("rpcFindMatch: joining existing match %s", matchId2);
    return JSON.stringify({ matchId: matchId2 });
  }
  const params = { maxPlayers: String(maxPlayers) };
  const matchId = nk.matchCreate("liarsdice", params);
  logger.info("rpcFindMatch: created new match %s for user %s", matchId, ctx.userId);
  return JSON.stringify({ matchId });
};

// src/main.ts
var InitModule = function(_ctx, logger, nk, initializer) {
  initializer.registerMatch("liarsdice", {
    matchInit,
    matchJoinAttempt,
    matchJoin,
    matchLeave,
    matchLoop,
    matchSignal,
    matchTerminate
  });
  initializer.registerRpc("create_match", rpcCreateMatch);
  initializer.registerRpc("join_match", rpcJoinMatch);
  initializer.registerRpc("find_match", rpcFindMatch);
  try {
    nk.leaderboardCreate("liarsdice_wins", false, "desc", "incr", null, {});
    logger.info("Leaderboard 'liarsdice_wins' ready");
  } catch (e) {
  }
  logger.info("Liar's Dice server module initialized");
};
globalThis.InitModule = InitModule;
