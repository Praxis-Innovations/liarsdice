import AsyncStorage from "@react-native-async-storage/async-storage";
import { cleanup, fireEvent, render, waitFor } from "@testing-library/react-native";
import React from "react";
import { ThemeProvider } from "../../../theme/ThemeProvider";
import { PlayTopBar } from "../PlayTopBar";
import { makeGameState } from "../testing/gameTestFixtures";

beforeEach(async () => {
  await AsyncStorage.clear();
});

afterEach(() => {
  cleanup();
});

async function renderBar(
  overrides: Partial<{
    compact: boolean;
    tutorialMode: boolean;
    showHints: boolean;
  }> = {},
) {
  const onBack = jest.fn();
  const onToggleHints = jest.fn();
  const view = await render(
    <ThemeProvider>
      <PlayTopBar
        state={makeGameState({ roundNumber: 2 })}
        phase="playing"
        dense={false}
        compact={overrides.compact ?? false}
        tutorialMode={overrides.tutorialMode ?? false}
        showHints={overrides.showHints ?? false}
        onBack={onBack}
        onToggleHints={onToggleHints}
      />
    </ThemeProvider>,
  );
  await waitFor(() => expect(view.getByText("Round 2")).toBeTruthy());
  return Object.assign(view, { onBack, onToggleHints });
}

describe("PlayTopBar", () => {
  // Render-only cases first — icon Pressables leave overlapping act() after presses.
  it("shows round and dice chips plus new-game back control", async () => {
    const view = await renderBar();
    expect(view.getByText("Round 2")).toBeTruthy();
    expect(view.getByText("10 dice")).toBeTruthy();
    expect(view.getByLabelText("New game")).toBeTruthy();
    expect(view.getByLabelText("Enable hints")).toBeTruthy();
    expect(view.queryByLabelText("Mute sound")).toBeNull();
    expect(view.queryByLabelText("Enable sound")).toBeNull();
  });

  it("hides hint toggle in tutorial and labels exit", async () => {
    const view = await renderBar({ tutorialMode: true });
    expect(view.getByLabelText("Exit tutorial")).toBeTruthy();
    expect(view.queryByLabelText("Enable hints")).toBeNull();
  });

  it("still shows status badges on compact (phone) layout", async () => {
    const view = await renderBar({ compact: true });
    expect(view.getByText("Your turn")).toBeTruthy();
    expect(view.getByText("Aces wild")).toBeTruthy();
  });

  it("invokes back and hints toggles", async () => {
    const view = await renderBar({ showHints: true });
    fireEvent.press(view.getByLabelText("New game"));
    fireEvent.press(view.getByLabelText("Disable hints"));
    expect(view.onBack).toHaveBeenCalledTimes(1);
    expect(view.onToggleHints).toHaveBeenCalledTimes(1);
  });
});
