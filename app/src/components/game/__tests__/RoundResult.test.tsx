import AsyncStorage from "@react-native-async-storage/async-storage";
import { fireEvent, render, waitFor } from "@testing-library/react-native";
import React from "react";
import type { GameState, RoundResult as RoundResultData } from "../../../engine/types";
import { ThemeProvider } from "../../../theme/ThemeProvider";
import { RoundResult } from "../RoundResult";

jest.mock("moti", () => {
  const { View } = require("react-native");
  return {
    MotiView: ({ children, ...props }: { children?: React.ReactNode }) => (
      <View {...props}>{children}</View>
    ),
  };
});

beforeEach(async () => {
  await AsyncStorage.clear();
});

function makeState(result: RoundResultData): GameState {
  return {
    players: [
      {
        id: "human",
        name: "You",
        dice: [1, 2, 3, 4, 5],
        diceCount: 5,
        isAI: false,
        isEliminated: false,
        hasTriggeredPalifico: false,
      },
      {
        id: "ai-1",
        name: "Silver Fox",
        dice: [1, 1, 1, 2, 2],
        diceCount: 5,
        isAI: true,
        aiDifficulty: "easy",
        isEliminated: false,
        hasTriggeredPalifico: false,
      },
    ],
    currentPlayerIndex: 0,
    currentBid: result.currentBid,
    lastBidder: "ai-1",
    roundHistory: [],
    roundNumber: 1,
    isFirstBidOfRound: false,
    isPalificoRound: false,
    palificoPlayerId: null,
    onesWild: true,
    gameOver: false,
    winner: null,
    lastRoundResult: result,
    settings: {
      enableSpotOn: true,
      enablePalifico: false,
      playerCount: 2,
      aiDifficulty: "easy",
      playerName: "You",
    },
  };
}

async function renderResult(state: GameState, onContinue = jest.fn()) {
  const view = await render(
    <ThemeProvider>
      <RoundResult state={state} onContinue={onContinue} animating={false} compact />
    </ThemeProvider>,
  );
  await waitFor(() => expect(view.getByText(/Liar!|Spot On!/)).toBeTruthy());
  return { ...view, onContinue };
}

describe("RoundResult", () => {
  it("renders Liar outcome with bid vs actual columns", async () => {
    const state = makeState({
      challenger: "human",
      challengedPlayer: "ai-1",
      challengeType: "liar",
      currentBid: { quantity: 4, faceValue: 3 },
      allDice: {},
      actualCount: 2,
      challengerWins: true,
      loser: "ai-1",
      diceGained: false,
    });
    const { getByText, getByRole } = await renderResult(state);

    expect(getByRole("heading", { name: "Liar!" })).toBeTruthy();
    expect(getByText("You wins")).toBeTruthy();
    expect(getByText("4×3")).toBeTruthy();
    expect(getByText("2")).toBeTruthy();
    expect(getByText(/Silver Fox loses a die/)).toBeTruthy();
    expect(getByText("Next Round")).toBeTruthy();
  });

  it("renders Spot On copy and secondary continue label when game is over", async () => {
    const state = makeState({
      challenger: "ai-1",
      challengedPlayer: "human",
      challengeType: "spot-on",
      currentBid: { quantity: 3, faceValue: 1 },
      allDice: {},
      actualCount: 5,
      challengerWins: false,
      loser: "ai-1",
      diceGained: false,
    });
    state.gameOver = true;
    const { getByText, onContinue } = await renderResult(state);

    expect(getByText("Spot On!")).toBeTruthy();
    expect(getByText("Silver Fox loses")).toBeTruthy();
    expect(getByText("See Results")).toBeTruthy();
    fireEvent.press(getByText("See Results"));
    expect(onContinue).toHaveBeenCalledTimes(1);
  });

  it("colors outcome green when human wins", async () => {
    const state = makeState({
      challenger: "human",
      challengedPlayer: "ai-1",
      challengeType: "liar",
      currentBid: { quantity: 4, faceValue: 3 },
      allDice: {},
      actualCount: 2,
      challengerWins: true,
      loser: "ai-1",
      diceGained: false,
    });
    const { getByText } = await renderResult(state);
    const outcomeEl = getByText("You wins");
    const style = Array.isArray(outcomeEl.props.style)
      ? Object.assign({}, ...outcomeEl.props.style)
      : outcomeEl.props.style;
    expect(style.color).toBe("#00B894");
  });

  it("colors outcome red when human loses", async () => {
    const state = makeState({
      challenger: "ai-1",
      challengedPlayer: "human",
      challengeType: "liar",
      currentBid: { quantity: 2, faceValue: 3 },
      allDice: {},
      actualCount: 4,
      challengerWins: true,
      loser: "human",
      diceGained: false,
    });
    const { getByText } = await renderResult(state);
    const outcomeEl = getByText("Silver Fox wins");
    const style = Array.isArray(outcomeEl.props.style)
      ? Object.assign({}, ...outcomeEl.props.style)
      : outcomeEl.props.style;
    expect(style.color).toBe("#D62839");
  });

  it("returns null without a last round result", async () => {
    const state = makeState({
      challenger: "human",
      challengedPlayer: "ai-1",
      challengeType: "liar",
      currentBid: { quantity: 1, faceValue: 1 },
      allDice: {},
      actualCount: 0,
      challengerWins: true,
      loser: "ai-1",
      diceGained: false,
    });
    state.lastRoundResult = null;
    const view = await render(
      <ThemeProvider>
        <RoundResult state={state} onContinue={jest.fn()} animating={false} />
      </ThemeProvider>,
    );
    await waitFor(() => {
      expect(view.queryByText(/Liar!|Spot On!/)).toBeNull();
    });
  });
});
