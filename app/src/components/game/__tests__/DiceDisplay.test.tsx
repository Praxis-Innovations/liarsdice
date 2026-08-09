import AsyncStorage from "@react-native-async-storage/async-storage";
import { render, waitFor } from "@testing-library/react-native";
import React from "react";
import { ThemeProvider } from "../../../theme/ThemeProvider";
import { DiceRow } from "../DiceDisplay";

jest.mock("moti", () => {
  const { View } = require("react-native");
  return {
    MotiView: ({
      children,
      ...props
    }: {
      children?: React.ReactNode;
      accessibilityLabel?: string;
      [key: string]: unknown;
    }) => (
      <View testID="moti-die" accessibilityLabel={props.accessibilityLabel} {...props}>
        {children}
      </View>
    ),
  };
});

beforeEach(async () => {
  await AsyncStorage.clear();
});

describe("DiceRow", () => {
  it("renders one labeled die per face", async () => {
    const view = await render(
      <ThemeProvider>
        <DiceRow dice={[1, 2, 3, 4, 5]} />
      </ThemeProvider>,
    );
    await waitFor(() => expect(view.getByLabelText("Dice row (5)")).toBeTruthy());
    for (const face of [1, 2, 3, 4, 5]) {
      expect(view.getByLabelText(`Die face ${face}`)).toBeTruthy();
    }
  });

  it("keeps hidden die slots labeled as cups", async () => {
    const view = await render(
      <ThemeProvider>
        <DiceRow dice={[6, 6, 6]} hidden />
      </ThemeProvider>,
    );
    await waitFor(() => expect(view.getByLabelText("Dice row (3)")).toBeTruthy());
    expect(view.getAllByLabelText("Hidden die")).toHaveLength(3);
  });

  it("still exposes face labels when sized from seating", async () => {
    const view = await render(
      <ThemeProvider>
        <DiceRow dice={[1, 2]} dieSizePx={14} tight bare />
      </ThemeProvider>,
    );
    await waitFor(() => expect(view.getByLabelText("Dice row (2)")).toBeTruthy());
    expect(view.getByLabelText("Die face 1")).toBeTruthy();
    expect(view.getByLabelText("Die face 2")).toBeTruthy();
  });

  it("keeps face labels while highlighting matches", async () => {
    const view = await render(
      <ThemeProvider>
        <DiceRow dice={[3, 1, 5]} highlightValues={[3]} wildValue />
      </ThemeProvider>,
    );
    await waitFor(() => expect(view.getByLabelText("Dice row (3)")).toBeTruthy());
    expect(view.getByLabelText("Die face 3")).toBeTruthy();
    expect(view.getByLabelText("Die face 1")).toBeTruthy();
    expect(view.getByLabelText("Die face 5")).toBeTruthy();
  });

  it("still exposes final face labels while shuffling", async () => {
    const view = await render(
      <ThemeProvider>
        <DiceRow dice={[2, 4]} shuffling />
      </ThemeProvider>,
    );
    await waitFor(() => expect(view.getByLabelText("Dice row (2)")).toBeTruthy());
    expect(view.getByLabelText("Die face 2")).toBeTruthy();
    expect(view.getByLabelText("Die face 4")).toBeTruthy();
  });

  it("does not loop Moti shuffle animation on hidden cups", async () => {
    const view = await render(
      <ThemeProvider>
        <DiceRow dice={[6, 6]} hidden shuffling />
      </ThemeProvider>,
    );
    await waitFor(() => expect(view.getAllByLabelText("Hidden die")).toHaveLength(2));
    const slots = view.getAllByTestId("moti-die");
    for (const slot of slots) {
      expect(slot.props.animate).toEqual(
        expect.objectContaining({ rotate: "0deg", scale: 1, translateY: 0 }),
      );
      expect(slot.props.transition?.loop).toBeFalsy();
    }
  });
});
