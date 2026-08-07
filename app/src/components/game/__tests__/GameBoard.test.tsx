import AsyncStorage from "@react-native-async-storage/async-storage";
import { render, waitFor } from "@testing-library/react-native";
import React from "react";
import { useGameStore } from "../../../engine/gameStore";
import { ThemeProvider } from "../../../theme/ThemeProvider";
import { GameBoard } from "../GameBoard";
import { makeGameState } from "../testing/gameTestFixtures";

const mockGameSetup = jest.fn(() => null);
const mockGameOver = jest.fn(() => null);
const mockPlayTopBar = jest.fn(() => null);
const mockGameTable = jest.fn(() => null);
const mockBidPanel = jest.fn(() => null);
const mockActionBar = jest.fn(() => null);
const mockMobileBidStrip = jest.fn(() => null);
const mockRoundResult = jest.fn(() => null);
const mockTableBidCenter = jest.fn(() => null);
const mockTutorialWelcome = jest.fn(() => null);
const mockSetMeasurements = jest.fn();
const mockClearMeasurements = jest.fn();

jest.mock("../../shared/Header", () => ({
  useHeaderOffset: () => 64,
  HEADER_HEIGHT: 64,
}));

jest.mock("react-native-safe-area-context", () => ({
  useSafeAreaInsets: () => ({ top: 0, right: 0, bottom: 0, left: 0 }),
}));

jest.mock("../../tutorial/tutorialHighlightStore", () => ({
  useTutorialHighlightStore: (sel) =>
    sel({
      setMeasurements: mockSetMeasurements,
      clearMeasurements: mockClearMeasurements,
    }),
}));

jest.mock("../GameSetup", () => ({ GameSetup: (props) => mockGameSetup(props) }));
jest.mock("../GameOver", () => ({ GameOver: (props) => mockGameOver(props) }));
jest.mock("../PlayTopBar", () => ({ PlayTopBar: (props) => mockPlayTopBar(props) }));
jest.mock("../GameTable", () => ({ GameTable: (props) => mockGameTable(props) }));
jest.mock("../BidPanel", () => ({ BidPanel: (props) => mockBidPanel(props) }));
jest.mock("../ActionBar", () => ({ ActionBar: (props) => mockActionBar(props) }));
jest.mock("../MobileBidStrip", () => ({ MobileBidStrip: (props) => mockMobileBidStrip(props) }));
jest.mock("../RoundResult", () => ({ RoundResult: (props) => mockRoundResult(props) }));
jest.mock("../TableBidCenter", () => ({ TableBidCenter: (props) => mockTableBidCenter(props) }));
jest.mock("../../tutorial/TutorialWelcome", () => ({
  TutorialWelcome: (props) => mockTutorialWelcome(props),
}));

jest.mock("../../../engine/gameStore", () => ({
  useGameStore: jest.fn(),
}));

const useGameStoreMock = useGameStore as unknown as jest.Mock;

function stubStore(partial: Record<string, unknown>) {
  const state = {
    gameState: null,
    phase: "setup",
    settings: {
      enableSpotOn: true,
      enablePalifico: false,
      playerCount: 2,
      aiDifficulty: "easy",
      playerName: "You",
    },
    showHints: false,
    soundEnabled: true,
    animatingReveal: false,
    tutorialMode: false,
    tutorialStep: 0,
    showTutorialPrompt: false,
    updateSettings: jest.fn(),
    startGame: jest.fn(),
    placeBid: jest.fn(),
    challenge: jest.fn(),
    spotOn: jest.fn(),
    continueToNextRound: jest.fn(),
    resetGame: jest.fn(),
    toggleHints: jest.fn(),
    toggleSound: jest.fn(),
    startTutorial: jest.fn(),
    skipTutorial: jest.fn(),
    dismissTutorialPrompt: jest.fn(),
    advanceTutorialStep: jest.fn(),
    ...partial,
  };
  useGameStoreMock.mockImplementation((sel?: (s: typeof state) => unknown) =>
    typeof sel === "function" ? sel(state) : state,
  );
}

beforeEach(async () => {
  await AsyncStorage.clear();
  jest.clearAllMocks();
});

describe("GameBoard", () => {
  it("routes setup phase to GameSetup", async () => {
    stubStore({ phase: "setup", gameState: null });
    await render(
      <ThemeProvider>
        <GameBoard />
      </ThemeProvider>,
    );
    await waitFor(() => expect(mockGameSetup).toHaveBeenCalled());
    expect(mockGameOver).not.toHaveBeenCalled();
    expect(mockPlayTopBar).not.toHaveBeenCalled();
  });

  it("routes game-over to GameOver outside tutorial", async () => {
    const state = makeGameState({ gameOver: true, winner: "human" });
    stubStore({
      phase: "game-over",
      tutorialMode: false,
      gameState: state,
    });
    await render(
      <ThemeProvider>
        <GameBoard />
      </ThemeProvider>,
    );
    await waitFor(() => expect(mockGameOver).toHaveBeenCalled());
    expect(mockGameOver.mock.calls[0][0].state).toBe(state);
    expect(mockGameSetup).not.toHaveBeenCalled();
  });

  it("mounts play chrome, table, bid panel, and action bar while playing", async () => {
    stubStore({
      phase: "playing",
      gameState: makeGameState({
        currentBid: { quantity: 2, faceValue: 3 },
        lastBidder: "ai-1",
        isFirstBidOfRound: false,
        roundHistory: [{ type: "bid", playerId: "ai-1", bid: { quantity: 2, faceValue: 3 } }],
      }),
    });
    await render(
      <ThemeProvider>
        <GameBoard />
      </ThemeProvider>,
    );
    await waitFor(() => expect(mockPlayTopBar).toHaveBeenCalled());
    expect(mockGameTable).toHaveBeenCalled();
    expect(mockBidPanel).toHaveBeenCalled();
    expect(mockActionBar).toHaveBeenCalled();
  });

  it("shows tutorial welcome on the playing shell when prompted", async () => {
    stubStore({
      phase: "playing",
      showTutorialPrompt: true,
      gameState: makeGameState(),
    });
    await render(
      <ThemeProvider>
        <GameBoard />
      </ThemeProvider>,
    );
    await waitFor(() => expect(mockTutorialWelcome).toHaveBeenCalled());
  });
});
