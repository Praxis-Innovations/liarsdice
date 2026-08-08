import AsyncStorage from "@react-native-async-storage/async-storage";
import { fireEvent, render, waitFor, within } from "@testing-library/react-native";
import React from "react";
import type { GameSettings } from "../../../engine/types";
import { ThemeProvider } from "../../../theme/ThemeProvider";
import { GameSetup } from "../GameSetup";
import {
  GAME_SETUP_DIFFICULTIES,
  GAME_SETUP_LAYOUT,
  GAME_SETUP_TEST_IDS,
} from "../gameSetupLayout";

jest.mock("react-native-reanimated", () => require("react-native-reanimated/mock"));

const baseSettings: GameSettings = {
  playerCount: 4,
  aiDifficulty: "medium",
  enableSpotOn: true,
  enablePalifico: true,
  playerName: "You",
};

beforeEach(async () => {
  await AsyncStorage.clear();
});

async function renderSetup(
  overrides: {
    settings?: Partial<GameSettings>;
    density?: 0 | 1 | 2;
    onUpdateSettings?: jest.Mock;
    onStart?: jest.Mock;
    onStartTutorial?: jest.Mock;
  } = {},
) {
  const onUpdateSettings = overrides.onUpdateSettings ?? jest.fn();
  const onStart = overrides.onStart ?? jest.fn();
  const onStartTutorial = overrides.onStartTutorial ?? jest.fn();

  const view = await render(
    <ThemeProvider>
      <GameSetup
        settings={{ ...baseSettings, ...overrides.settings }}
        onUpdateSettings={onUpdateSettings}
        onStart={onStart}
        onStartTutorial={onStartTutorial}
        density={overrides.density}
      />
    </ThemeProvider>,
  );

  // Let ThemeProvider finish its AsyncStorage hydration before assertions.
  await waitFor(() => {
    expect(view.getByTestId(GAME_SETUP_TEST_IDS.root)).toBeTruthy();
  });

  return { ...view, onUpdateSettings, onStart, onStartTutorial };
}

function flattenStyle(style: unknown): Record<string, unknown> {
  if (style == null) return {};
  if (Array.isArray(style)) {
    return style.reduce<Record<string, unknown>>((acc, item) => ({ ...acc, ...flattenStyle(item) }), {});
  }
  if (typeof style === "object") return style as Record<string, unknown>;
  return {};
}

describe("GAME_SETUP_LAYOUT contract", () => {
  it("locks column width, name input size, row directions, and CTA order", () => {
    expect(GAME_SETUP_LAYOUT.maxWidth.comfortable).toBe(475);
    expect(GAME_SETUP_LAYOUT.maxWidth.dense).toBe(400);
    expect(GAME_SETUP_LAYOUT.nameInput.width.default).toBe(175);
    expect(GAME_SETUP_LAYOUT.nameInput.width.dense).toBe(155);
    expect(GAME_SETUP_LAYOUT.nameInput.maxWidth).toBe("48%");
    expect(GAME_SETUP_LAYOUT.rowDirection).toBe("row");
    expect(GAME_SETUP_LAYOUT.difficultyDirection).toBe("row");
    expect(GAME_SETUP_LAYOUT.actionsOrder).toEqual(["Tutorial", "Start Game"]);
    expect(GAME_SETUP_LAYOUT.titleSize.comfortable).toBe(35);
    expect(GAME_SETUP_LAYOUT.titleSize.dense).toBe(25);
    expect(GAME_SETUP_LAYOUT.labelSize.default).toBe(16);
    expect(GAME_SETUP_LAYOUT.labelSize.dense).toBe(14);
  });

  it("locks difficulty copy shown under the chip row", () => {
    expect(GAME_SETUP_DIFFICULTIES.map((d) => d.value)).toEqual(["easy", "medium", "hard"]);
    expect(GAME_SETUP_DIFFICULTIES.map((d) => d.label)).toEqual(["Easy", "Medium", "Hard"]);
    for (const d of GAME_SETUP_DIFFICULTIES) {
      expect(d.desc.length).toBeGreaterThan(20);
    }
  });
});

describe("GameSetup UI", () => {
  it("renders the locked section structure and headings", async () => {
    const { getByRole, getByText, getByTestId } = await renderSetup();

    expect(getByRole("heading", { name: "New Game" })).toBeTruthy();
    expect(getByText("Your Name")).toBeTruthy();
    expect(getByText("Players")).toBeTruthy();
    expect(getByText("AI Difficulty")).toBeTruthy();
    expect(getByText("Optional Rules")).toBeTruthy();
    expect(getByText("Spot On")).toBeTruthy();
    expect(getByText("Palifico Rounds")).toBeTruthy();

    expect(getByTestId(GAME_SETUP_TEST_IDS.root)).toBeTruthy();
    expect(getByTestId(GAME_SETUP_TEST_IDS.nameRow)).toBeTruthy();
    expect(getByTestId(GAME_SETUP_TEST_IDS.playersRow)).toBeTruthy();
    expect(getByTestId(GAME_SETUP_TEST_IDS.difficultySection)).toBeTruthy();
    expect(getByTestId(GAME_SETUP_TEST_IDS.rulesSection)).toBeTruthy();
    expect(getByTestId(GAME_SETUP_TEST_IDS.actionsRow)).toBeTruthy();
  });

  it("keeps name and players rows horizontal", async () => {
    const { getByTestId } = await renderSetup();

    expect(flattenStyle(getByTestId(GAME_SETUP_TEST_IDS.nameRow).props.style).flexDirection).toBe(
      GAME_SETUP_LAYOUT.rowDirection,
    );
    expect(flattenStyle(getByTestId(GAME_SETUP_TEST_IDS.playersRow).props.style).flexDirection).toBe(
      GAME_SETUP_LAYOUT.rowDirection,
    );
  });

  it("keeps the name input compact on the right", async () => {
    const { getByTestId } = await renderSetup();

    const inputStyle = flattenStyle(getByTestId(GAME_SETUP_TEST_IDS.nameInput).props.style);
    expect(inputStyle.width).toBe(GAME_SETUP_LAYOUT.nameInput.width.default);
    expect(inputStyle.maxWidth).toBe(GAME_SETUP_LAYOUT.nameInput.maxWidth);
  });

  it("keeps difficulty chips side-by-side with detail below", async () => {
    const { getByTestId } = await renderSetup({ settings: { aiDifficulty: "hard" } });

    const row = getByTestId(GAME_SETUP_TEST_IDS.difficultyRow);
    expect(flattenStyle(row.props.style).flexDirection).toBe(GAME_SETUP_LAYOUT.difficultyDirection);

    for (const d of GAME_SETUP_DIFFICULTIES) {
      expect(within(row).getByText(d.label)).toBeTruthy();
    }

    expect(getByTestId(GAME_SETUP_TEST_IDS.difficultyDesc)).toHaveTextContent(
      "Strategic bluffing and near-optimal play.",
    );
  });

  it("places Tutorial left of Start Game", async () => {
    const { getByTestId } = await renderSetup();

    const actions = getByTestId(GAME_SETUP_TEST_IDS.actionsRow);
    const buttons = within(actions).getAllByRole("button");
    expect(buttons).toHaveLength(2);
    expect(buttons[0]).toHaveTextContent(GAME_SETUP_LAYOUT.actionsOrder[0]);
    expect(buttons[1]).toHaveTextContent(GAME_SETUP_LAYOUT.actionsOrder[1]);
  });

  it("uses the dense max width only on density 2", async () => {
    const { getByTestId, rerender } = await renderSetup({ density: 0 });
    expect(flattenStyle(getByTestId(GAME_SETUP_TEST_IDS.root).props.style).maxWidth).toBe(475);

    await rerender(
      <ThemeProvider>
        <GameSetup
          settings={baseSettings}
          onUpdateSettings={jest.fn()}
          onStart={jest.fn()}
          onStartTutorial={jest.fn()}
          density={2}
        />
      </ThemeProvider>,
    );

    expect(flattenStyle(getByTestId(GAME_SETUP_TEST_IDS.root).props.style).maxWidth).toBe(400);
  });

  it("hides optional-rule hints on density 2 but keeps the switches", async () => {
    const { getByText, queryByText, getAllByRole } = await renderSetup({ density: 2 });

    expect(queryByText("Exact-count bonus die")).toBeNull();
    expect(queryByText("Special round at 1 die")).toBeNull();
    expect(getByText("Spot On")).toBeTruthy();
    expect(getByText("Palifico Rounds")).toBeTruthy();
    expect(getAllByRole("switch")).toHaveLength(2);
  });

  it("wires name, player count, difficulty, and CTAs", async () => {
    const { getByTestId, getByText, onUpdateSettings, onStart, onStartTutorial } = await renderSetup();

    fireEvent.changeText(getByTestId(GAME_SETUP_TEST_IDS.nameInput), "Captain");
    expect(onUpdateSettings).toHaveBeenCalledWith({ playerName: "Captain" });

    fireEvent.press(getByText("+"));
    expect(onUpdateSettings).toHaveBeenCalledWith({ playerCount: 5 });

    fireEvent.press(getByText("Hard"));
    expect(onUpdateSettings).toHaveBeenCalledWith({ aiDifficulty: "hard" });

    fireEvent.press(getByText("Tutorial"));
    expect(onStartTutorial).toHaveBeenCalledTimes(1);

    fireEvent.press(getByText("Start Game"));
    expect(onStart).toHaveBeenCalledTimes(1);
  });
});
