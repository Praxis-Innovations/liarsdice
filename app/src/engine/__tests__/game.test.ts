import { createGame, startNewRound, applyAction, getActivePlayers, getNextPlayerIndex } from '../game';
import type { GameSettings } from '../types';

const defaultSettings: GameSettings = {
  enableSpotOn: true,
  enablePalifico: true,
  playerCount: 3,
  aiDifficulty: 'medium',
  playerName: 'TestPlayer',
};

function seededRng(seed: number) {
  let s = seed;
  return () => {
    s = (s * 16807) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

describe('createGame', () => {
  it('creates correct number of players', () => {
    const state = createGame(defaultSettings, seededRng(42));
    expect(state.players).toHaveLength(3);
  });

  it('first player is human', () => {
    const state = createGame(defaultSettings, seededRng(42));
    expect(state.players[0].isAI).toBe(false);
    expect(state.players[0].name).toBe('TestPlayer');
  });

  it('all players start with 5 dice', () => {
    const state = createGame(defaultSettings, seededRng(42));
    for (const player of state.players) {
      expect(player.dice).toHaveLength(5);
      expect(player.diceCount).toBe(5);
    }
  });

  it('dice values are 1-6', () => {
    const state = createGame(defaultSettings, seededRng(42));
    for (const player of state.players) {
      for (const die of player.dice) {
        expect(die).toBeGreaterThanOrEqual(1);
        expect(die).toBeLessThanOrEqual(6);
      }
    }
  });

  it('starts on round 1 with no bids', () => {
    const state = createGame(defaultSettings, seededRng(42));
    expect(state.roundNumber).toBe(1);
    expect(state.currentBid).toBeNull();
    expect(state.isFirstBidOfRound).toBe(true);
    expect(state.onesWild).toBe(true);
  });

  it('game is not over', () => {
    const state = createGame(defaultSettings, seededRng(42));
    expect(state.gameOver).toBe(false);
    expect(state.winner).toBeNull();
  });
});

describe('getActivePlayers', () => {
  it('excludes eliminated players', () => {
    const state = createGame(defaultSettings, seededRng(42));
    state.players[1].isEliminated = true;
    const active = getActivePlayers(state);
    expect(active).toHaveLength(2);
    expect(active.find(p => p.id === state.players[1].id)).toBeUndefined();
  });
});

describe('getNextPlayerIndex', () => {
  it('wraps around to first non-eliminated player', () => {
    const state = createGame({ ...defaultSettings, playerCount: 3 }, seededRng(42));
    state.currentPlayerIndex = 2;
    const next = getNextPlayerIndex(state);
    expect(next).toBe(0);
  });

  it('skips eliminated players', () => {
    const state = createGame({ ...defaultSettings, playerCount: 3 }, seededRng(42));
    state.currentPlayerIndex = 0;
    state.players[1].isEliminated = true;
    const next = getNextPlayerIndex(state);
    expect(next).toBe(2);
  });
});

describe('applyAction - bid', () => {
  it('updates current bid and advances player', () => {
    const state = createGame(defaultSettings, seededRng(42));
    const bid = { quantity: 2, faceValue: 3 as const };
    const newState = applyAction(state, { type: 'bid', playerId: 'human', bid });
    expect(newState.currentBid).toEqual(bid);
    expect(newState.lastBidder).toBe('human');
    expect(newState.currentPlayerIndex).not.toBe(0);
    expect(newState.isFirstBidOfRound).toBe(false);
  });

  it('rejects illegal bid and returns same state', () => {
    const state = createGame(defaultSettings, seededRng(42));
    const bid1 = { quantity: 3, faceValue: 4 as const };
    const s1 = applyAction(state, { type: 'bid', playerId: 'human', bid: bid1 });
    const illegalBid = { quantity: 2, faceValue: 3 as const };
    const s2 = applyAction(s1, { type: 'bid', playerId: s1.players[s1.currentPlayerIndex].id, bid: illegalBid });
    expect(s2.currentBid).toEqual(bid1);
  });

  it('sets onesWild to false when first bid is on ones', () => {
    const state = createGame(defaultSettings, seededRng(42));
    const bid = { quantity: 1, faceValue: 1 as const };
    const newState = applyAction(state, { type: 'bid', playerId: 'human', bid });
    expect(newState.onesWild).toBe(false);
  });
});

describe('applyAction - challenge', () => {
  it('resolves challenge and records result', () => {
    const state = createGame({ ...defaultSettings, playerCount: 2 }, seededRng(42));
    const s1 = applyAction(state, { type: 'bid', playerId: 'human', bid: { quantity: 3, faceValue: 3 } });
    const s2 = applyAction(s1, { type: 'challenge', playerId: s1.players[s1.currentPlayerIndex].id });
    expect(s2.lastRoundResult).not.toBeNull();
    expect(s2.lastRoundResult!.challengeType).toBe('liar');
  });
});

describe('startNewRound', () => {
  it('re-rolls all dice and resets bids', () => {
    let state = createGame({ ...defaultSettings, playerCount: 2 }, seededRng(42));
    state = applyAction(state, { type: 'bid', playerId: 'human', bid: { quantity: 10, faceValue: 6 } });
    state = applyAction(state, { type: 'challenge', playerId: state.players[state.currentPlayerIndex].id });
    const newRound = startNewRound(state, seededRng(99));
    expect(newRound.currentBid).toBeNull();
    expect(newRound.isFirstBidOfRound).toBe(true);
    expect(newRound.roundNumber).toBe(2);
    expect(newRound.lastRoundResult).toBeNull();
  });

  it('loser has one fewer die after challenge', () => {
    let state = createGame({ ...defaultSettings, playerCount: 2 }, seededRng(42));
    state = applyAction(state, { type: 'bid', playerId: 'human', bid: { quantity: 10, faceValue: 6 } });
    state = applyAction(state, { type: 'challenge', playerId: state.players[state.currentPlayerIndex].id });
    const loser = state.players.find(p => p.id === state.lastRoundResult!.loser)!;
    expect(loser.diceCount).toBe(4);
  });
});
