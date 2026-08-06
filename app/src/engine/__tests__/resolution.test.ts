import { countMatchingDice, resolveChallenge, resolveSpotOn } from '../resolution';
import type { DieValue, GameState, GameSettings } from '../types';

describe('countMatchingDice', () => {
  it('counts exact matches without wilds', () => {
    const allDice: Record<string, DieValue[]> = {
      p1: [1, 2, 3, 4, 5],
      p2: [3, 3, 3, 6, 6],
    };
    expect(countMatchingDice(allDice, 3, false)).toBe(4);
  });

  it('counts ones as wild for non-one face values', () => {
    const allDice: Record<string, DieValue[]> = {
      p1: [1, 2, 3, 4, 5],
      p2: [1, 3, 3, 6, 6],
    };
    expect(countMatchingDice(allDice, 3, true)).toBe(5);
  });

  it('does not double-count ones when bidding on ones', () => {
    const allDice: Record<string, DieValue[]> = {
      p1: [1, 1, 3, 4, 5],
      p2: [1, 3, 3, 6, 6],
    };
    expect(countMatchingDice(allDice, 1, true)).toBe(3);
    expect(countMatchingDice(allDice, 1, false)).toBe(3);
  });

  it('returns 0 when no matches', () => {
    const allDice: Record<string, DieValue[]> = {
      p1: [2, 3, 4, 5, 6],
    };
    expect(countMatchingDice(allDice, 1, false)).toBe(0);
  });
});

function makeState(overrides: Partial<GameState> = {}): GameState {
  const settings: GameSettings = {
    enableSpotOn: true,
    enablePalifico: true,
    playerCount: 2,
    aiDifficulty: 'medium',
    playerName: 'Test',
  };
  return {
    players: [
      { id: 'p1', name: 'P1', dice: [3, 3, 2, 4, 5], diceCount: 5, isAI: false, isEliminated: false, hasTriggeredPalifico: false },
      { id: 'p2', name: 'P2', dice: [3, 6, 6, 1, 2], diceCount: 5, isAI: true, aiDifficulty: 'medium', isEliminated: false, hasTriggeredPalifico: false },
    ],
    currentPlayerIndex: 1,
    currentBid: { quantity: 4, faceValue: 3 },
    lastBidder: 'p1',
    roundHistory: [{ type: 'bid', playerId: 'p1', bid: { quantity: 4, faceValue: 3 } }],
    roundNumber: 1,
    isFirstBidOfRound: false,
    isPalificoRound: false,
    palificoPlayerId: null,
    onesWild: true,
    gameOver: false,
    winner: null,
    lastRoundResult: null,
    settings,
    ...overrides,
  };
}

describe('resolveChallenge', () => {
  it('challenger wins when bid is not met', () => {
    const state = makeState({
      currentBid: { quantity: 6, faceValue: 3 },
    });
    const result = resolveChallenge(state);
    expect(result.challengerWins).toBe(true);
    expect(result.loser).toBe('p1');
  });

  it('bidder wins when bid is met', () => {
    const state = makeState({
      currentBid: { quantity: 3, faceValue: 3 },
    });
    const result = resolveChallenge(state);
    expect(result.challengerWins).toBe(false);
    expect(result.loser).toBe('p2');
  });

  it('bidder wins when bid is exceeded', () => {
    const state = makeState({
      currentBid: { quantity: 2, faceValue: 3 },
    });
    const result = resolveChallenge(state);
    expect(result.actualCount).toBeGreaterThanOrEqual(2);
    expect(result.challengerWins).toBe(false);
  });

  it('counts wilds correctly in challenge', () => {
    const state = makeState({ onesWild: true });
    const result = resolveChallenge(state);
    expect(result.actualCount).toBe(4);
  });

  it('does not count wilds when onesWild is false', () => {
    const state = makeState({ onesWild: false });
    const result = resolveChallenge(state);
    expect(result.actualCount).toBe(3);
  });
});

describe('resolveSpotOn', () => {
  it('caller wins when count is exactly right', () => {
    const state = makeState({
      currentBid: { quantity: 4, faceValue: 3 },
      onesWild: true,
    });
    const result = resolveSpotOn(state, 'p2');
    expect(result.actualCount).toBe(4);
    expect(result.challengerWins).toBe(true);
  });

  it('caller loses when count is wrong', () => {
    const state = makeState({
      currentBid: { quantity: 2, faceValue: 3 },
      onesWild: true,
    });
    const result = resolveSpotOn(state, 'p2');
    expect(result.actualCount).toBe(4);
    expect(result.challengerWins).toBe(false);
    expect(result.loser).toBe('p2');
  });
});
