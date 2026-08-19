import type { DieValue, GameState, RoundResult } from './types';
import { DICE_PER_PLAYER } from './constants';

export function countMatchingDice(
  allDice: Record<string, DieValue[]>,
  faceValue: DieValue,
  onesWild: boolean,
): number {
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

function getAllDice(state: GameState): Record<string, DieValue[]> {
  const allDice: Record<string, DieValue[]> = {};
  for (const player of state.players) {
    if (!player.isEliminated) {
      allDice[player.id] = [...player.dice];
    }
  }
  return allDice;
}

export function resolveChallenge(state: GameState): RoundResult {
  const currentBid = state.currentBid!;
  const challenger = state.players[state.currentPlayerIndex];
  const bidder = state.players.find(p => p.id === state.lastBidder)!;
  const allDice = getAllDice(state);
  const actualCount = countMatchingDice(allDice, currentBid.faceValue, state.onesWild);
  const bidMet = actualCount >= currentBid.quantity;
  const challengerWins = !bidMet;
  const loser = challengerWins ? bidder.id : challenger.id;

  return {
    challenger: challenger.id,
    challengedPlayer: bidder.id,
    challengeType: 'liar',
    currentBid,
    allDice,
    actualCount,
    challengerWins,
    loser,
    diceGained: false,
  };
}

export function resolveSpotOn(state: GameState, callerId: string): RoundResult {
  const currentBid = state.currentBid!;
  const caller = state.players.find(p => p.id === callerId)!;
  const bidder = state.players.find(p => p.id === state.lastBidder)!;
  const allDice = getAllDice(state);
  const actualCount = countMatchingDice(allDice, currentBid.faceValue, state.onesWild);
  const isExact = actualCount === currentBid.quantity;
  const challengerWins = isExact;
  const loser = isExact ? '' : callerId;
  const diceGained = isExact && caller.diceCount < DICE_PER_PLAYER;

  return {
    challenger: callerId,
    challengedPlayer: bidder.id,
    challengeType: 'spot-on',
    currentBid,
    allDice,
    actualCount,
    challengerWins,
    loser,
    diceGained,
  };
}
