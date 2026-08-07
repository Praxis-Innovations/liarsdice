import { cleanup, render } from "@testing-library/react-native";
import React from "react";
import { MobileBidStrip } from "../MobileBidStrip";
import { makeGameState, makePlayer } from "../testing/gameTestFixtures";

jest.mock("../../../theme/ThemeProvider", () => {
  const tokens = require("../../../theme/tokens");
  return {
    ThemeProvider: ({ children }: { children: React.ReactNode }) => children,
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

beforeEach(() => {
  jest.spyOn(global, "requestAnimationFrame").mockImplementation((cb: FrameRequestCallback) => {
    cb(0);
    return 0;
  });
});

afterEach(() => {
  cleanup();
  jest.restoreAllMocks();
});

function makeStripState(overrides: Parameters<typeof makeGameState>[0] = {}) {
  return makeGameState({
    players: [
      makePlayer({ id: "human", name: "You", isAI: false }),
      makePlayer({ id: "ai-1", name: "Silver Fox", isAI: true, aiDifficulty: "easy" }),
      makePlayer({ id: "ai-2", name: "Captain Drake", isAI: true, aiDifficulty: "easy" }),
    ],
    settings: {
      enableSpotOn: true,
      enablePalifico: false,
      playerCount: 3,
      aiDifficulty: "easy",
      playerName: "You",
    },
    ...overrides,
  });
}

describe("MobileBidStrip", () => {
  it("shows empty-round copy before any bid", async () => {
    const view = await render(<MobileBidStrip state={makeStripState()} />);
    expect(view.getByText("Open the round")).toBeTruthy();
    expect(view.getByText("No bid yet")).toBeTruthy();
  });

  it("pins the current bid and lists priors with name on the left", async () => {
    const view = await render(
      <MobileBidStrip
        state={makeStripState({
          currentBid: { quantity: 3, faceValue: 2 },
          lastBidder: "ai-1",
          isFirstBidOfRound: false,
          roundHistory: [
            { type: "bid", playerId: "human", bid: { quantity: 1, faceValue: 1 } },
            { type: "bid", playerId: "ai-2", bid: { quantity: 2, faceValue: 1 } },
            { type: "bid", playerId: "ai-1", bid: { quantity: 3, faceValue: 2 } },
          ],
        })}
      />,
    );

    expect(view.getByText("Round bids")).toBeTruthy();
    expect(view.getByText("You")).toBeTruthy();
    expect(view.getByText("1×1s")).toBeTruthy();
    expect(view.getByText("Captain Drake")).toBeTruthy();
    expect(view.getByText("2×1s")).toBeTruthy();
    expect(view.getByText("Silver Fox")).toBeTruthy();
    expect(view.getByText("3 × 2s")).toBeTruthy();
  });
});
