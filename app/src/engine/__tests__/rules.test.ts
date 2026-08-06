import { isLegalBid, canChallenge, canSpotOn, getLegalBidRange } from '../rules';
import type { GameState, Bid, GameSettings } from '../types';

function makeState(overrides: Partial<GameState> = {}): GameState {
  const settings: GameSettings = {
    enableSpotOn: true,
    enablePalifico: true,
    playerCount: 3,
    aiDifficulty: 'medium',
    playerName: 'Test',
  };
  return {
    players: [
      { id: 'p1', name: 'P1', dice: [1, 2, 3, 4, 5], diceCount: 5, isAI: false, isEliminated: false, hasTriggeredPalifico: false },
      { id: 'p2', name: 'P2', dice: [2, 3, 4, 5, 6], diceCount: 5, isAI: true, aiDifficulty: 'medium', isEliminated: false, hasTriggeredPalifico: false },
      { id: 'p3', name: 'P3', dice: [1, 1, 3, 4, 5], diceCount: 5, isAI: true, aiDifficulty: 'medium', isEliminated: false, hasTriggeredPalifico: false },
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
    settings,
    ...overrides,
  };
}

describe('isLegalBid', () => {
  it('allows any valid bid when there is no current bid', () => {
    const state = makeState();
    expect(isLegalBid({ quantity: 1, faceValue: 2 }, null, state)).toBe(true);
    expect(isLegalBid({ quantity: 5, faceValue: 6 }, null, state)).toBe(true);
  });

  it('rejects bids with quantity < 1', () => {
    const state = makeState();
    expect(isLegalBid({ quantity: 0, faceValue: 2 }, null, state)).toBe(false);
  });

  it('rejects bids exceeding total dice', () => {
    const state = makeState();
    expect(isLegalBid({ quantity: 16, faceValue: 2 }, null, state)).toBe(false);
  });

  it('allows increasing quantity at same face value', () => {
    const state = makeState({ onesWild: false });
    const current: Bid = { quantity: 3, faceValue: 4 };
    expect(isLegalBid({ quantity: 4, faceValue: 4 }, current, state)).toBe(true);
  });

  it('allows increasing face value at same quantity', () => {
    const state = makeState({ onesWild: false });
    const current: Bid = { quantity: 3, faceValue: 4 };
    expect(isLegalBid({ quantity: 3, faceValue: 5 }, current, state)).toBe(true);
  });

  it('rejects same bid', () => {
    const state = makeState({ onesWild: false });
    const current: Bid = { quantity: 3, faceValue: 4 };
    expect(isLegalBid({ quantity: 3, faceValue: 4 }, current, state)).toBe(false);
  });

  it('rejects lower quantity at lower face value', () => {
    const state = makeState({ onesWild: false });
    const current: Bid = { quantity: 3, faceValue: 4 };
    expect(isLegalBid({ quantity: 2, faceValue: 3 }, current, state)).toBe(false);
  });

  describe('with ones wild', () => {
    it('going from non-ones to ones: quantity >= ceil(current/2)', () => {
      const state = makeState({ onesWild: true });
      const current: Bid = { quantity: 6, faceValue: 3 };
      expect(isLegalBid({ quantity: 3, faceValue: 1 }, current, state)).toBe(true);
      expect(isLegalBid({ quantity: 2, faceValue: 1 }, current, state)).toBe(false);
    });

    it('going from ones to non-ones: quantity >= ones*2+1', () => {
      const state = makeState({ onesWild: true });
      const current: Bid = { quantity: 3, faceValue: 1 };
      expect(isLegalBid({ quantity: 7, faceValue: 2 }, current, state)).toBe(true);
      expect(isLegalBid({ quantity: 6, faceValue: 2 }, current, state)).toBe(false);
    });
  });

  describe('palifico round', () => {
    it('only allows increasing quantity at same face value', () => {
      const state = makeState({ isPalificoRound: true });
      const current: Bid = { quantity: 2, faceValue: 4 };
      expect(isLegalBid({ quantity: 3, faceValue: 4 }, current, state)).toBe(true);
      expect(isLegalBid({ quantity: 3, faceValue: 5 }, current, state)).toBe(false);
      expect(isLegalBid({ quantity: 2, faceValue: 5 }, current, state)).toBe(false);
    });
  });
});

describe('canChallenge', () => {
  it('returns true when there is a current bid', () => {
    const state = makeState({ currentBid: { quantity: 3, faceValue: 4 } });
    expect(canChallenge(state)).toBe(true);
  });

  it('returns false when there is no current bid', () => {
    const state = makeState();
    expect(canChallenge(state)).toBe(false);
  });
});

describe('canSpotOn', () => {
  it('returns true when spot-on is enabled and there have been 2+ actions', () => {
    const state = makeState({
      currentBid: { quantity: 3, faceValue: 4 },
      roundHistory: [
        { type: 'bid', playerId: 'p1', bid: { quantity: 2, faceValue: 3 } },
        { type: 'bid', playerId: 'p2', bid: { quantity: 3, faceValue: 4 } },
      ],
    });
    expect(canSpotOn(state)).toBe(true);
  });

  it('returns false when disabled in settings', () => {
    const state = makeState({
      currentBid: { quantity: 3, faceValue: 4 },
      roundHistory: [
        { type: 'bid', playerId: 'p1' },
        { type: 'bid', playerId: 'p2' },
      ],
      settings: { enableSpotOn: false, enablePalifico: true, playerCount: 3, aiDifficulty: 'medium', playerName: 'Test' },
    });
    expect(canSpotOn(state)).toBe(false);
  });
});

describe('getLegalBidRange', () => {
  it('returns full range when no current bid', () => {
    const state = makeState();
    const range = getLegalBidRange(null, state);
    expect(range.minQuantity).toBe(1);
    expect(range.minFaceValue).toBe(1);
    expect(range.maxQuantity).toBe(15);
  });
});
