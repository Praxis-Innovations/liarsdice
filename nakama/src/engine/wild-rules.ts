import type { GameState } from './types';

export function shouldOnesBeWild(state: GameState): boolean {
  if (state.isPalificoRound) return false;
  if (!state.isFirstBidOfRound) return state.onesWild;
  return true;
}

export function determineOnesWildAfterFirstBid(state: GameState, bidFaceValue: number): boolean {
  if (state.isPalificoRound) return false;
  if (state.isFirstBidOfRound && bidFaceValue === 1) return false;
  if (state.isFirstBidOfRound) return true;
  return state.onesWild;
}

export function shouldTriggerPalifico(state: GameState, playerId: string): boolean {
  if (!state.settings.enablePalifico) return false;
  const player = state.players.find(p => p.id === playerId);
  if (!player) return false;
  return player.diceCount === 1 && !player.hasTriggeredPalifico;
}
