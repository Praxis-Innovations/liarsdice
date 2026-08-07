import AsyncStorage from "@react-native-async-storage/async-storage";
import { fireEvent, render, waitFor } from "@testing-library/react-native";
import React from "react";
import { Share } from "react-native";
import { ThemeProvider } from "../../../theme/ThemeProvider";
import { GameOver } from "../GameOver";
import { makeGameState } from "../testing/gameTestFixtures";

beforeEach(async () => {
  await AsyncStorage.clear();
  jest.spyOn(Share, "share").mockResolvedValue({ action: Share.sharedAction } as never);
});

afterEach(() => {
  jest.restoreAllMocks();
});

async function renderOver(state = makeGameState(), onPlayAgain = jest.fn()) {
  const view = await render(
    <ThemeProvider>
      <GameOver state={state} onPlayAgain={onPlayAgain} />
    </ThemeProvider>,
  );
  await waitFor(() => expect(view.getByText(/You Win!|Game Over/)).toBeTruthy());
  return Object.assign(view, { onPlayAgain });
}

describe("GameOver", () => {
  it("celebrates a human win with stats and Play Again", async () => {
    const view = await renderOver(
      makeGameState({
        gameOver: true,
        winner: "human",
        roundNumber: 4,
        settings: {
          enableSpotOn: true,
          enablePalifico: false,
          playerCount: 2,
          aiDifficulty: "medium",
          playerName: "You",
        },
      }),
    );

    expect(view.getByText("You Win!")).toBeTruthy();
    expect(view.getByText("You outbluffed everyone!")).toBeTruthy();
    expect(view.getByText("Game Stats")).toBeTruthy();
    expect(view.getByText("Rounds Played")).toBeTruthy();
    expect(view.getByText("4")).toBeTruthy();
    expect(view.getByText("medium")).toBeTruthy();

    fireEvent.press(view.getByText("Play Again"));
    expect(view.onPlayAgain).toHaveBeenCalledTimes(1);
  });

  it("shows the AI winner when the human loses", async () => {
    const view = await renderOver(
      makeGameState({
        gameOver: true,
        winner: "ai-1",
      }),
    );

    expect(view.getByText("Game Over")).toBeTruthy();
    expect(view.getByText("Silver Fox is the last player standing.")).toBeTruthy();
  });

  it("shares a win message from Share Result", async () => {
    const view = await renderOver(
      makeGameState({
        gameOver: true,
        winner: "human",
        settings: {
          enableSpotOn: true,
          enablePalifico: false,
          playerCount: 2,
          aiDifficulty: "hard",
          playerName: "You",
        },
      }),
    );

    fireEvent.press(view.getByText("Share Result"));
    expect(Share.share).toHaveBeenCalled();
    const arg = (Share.share as jest.Mock).mock.calls[0][0] as { message: string };
    expect(arg.message).toMatch(/I won a game of Liar's Dice/);
    expect(arg.message).toMatch(/hard/);
  });
});
