import { cleanup, fireEvent, render } from "@testing-library/react-native";
import React from "react";
import type { GameState } from "../../../engine/types";
import { ActionBar } from "../ActionBar";

jest.mock("../../../theme/ThemeProvider", () => {
  const tokens = require("../../../theme/tokens");
  return {
    ThemeProvider: ({ children }) => children,
    useTheme: () => ({
      colors: tokens.lightColors,
      spacing: tokens.SPACING,
      radii: tokens.RADII,
      typography: tokens.TYPOGRAPHY,
      isDark: false,
      themeMode: "light",
      toggleTheme: jest.fn(),
      setThemeMode: jest.fn(),
    }),
  };
});

afterEach(() => {
  cleanup();
});

function makeState(overrides: Partial<GameState> = {}): GameState {
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
        name: "Bot",
        dice: [6, 6, 6, 6, 6],
        diceCount: 5,
        isAI: true,
        aiDifficulty: "easy",
        isEliminated: false,
        hasTriggeredPalifico: false,
      },
    ],
    currentPlayerIndex: 0,
    currentBid: { quantity: 3, faceValue: 6 },
    lastBidder: "ai-1",
    roundHistory: [
      { type: "bid", playerId: "human", bid: { quantity: 1, faceValue: 2 } },
      { type: "bid", playerId: "ai-1", bid: { quantity: 3, faceValue: 6 } },
    ],
    roundNumber: 1,
    isFirstBidOfRound: false,
    isPalificoRound: false,
    palificoPlayerId: null,
    onesWild: true,
    gameOver: false,
    winner: null,
    lastRoundResult: null,
    settings: {
      enableSpotOn: true,
      enablePalifico: false,
      playerCount: 2,
      aiDifficulty: "easy",
      playerName: "You",
    },
    ...overrides,
  };
}

async function renderBar(state: GameState, props: Partial<React.ComponentProps<typeof ActionBar>> = {}) {
  const onChallenge = props.onChallenge ?? jest.fn();
  const onSpotOn = props.onSpotOn ?? jest.fn();
  const view = await render(
    <ActionBar
      state={state}
      onChallenge={onChallenge}
      onSpotOn={onSpotOn}
      showHints={props.showHints ?? false}
      enabled={props.enabled ?? true}
    />,
  );
  return Object.assign(view, { onChallenge, onSpotOn });
}

describe("ActionBar", () => {
  // Render-only cases first — Reanimated press handlers leave overlapping act() that
  // breaks subsequent mounts in this file.
  it("hides Spot On when the rule is disabled", async () => {
    const view = await renderBar(
      makeState({
        settings: {
          enableSpotOn: false,
          enablePalifico: false,
          playerCount: 2,
          aiDifficulty: "easy",
          playerName: "You",
        },
      }),
    );

    expect(view.getByText("Liar!")).toBeTruthy();
    expect(view.queryByText("Spot On!")).toBeNull();
  });

  it("renders Liar disabled when the bar is not enabled", async () => {
    const view = await renderBar(makeState(), { enabled: false });
    const liar = view.getByRole("button", { name: "Liar!" });
    expect(liar).toBeDisabled();
  });

  it("renders Spot On and invokes Liar / Spot On handlers", async () => {
    const view = await renderBar(makeState());
    expect(view.getByText("Liar!")).toBeTruthy();
    expect(view.getByText("Spot On!")).toBeTruthy();

    fireEvent.press(view.getByText("Liar!"));
    fireEvent.press(view.getByText("Spot On!"));
    expect(view.onChallenge).toHaveBeenCalledTimes(1);
    expect(view.onSpotOn).toHaveBeenCalledTimes(1);
  });
});
