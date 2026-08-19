import type { GameState, GameAction, GameSettings, Player, DieValue, RNGFunction } from './types';
import { DICE_PER_PLAYER, AI_NAMES } from './constants';
import { isLegalBid, canChallenge, canSpotOn } from './rules';
import { resolveChallenge, resolveSpotOn } from './resolution';
import { determineOnesWildAfterFirstBid, shouldTriggerPalifico } from './wild-rules';

function defaultRng(): number {
  return Math.random();
}

export function rollDice(count: number, rng: RNGFunction = defaultRng): DieValue[] {
  const dice: DieValue[] = [];
  for (let i = 0; i < count; i++) {
    dice.push((Math.floor(rng() * 6) + 1) as DieValue);
  }
  return dice;
}

export function createGame(settings: GameSettings, rng: RNGFunction = defaultRng): GameState {
  const players: Player[] = [];

  players.push({
    id: 'human',
    name: settings.playerName || 'You',
    dice: rollDice(DICE_PER_PLAYER, rng),
    diceCount: DICE_PER_PLAYER,
    isAI: false,
    isEliminated: false,
    hasTriggeredPalifico: false,
  });

  for (let i = 0; i < settings.playerCount - 1; i++) {
    players.push({
      id: `ai-${i}`,
      name: AI_NAMES[i] || `AI ${i + 1}`,
      dice: rollDice(DICE_PER_PLAYER, rng),
      diceCount: DICE_PER_PLAYER,
      isAI: true,
      aiDifficulty: settings.aiDifficulty,
      isEliminated: false,
      hasTriggeredPalifico: false,
    });
  }

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
    settings,
  };
}

export function getActivePlayers(state: GameState): Player[] {
  return state.players.filter(p => !p.isEliminated);
}

export function getNextPlayerIndex(state: GameState): number {
  const { players } = state;
  let idx = (state.currentPlayerIndex + 1) % players.length;
  while (players[idx].isEliminated) {
    idx = (idx + 1) % players.length;
  }
  return idx;
}

export function startNewRound(state: GameState, rng: RNGFunction = defaultRng): GameState {
  const newPlayers = state.players.map(p => {
    if (p.isEliminated) return p;
    return { ...p, dice: rollDice(p.diceCount, rng) };
  });

  const active = newPlayers.filter(p => !p.isEliminated);
  if (active.length <= 1) {
    return {
      ...state,
      players: newPlayers,
      gameOver: true,
      winner: active[0]?.id ?? null,
    };
  }

  let isPalificoRound = false;
  let palificoPlayerId: string | null = null;

  if (state.lastRoundResult) {
    const loser = newPlayers.find(p => p.id === state.lastRoundResult!.loser);
    if (loser && !loser.isEliminated && shouldTriggerPalifico(
      { ...state, players: newPlayers },
      loser.id,
    )) {
      isPalificoRound = true;
      palificoPlayerId = loser.id;
    }
  }

  let starterIndex: number;
  if (state.lastRoundResult) {
    const loserId = state.lastRoundResult.loser;
    const loserPlayer = newPlayers.find(p => p.id === loserId);
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

  return {
    ...state,
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
    lastRoundResult: null,
  };
}

export function applyAction(state: GameState, action: GameAction): GameState {
  switch (action.type) {
    case 'bid':
      return applyBid(state, action);
    case 'challenge':
      return applyChallenge(state);
    case 'spot-on':
      return applySpotOn(state, action.playerId);
    default:
      return state;
  }
}

function applyBid(state: GameState, action: GameAction): GameState {
  const bid = action.bid!;

  if (!isLegalBid(bid, state.currentBid, state)) {
    return state;
  }

  const onesWild = determineOnesWildAfterFirstBid(state, bid.faceValue);

  return {
    ...state,
    currentBid: bid,
    lastBidder: action.playerId,
    currentPlayerIndex: getNextPlayerIndex(state),
    roundHistory: [...state.roundHistory, action],
    isFirstBidOfRound: false,
    onesWild,
  };
}

function applyChallenge(state: GameState): GameState {
  if (!canChallenge(state)) return state;

  const result = resolveChallenge(state);
  return applyRoundResult(state, result);
}

function applySpotOn(state: GameState, callerId: string): GameState {
  if (!canSpotOn(state)) return state;

  const result = resolveSpotOn(state, callerId);
  return applyRoundResult(state, result);
}

function applyRoundResult(state: GameState, result: import('./types').RoundResult): GameState {
  let newPlayers = state.players.map(p => {
    if (p.id === result.loser) {
      const newDiceCount = p.diceCount - 1;
      return {
        ...p,
        diceCount: newDiceCount,
        isEliminated: newDiceCount <= 0,
      };
    }
    if (result.diceGained && p.id === result.challenger) {
      return {
        ...p,
        diceCount: Math.min(p.diceCount + 1, DICE_PER_PLAYER),
      };
    }
    return p;
  });

  if (result.challengeType === 'spot-on' && result.challengerWins) {
    const loserPlayer = newPlayers.find(p => p.id === result.loser);
    if (loserPlayer && loserPlayer.diceCount === 1 && !loserPlayer.hasTriggeredPalifico) {
      newPlayers = newPlayers.map(p =>
        p.id === result.loser ? { ...p, hasTriggeredPalifico: true } : p,
      );
    }
  }

  const activePlayers = newPlayers.filter(p => !p.isEliminated);
  const gameOver = activePlayers.length <= 1;

  const loserPlayer = newPlayers.find(p => p.id === result.loser);
  if (loserPlayer && loserPlayer.diceCount === 1 && !loserPlayer.hasTriggeredPalifico) {
    newPlayers = newPlayers.map(p =>
      p.id === result.loser ? { ...p, hasTriggeredPalifico: true } : p,
    );
  }

  return {
    ...state,
    players: newPlayers,
    lastRoundResult: result,
    gameOver,
    winner: gameOver ? activePlayers[0]?.id ?? null : null,
    roundHistory: [...state.roundHistory, {
      type: result.challengeType === 'liar' ? 'challenge' : 'spot-on',
      playerId: result.challenger,
    }],
  };
}
