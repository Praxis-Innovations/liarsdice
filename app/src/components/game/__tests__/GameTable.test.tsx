import AsyncStorage from "@react-native-async-storage/async-storage";
import { fireEvent, render, waitFor } from "@testing-library/react-native";
import React from "react";
import { Text } from "react-native";
import { ThemeProvider } from "../../../theme/ThemeProvider";
import { GameTable } from "../GameTable";
import { makePlayer } from "../testing/gameTestFixtures";

jest.mock("moti", () => {
  const { View } = require("react-native");
  return {
    MotiView: ({ children, ...props }: { children?: React.ReactNode }) => (
      <View {...props}>{children}</View>
    ),
  };
});

beforeEach(async () => {
  await AsyncStorage.clear();
});

const players = [
  makePlayer({ id: "human", name: "You", isAI: false }),
  makePlayer({ id: "ai-1", name: "Silver Fox", isAI: true, aiDifficulty: "easy" }),
  makePlayer({ id: "ai-2", name: "Captain Drake", isAI: true, aiDifficulty: "easy" }),
];

async function renderTable(
  overrides: Partial<React.ComponentProps<typeof GameTable>> = {},
) {
  const view = await render(
    <ThemeProvider>
      <GameTable
        players={players}
        currentPlayerId="human"
        showDice={false}
        onesWild
        sizeTier="compact"
        {...overrides}
      />
    </ThemeProvider>,
  );
  await waitFor(() => expect(view.getByTestId("game-table")).toBeTruthy());
  return view;
}

function layoutTable(view: Awaited<ReturnType<typeof renderTable>>, width = 400, height = 320) {
  fireEvent(view.getByTestId("game-table"), "layout", {
    nativeEvent: { layout: { x: 0, y: 0, width, height } },
  });
}

describe("GameTable", () => {
  it("shows a loading placeholder before layout", async () => {
    const view = await renderTable();
    expect(view.getByText("Setting the table…")).toBeTruthy();
  });

  it("seats players after layout and labels the human You", async () => {
    const view = await renderTable();
    layoutTable(view);
    await waitFor(() => expect(view.queryByText("Setting the table…")).toBeNull());
    expect(view.getByText("You")).toBeTruthy();
    expect(view.getByText("Silver Fox")).toBeTruthy();
    expect(view.getByText("Captain Drake")).toBeTruthy();
  });

  it("renders the center slot with measured bounds after layout", async () => {
    const renderCenter = jest.fn(({ maxWidth, maxHeight }: { maxWidth: number; maxHeight: number }) => (
      <Text>{`center:${Math.round(maxWidth)}x${Math.round(maxHeight)}`}</Text>
    ));
    const view = await renderTable({ renderCenter });
    layoutTable(view);
    await waitFor(() => expect(view.getByText(/^center:/)).toBeTruthy());
    expect(renderCenter).toHaveBeenCalled();
    const bounds = renderCenter.mock.calls[0][0] as { maxWidth: number; maxHeight: number };
    expect(bounds.maxWidth).toBeGreaterThan(0);
    expect(bounds.maxHeight).toBeGreaterThan(0);
  });

  it("highlights the current player's seat with an accent border", async () => {
    const view = await renderTable({ currentPlayerId: "ai-1" });
    layoutTable(view);
    await waitFor(() => expect(view.getByText("Silver Fox")).toBeTruthy());
    expect(view.queryByText("TURN")).toBeNull();
  });
});
