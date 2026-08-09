import { cleanup, render } from "@testing-library/react-native";
import React from "react";
import { TableBidCenter } from "../TableBidCenter";
import { makeGameState } from "../testing/gameTestFixtures";

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

describe("TableBidCenter", () => {
  it("shows empty-round copy before any bid", async () => {
    const view = await render(<TableBidCenter state={makeGameState()} sizeTier="compact" />);
    expect(view.getByText("Open the round")).toBeTruthy();
    expect(view.getByText("No bid yet")).toBeTruthy();
  });

  it("shows Round over after a challenge resolves", async () => {
    const view = await render(
      <TableBidCenter state={makeGameState()} sizeTier="roomy" roundOver />,
    );
    expect(view.getByText("Round over")).toBeTruthy();
    expect(view.queryByText("Open the round")).toBeNull();
  });

  it("pins the current bid and lists prior bids", async () => {
    const view = await render(
      <TableBidCenter
        state={makeGameState({
          currentBid: { quantity: 3, faceValue: 2 },
          lastBidder: "ai-1",
          isFirstBidOfRound: false,
          roundHistory: [
            { type: "bid", playerId: "human", bid: { quantity: 1, faceValue: 1 } },
            { type: "bid", playerId: "ai-1", bid: { quantity: 3, faceValue: 2 } },
          ],
        })}
        sizeTier="compact"
      />,
    );

    expect(view.getByText("Round bids")).toBeTruthy();
    expect(view.getByText("You")).toBeTruthy();
    expect(view.getByText("1×1s")).toBeTruthy();
    expect(view.getByText("Silver Fox")).toBeTruthy();
    expect(view.getByText("3 × 2s")).toBeTruthy();
  });

  it("shortens long opponent names on compact tier", async () => {
    const base = makeGameState();
    const view = await render(
      <TableBidCenter
        state={makeGameState({
          players: [
            base.players[0],
            { ...base.players[1], name: "Captain Extremely Long Name" },
          ],
          roundHistory: [
            {
              type: "bid",
              playerId: "ai-1",
              bid: { quantity: 2, faceValue: 5 },
            },
          ],
          currentBid: { quantity: 2, faceValue: 5 },
          lastBidder: "ai-1",
          isFirstBidOfRound: false,
        })}
        sizeTier="compact"
      />,
    );

    expect(view.getByText(/Captain/)).toBeTruthy();
    expect(view.queryByText("Captain Extremely Long Name")).toBeNull();
    expect(view.getByText("2 × 5s")).toBeTruthy();
  });
});
