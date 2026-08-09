import AsyncStorage from "@react-native-async-storage/async-storage";
import { render, waitFor } from "@testing-library/react-native";
import React from "react";
import { useGameStore } from "../../../engine/gameStore";
import { ThemeProvider } from "../../../theme/ThemeProvider";
import { GameBoard } from "../GameBoard";
import { makeGameState } from "../testing/gameTestFixtures";

const mockGameSetup = jest.fn((_props: Record<string, unknown>) => null);
const mockGameOver = jest.fn((_props: Record<string, unknown>) => null);
const mockPlayTopBar = jest.fn((_props: Record<string, unknown>) => null);
const mockGameTable = jest.fn((_props: Record<string, unknown>) => null);
const mockBidPanel = jest.fn((_props: Record<string, unknown>) => null);
const mockActionBar = jest.fn((_props: Record<string, unknown>) => null);
const mockMobileBidStrip = jest.fn((_props: Record<string, unknown>) => null);
const mockRoundResult = jest.fn((_props: Record<string, unknown>) => null);
const mockTableBidCenter = jest.fn((_props: Record<string, unknown>) => null);
const mockTutorialWelcome = jest.fn((_props: Record<string, unknown>) => null);
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
  useTutorialHighlightStore: (sel: (s: Record<string, unknown>) => unknown) =>
    sel({
      setMeasurements: mockSetMeasurements,
      clearMeasurements: mockClearMeasurements,
    }),
}));

jest.mock("../GameSetup", () => ({ GameSetup: (props: Record<string, unknown>) => mockGameSetup(props) }));
jest.mock("../GameOver", () => ({ GameOver: (props: Record<string, unknown>) => mockGameOver(props) }));
jest.mock("../PlayTopBar", () => ({ PlayTopBar: (props: Record<string, unknown>) => mockPlayTopBar(props) }));
jest.mock("../GameTable", () => ({ GameTable: (props: Record<string, unknown>) => mockGameTable(props) }));
jest.mock("../BidPanel", () => ({ BidPanel: (props: Record<string, unknown>) => mockBidPanel(props) }));
jest.mock("../ActionBar", () => ({ ActionBar: (props: Record<string, unknown>) => mockActionBar(props) }));
jest.mock("../MobileBidStrip", () => ({ MobileBidStrip: (props: Record<string, unknown>) => mockMobileBidStrip(props) }));
jest.mock("../RoundResult", () => ({ RoundResult: (props: Record<string, unknown>) => mockRoundResult(props) }));
jest.mock("../TableBidCenter", () => ({ TableBidCenter: (props: Record<string, unknown>) => mockTableBidCenter(props) }));
jest.mock("../../tutorial/TutorialWelcome", () => ({
  TutorialWelcome: (props: Record<string, unknown>) => mockTutorialWelcome(props),
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
    animatingShuffle: false,
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
    expect(mockGameOver.mock.calls[0]![0]).toHaveProperty("state", state);
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
    expect(mockBidPanel.mock.calls[0]![0]).toMatchObject({ enabled: true });
    expect(mockActionBar.mock.calls[0]![0]).toMatchObject({ enabled: true });
  });

  it("disables bid and challenge controls while dice are shuffling", async () => {
    stubStore({
      phase: "playing",
      animatingShuffle: true,
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
    await waitFor(() => expect(mockBidPanel).toHaveBeenCalled());
    expect(mockBidPanel.mock.calls[0]![0]).toMatchObject({ enabled: false });
    expect(mockActionBar.mock.calls[0]![0]).toMatchObject({ enabled: false });
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
