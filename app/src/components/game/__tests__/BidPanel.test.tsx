import AsyncStorage from "@react-native-async-storage/async-storage";
import { fireEvent, render, waitFor } from "@testing-library/react-native";
import React from "react";
import type { Bid, GameState } from "../../../engine/types";
import { ThemeProvider } from "../../../theme/ThemeProvider";
import { BidPanel } from "../BidPanel";

beforeEach(async () => {
  await AsyncStorage.clear();
});

function makeState(): GameState {
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
        dice: [1, 1, 1, 1, 1],
        diceCount: 5,
        isAI: true,
        aiDifficulty: "easy",
        isEliminated: false,
        hasTriggeredPalifico: false,
      },
    ],
    currentPlayerIndex: 0,
    currentBid: null,
    lastBidder: null,
    roundHistory: [],
    roundNumber: 1,
    isFirstBidOfRound: true,
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
  };
}

async function renderPanel(
  overrides: { enabled?: boolean; sizeTier?: "compact" | "regular" | "roomy"; onBid?: jest.Mock } = {},
) {
  const onBid = overrides.onBid ?? jest.fn();
  const view = await render(
    <ThemeProvider>
      <BidPanel
        state={makeState()}
        onBid={onBid}
        showHints={false}
        enabled={overrides.enabled ?? true}
        sizeTier={overrides.sizeTier ?? "compact"}
      />
    </ThemeProvider>,
  );
  await waitFor(() => expect(view.getByText("Face")).toBeTruthy());
  return Object.assign(view, { onBid });
}

describe("BidPanel", () => {
  it("renders qty, face labels, and face accessibility chips", async () => {
    const { getByText, getByLabelText } = await renderPanel();
    expect(getByText("Qty")).toBeTruthy();
    expect(getByText("Face")).toBeTruthy();
    for (let face = 1; face <= 6; face++) {
      expect(getByLabelText(`Face ${face}`)).toBeTruthy();
    }
  });

  it("submits a bid from the full-width compact button", async () => {
    const { getByText, onBid } = await renderPanel({ sizeTier: "compact" });
    fireEvent.press(getByText(/Bid 1×1/));
    expect(onBid).toHaveBeenCalledWith({ quantity: 1, faceValue: 1 } satisfies Bid);
  });

  it("changes face selection before bidding", async () => {
    const { getByLabelText, getByText, onBid } = await renderPanel();
    fireEvent.press(getByLabelText("Face 4"));
    await waitFor(() => expect(getByText(/Bid 1×4/)).toBeTruthy());
    fireEvent.press(getByText(/Bid 1×4/));
    expect(onBid).toHaveBeenCalledWith({ quantity: 1, faceValue: 4 });
  });

  it("shows Waiting… when disabled", async () => {
    const { getByText, onBid } = await renderPanel({ enabled: false });
    expect(getByText("Waiting…")).toBeTruthy();
    fireEvent.press(getByText("Waiting…"));
    expect(onBid).not.toHaveBeenCalled();
  });
});
