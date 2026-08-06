import { getAIDecision } from '../ai';
import type { GameState, GameSettings } from '../types';

function seededRng(seed: number) {
  let s = seed;
  return () => {
    s = (s * 16807) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

function makeState(overrides: Partial<GameState> = {}): GameState {
  const settings: GameSettings = {
    enableSpotOn: true,
    enablePalifico: true,
    playerCount: 3,
    aiDifficulty: 'medium',
    playerName: 'Human',
  };
  return {
    players: [
      { id: 'human', name: 'Human', dice: [2, 3, 4, 5, 6], diceCount: 5, isAI: false, isEliminated: false, hasTriggeredPalifico: false },
      { id: 'ai-0', name: 'AI 1', dice: [1, 2, 3, 4, 5], diceCount: 5, isAI: true, aiDifficulty: 'medium', isEliminated: false, hasTriggeredPalifico: false },
      { id: 'ai-1', name: 'AI 2', dice: [3, 3, 3, 4, 5], diceCount: 5, isAI: true, aiDifficulty: 'medium', isEliminated: false, hasTriggeredPalifico: false },
    ],
    currentPlayerIndex: 1,
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
    ...overrides,
  };
}

describe('AI decision making', () => {
  it('makes a bid when no current bid exists', () => {
    const state = makeState();
    const decision = getAIDecision(state, 'ai-0', seededRng(42));
    expect(decision.type).toBe('bid');
    expect(decision.bid).toBeDefined();
    expect(decision.bid!.quantity).toBeGreaterThanOrEqual(1);
    expect(decision.bid!.faceValue).toBeGreaterThanOrEqual(1);
    expect(decision.bid!.faceValue).toBeLessThanOrEqual(6);
  });

  it('challenges when current bid is very unlikely', () => {
    const state = makeState({
      currentBid: { quantity: 14, faceValue: 6 },
      lastBidder: 'human',
      isFirstBidOfRound: false,
      roundHistory: [{ type: 'bid', playerId: 'human', bid: { quantity: 14, faceValue: 6 } }],
    });
    const decision = getAIDecision(state, 'ai-0', seededRng(42));
    expect(decision.type).toBe('challenge');
  });

  it('easy AI still produces valid decisions', () => {
    const state = makeState();
    state.players[1].aiDifficulty = 'easy';
    const decision = getAIDecision(state, 'ai-0', seededRng(42));
    expect(['bid', 'challenge', 'spot-on']).toContain(decision.type);
  });

  it('hard AI still produces valid decisions', () => {
    const state = makeState();
    state.players[1].aiDifficulty = 'hard';
    const decision = getAIDecision(state, 'ai-0', seededRng(42));
    expect(['bid', 'challenge', 'spot-on']).toContain(decision.type);
  });

  it('AI decisions are consistent with same seed', () => {
    const state = makeState({
      currentBid: { quantity: 3, faceValue: 4 },
      lastBidder: 'human',
      isFirstBidOfRound: false,
    });
    const d1 = getAIDecision(state, 'ai-0', seededRng(42));
    const d2 = getAIDecision(state, 'ai-0', seededRng(42));
    expect(d1.type).toBe(d2.type);
    if (d1.bid && d2.bid) {
      expect(d1.bid.quantity).toBe(d2.bid.quantity);
      expect(d1.bid.faceValue).toBe(d2.bid.faceValue);
    }
  });
});
