import { createGame } from "../../../engine/game";
import type { GameSettings, GameState, RoundResult } from "../../../engine/types";
import {
  describeTutorialRoundResult,
  TUTORIAL_STEPS,
  type TutorialStepAction,
} from "../tutorialSteps";

const settings: GameSettings = {
  enableSpotOn: false,
  enablePalifico: false,
  playerCount: 3,
  aiDifficulty: "easy",
  playerName: "You",
};

function withResult(result: RoundResult): GameState {
  const state = createGame(settings, () => 0.5);
  return { ...state, lastRoundResult: result };
}

describe("TUTORIAL_STEPS contract", () => {
  it("walks through bid → AI → liar → result → celebrate", () => {
    const actions = TUTORIAL_STEPS.map((s) => s.action);
    expect(actions).toContain("wait-for-bid");
    expect(actions).toContain("wait-for-ai");
    expect(actions).toContain("wait-for-round-result");
    expect(actions[actions.length - 1]).toBe("celebrate");
  });

  it("uses a 3-player table narrative and stable spotlight refs", () => {
    const opponents = TUTORIAL_STEPS.find((s) => s.id === "opponents");
    expect(opponents?.body.toLowerCase()).toContain("three");
    expect(opponents?.targetRef).toBe("table");

    const opponentBid = TUTORIAL_STEPS.find((s) => s.id === "opponent-bid");
    expect(opponentBid?.targetRef).toBe("bidChrome");

    const result = TUTORIAL_STEPS.find((s) => s.id === "round-result");
    expect(result?.targetRef).toBe("roundResult");
    expect(result?.allowInteraction).toBe(true);
  });

  it("only allows interaction on bid, liar, and result steps", () => {
    const interactive = TUTORIAL_STEPS.filter((s) => s.allowInteraction).map((s) => s.id);
    expect(interactive).toEqual(["make-bid", "call-or-raise", "round-result"]);
  });

  it("keeps auto-wait actions after interactive prompts", () => {
    const byId = Object.fromEntries(TUTORIAL_STEPS.map((s) => [s.id, s.action])) as Record<
      string,
      TutorialStepAction
    >;
    expect(byId["make-bid"]).toBe("wait-for-bid");
    expect(byId["ai-turn"]).toBe("wait-for-ai");
    expect(byId["call-or-raise"]).toBe("wait-for-round-result");
  });
});

describe("describeTutorialRoundResult", () => {
  it("explains a successful Liar call with bid vs actual", () => {
    const state = withResult({
      challenger: "human",
      challengedPlayer: "ai-1",
      challengeType: "liar",
      currentBid: { quantity: 5, faceValue: 4 },
      allDice: {},
      actualCount: 2,
      challengerWins: true,
      loser: "ai-1",
      diceGained: false,
    });
    // Ensure AI name resolves
    state.players[1].id = "ai-1";
    state.players[1].name = "Silver Fox";

    const copy = describeTutorialRoundResult(state);
    expect(copy.title.toLowerCase()).toContain("wins");
    expect(copy.body).toContain("You");
    expect(copy.body).toContain("Silver Fox");
    expect(copy.body).toContain("5×4");
    expect(copy.body).toContain("2");
    expect(copy.body.toLowerCase()).toContain("loses a die");
  });

  it("explains a failed Liar call", () => {
    const state = withResult({
      challenger: "human",
      challengedPlayer: "ai-1",
      challengeType: "liar",
      currentBid: { quantity: 3, faceValue: 2 },
      allDice: {},
      actualCount: 5,
      challengerWins: false,
      loser: "human",
      diceGained: false,
    });
    state.players[1].id = "ai-1";
    state.players[1].name = "Captain Drake";

    const copy = describeTutorialRoundResult(state);
    expect(copy.title.toLowerCase()).toContain("loses");
    expect(copy.body).toContain("5");
    expect(copy.body).toContain("3×2");
    expect(copy.body).toMatch(/You loses a die|loses a die/);
  });

  it("falls back when no result is present", () => {
    const state = createGame(settings, () => 0.5);
    const copy = describeTutorialRoundResult(state);
    expect(copy.title).toBe("Round Over!");
    expect(copy.body.length).toBeGreaterThan(20);
  });
});
