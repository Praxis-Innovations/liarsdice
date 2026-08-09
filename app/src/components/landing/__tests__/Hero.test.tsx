import AsyncStorage from "@react-native-async-storage/async-storage";
import { render, waitFor } from "@testing-library/react-native";
import React from "react";
import { ThemeProvider } from "../../../theme/ThemeProvider";
import { Hero } from "../Hero";

const mockScatteredCssDice = jest.fn((_props: Record<string, unknown>) => null);

jest.mock("../../shared/Header", () => ({
  useHeaderOffset: () => 64,
  HEADER_HEIGHT: 64,
}));

jest.mock("../CssDice3D", () => ({
  ScatteredCssDice: (props: Record<string, unknown>) => mockScatteredCssDice(props),
}));

jest.mock("moti", () => {
  const { View } = require("react-native");
  return {
    MotiView: ({ children, ...props }: { children?: React.ReactNode }) => (
      <View {...props}>{children}</View>
    ),
  };
});

jest.mock("expo-router", () => ({
  Link: ({ children }: { children: React.ReactNode }) => children,
}));

beforeEach(async () => {
  await AsyncStorage.clear();
  jest.clearAllMocks();
});

describe("Hero", () => {
  it("passes a full dice cast on the first render (no empty stage flash)", async () => {
    await render(
      <ThemeProvider>
        <Hero />
      </ThemeProvider>,
    );

    await waitFor(() => expect(mockScatteredCssDice).toHaveBeenCalled());
    const firstCall = mockScatteredCssDice.mock.calls[0]![0] as {
      dice: unknown[];
      width: number;
      height: number;
    };
    expect(firstCall.dice).toHaveLength(6);
    expect(firstCall.width).toBeGreaterThan(0);
    expect(firstCall.height).toBeGreaterThan(0);
  });

  it("renders the primary CTA and H1", async () => {
    const view = await render(
      <ThemeProvider>
        <Hero />
      </ThemeProvider>,
    );
    await waitFor(() => expect(view.getByText("Play now — it's free")).toBeTruthy());
    expect(view.getByRole("heading", { name: "Liar's Dice" })).toBeTruthy();
  });
});
