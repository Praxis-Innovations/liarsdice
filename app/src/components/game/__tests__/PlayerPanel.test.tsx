import AsyncStorage from "@react-native-async-storage/async-storage";
import { render, waitFor } from "@testing-library/react-native";
import React from "react";
import type { Player } from "../../../engine/types";
import { ThemeProvider } from "../../../theme/ThemeProvider";
import { PlayerPanel } from "../PlayerPanel";

beforeEach(async () => {
  await AsyncStorage.clear();
});

const human: Player = {
  id: "human",
  name: "Amrit",
  dice: [1, 2, 3, 4, 5],
  diceCount: 5,
  isAI: false,
  isEliminated: false,
  hasTriggeredPalifico: false,
};

const bot: Player = {
  id: "ai-1",
  name: "Silver Fox",
  dice: [6, 6, 6, 6, 6],
  diceCount: 5,
  isAI: true,
  aiDifficulty: "easy",
  isEliminated: false,
  hasTriggeredPalifico: false,
};

async function renderPanel(player: Player, overrides: Partial<React.ComponentProps<typeof PlayerPanel>> = {}) {
  const view = await render(
    <ThemeProvider>
      <PlayerPanel
        player={player}
        isCurrentTurn={false}
        isHuman={player.id === "human"}
        showDice={player.id === "human"}
        onesWild
        compactSeat
        seatWidth={180}
        seatHeight={90}
        dieSizePx={14}
        {...overrides}
      />
    </ThemeProvider>,
  );
  await waitFor(() => {
    // Eliminated seats show both the name and "Out" — use getAllByText.
    expect(view.getAllByText(/You|Silver Fox|Out/).length).toBeGreaterThan(0);
  });
  return view;
}

describe("PlayerPanel", () => {
  it("labels the human seat as You with a Y chip", async () => {
    const { getByText } = await renderPanel(human);
    expect(getByText("You")).toBeTruthy();
    expect(getByText("Y")).toBeTruthy();
  });

  it("shows opponent name and TURN badge on their turn", async () => {
    const { getByText } = await renderPanel(bot, { isCurrentTurn: true, isHuman: false, showDice: false });
    expect(getByText("Silver Fox")).toBeTruthy();
    expect(getByText("TURN")).toBeTruthy();
  });

  it("renders eliminated state", async () => {
    const { getByText } = await renderPanel(
      { ...bot, isEliminated: true, diceCount: 0, dice: [] },
      { isHuman: false, showDice: false },
    );
    expect(getByText("Silver Fox")).toBeTruthy();
    expect(getByText("Out")).toBeTruthy();
  });
});
