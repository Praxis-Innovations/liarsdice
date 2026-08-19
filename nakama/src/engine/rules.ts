import type { Bid, DieValue, GameState } from './types';

export function isLegalBid(bid: Bid, currentBid: Bid | null, state: GameState): boolean {
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

function isLegalBidStandard(bid: Bid, currentBid: Bid): boolean {
  if (bid.quantity > currentBid.quantity) return true;
  if (bid.quantity === currentBid.quantity && bid.faceValue > currentBid.faceValue) return true;
  return false;
}

function isLegalBidWithWilds(bid: Bid, currentBid: Bid): boolean {
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

export interface LegalBidRange {
  minQuantity: number;
  minFaceValue: DieValue;
  maxQuantity: number;
}

export function getLegalBidRange(currentBid: Bid | null, state: GameState): LegalBidRange {
  const totalDice = state.players.reduce((sum, p) => sum + (p.isEliminated ? 0 : p.diceCount), 0);

  if (!currentBid) {
    return { minQuantity: 1, minFaceValue: 1 as DieValue, maxQuantity: totalDice };
  }

  if (state.isPalificoRound) {
    return {
      minQuantity: currentBid.quantity + 1,
      minFaceValue: currentBid.faceValue,
      maxQuantity: totalDice,
    };
  }

  return {
    minQuantity: 1,
    minFaceValue: 1 as DieValue,
    maxQuantity: totalDice,
  };
}

export function canChallenge(state: GameState): boolean {
  return state.currentBid !== null;
}

export function canSpotOn(state: GameState): boolean {
  if (!state.settings.enableSpotOn) return false;
  if (state.currentBid === null) return false;
  if (state.roundHistory.length < 2) return false;
  return true;
}
