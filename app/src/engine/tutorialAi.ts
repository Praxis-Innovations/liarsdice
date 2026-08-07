import { isLegalBid } from "./rules";
import type { Bid, DieValue, GameAction, GameState } from "./types";

/**
 * Lowest legal raise for tutorial AIs — never challenges mid-script.
 * Scans quantity then face so ones-wild / quantity bumps stay legal.
 */
export function tutorialRaiseAction(state: GameState, playerId: string): GameAction {
  const totalDice = state.players.reduce((sum, p) => sum + (p.isEliminated ? 0 : p.diceCount), 0);
  for (let quantity = 1; quantity <= totalDice; quantity++) {
    for (let face = 1; face <= 6; face++) {
      const bid: Bid = { quantity, faceValue: face as DieValue };
      if (isLegalBid(bid, state.currentBid, state)) {
        return { type: "bid", playerId, bid };
      }
    }
  }
  return { type: "challenge", playerId };
}
