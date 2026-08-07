import AsyncStorage from "@react-native-async-storage/async-storage";
import { render, waitFor } from "@testing-library/react-native";
import React from "react";
import { ThemeProvider } from "../../../theme/ThemeProvider";
import { DiceCountChip, GameStatus, RoundChip } from "../GameStatus";
import { makeGameState, makePlayer } from "../testing/gameTestFixtures";

beforeEach(async () => {
  await AsyncStorage.clear();
});

describe("GameStatus", () => {
  it("shows aces-wild mode and your turn badges", async () => {
    const state = makeGameState({ roundNumber: 3, onesWild: true, currentPlayerIndex: 0 });
    const view = await render(
      <ThemeProvider>
        <GameStatus state={state} phase="playing" />
      </ThemeProvider>,
    );
    await waitFor(() => expect(view.getByText("Your turn")).toBeTruthy());
    expect(view.getByText("Aces wild")).toBeTruthy();
    expect(view.queryByText(/Round 3/)).toBeNull();
  });

  it("labels AI thinking and Palifico mode", async () => {
    const state = makeGameState({
      currentPlayerIndex: 1,
      isPalificoRound: true,
      onesWild: false,
    });
    const view = await render(
      <ThemeProvider>
        <GameStatus state={state} phase="ai-thinking" />
      </ThemeProvider>,
    );
    await waitFor(() => expect(view.getByText("Palifico")).toBeTruthy());
    expect(view.getByText("Silver Fox…")).toBeTruthy();
  });

  it("RoundChip and DiceCountChip match status meta", async () => {
    const state = makeGameState({ roundNumber: 2 });
    const view = await render(
      <ThemeProvider>
        <RoundChip state={state} />
        <DiceCountChip state={state} />
      </ThemeProvider>,
    );
    await waitFor(() => expect(view.getByText("Round 2")).toBeTruthy());
    expect(view.getByText("10 dice")).toBeTruthy();
  });

  it("DiceCountChip excludes eliminated players from the total", async () => {
    const state = makeGameState({
      players: [
        makePlayer({ id: "human", name: "You", isAI: false, diceCount: 3 }),
        makePlayer({
          id: "ai-1",
          name: "Silver Fox",
          isAI: true,
          aiDifficulty: "easy",
          diceCount: 0,
          isEliminated: true,
          dice: [],
        }),
      ],
    });
    const view = await render(
      <ThemeProvider>
        <DiceCountChip state={state} />
      </ThemeProvider>,
    );
    await waitFor(() => expect(view.getByText("3 dice")).toBeTruthy());
  });
});
