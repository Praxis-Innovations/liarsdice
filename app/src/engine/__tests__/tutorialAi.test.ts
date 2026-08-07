import { applyAction, createGame } from "../game";
import { isLegalBid } from "../rules";
import { tutorialRaiseAction } from "../tutorialAi";
import type { GameSettings, GameState } from "../types";

const settings: GameSettings = {
  enableSpotOn: false,
  enablePalifico: false,
  playerCount: 3,
  aiDifficulty: "easy",
  playerName: "You",
};

function seededRng(seed: number) {
  let s = seed;
  return () => {
    s = (s * 16807) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

describe("tutorialRaiseAction", () => {
  it("opens with 1×1 when there is no current bid", () => {
    const state = createGame(settings, seededRng(1));
    const action = tutorialRaiseAction(state, state.players[1].id);
    expect(action.type).toBe("bid");
    expect(action.bid).toEqual({ quantity: 1, faceValue: 1 });
  });

  it("never returns an illegal bid after a non-ones opening", () => {
    let state = createGame(settings, seededRng(7));
    state = applyAction(state, {
      type: "bid",
      playerId: "human",
      bid: { quantity: 1, faceValue: 2 },
    });
    const action = tutorialRaiseAction(state, state.players[1].id);
    expect(action.type).toBe("bid");
    expect(isLegalBid(action.bid!, state.currentBid, state)).toBe(true);
  });

  it("raises past ones instead of repeating an illegal 1×1", () => {
    let state = createGame(settings, seededRng(11));
    state = applyAction(state, {
      type: "bid",
      playerId: "human",
      bid: { quantity: 1, faceValue: 2 },
    });
    // Ones-wild: 1×1 is a legal first raise.
    state = applyAction(state, tutorialRaiseAction(state, state.players[1].id));
    expect(state.currentBid).toEqual({ quantity: 1, faceValue: 1 });

    const second = tutorialRaiseAction(state, state.players[2].id);
    expect(second.type).toBe("bid");
    expect(second.bid).not.toEqual({ quantity: 1, faceValue: 1 });
    expect(isLegalBid(second.bid!, state.currentBid, state)).toBe(true);

    const next = applyAction(state, second);
    expect(next).not.toBe(state);
    expect(next.currentBid).toEqual(second.bid);
  });

  it("keeps producing legal raises across a full AI chain", () => {
    let state: GameState = createGame(settings, seededRng(49));
    state = applyAction(state, {
      type: "bid",
      playerId: "human",
      bid: { quantity: 1, faceValue: 3 },
    });

    for (let i = 0; i < 4; i++) {
      const current = state.players[state.currentPlayerIndex];
      if (!current.isAI) break;
      const action = tutorialRaiseAction(state, current.id);
      expect(action.type).toBe("bid");
      expect(isLegalBid(action.bid!, state.currentBid, state)).toBe(true);
      const next = applyAction(state, action);
      expect(next).not.toBe(state);
      state = next;
    }
  });

  it("falls back to challenge when the bid is already maxed (no wild escape)", () => {
    const state = createGame(settings, seededRng(3));
    const total = state.players.reduce((s, p) => s + p.diceCount, 0);
    // Without ones-wild, nothing beats quantity=total on face 6.
    state.onesWild = false;
    state.currentBid = { quantity: total, faceValue: 6 };
    state.isFirstBidOfRound = false;
    const action = tutorialRaiseAction(state, state.players[1].id);
    expect(action.type).toBe("challenge");
  });
});
