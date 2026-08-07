import AsyncStorage from "@react-native-async-storage/async-storage";
import { act, renderHook, waitFor } from "@testing-library/react-native";
import React from "react";
import { resolveIsDark, THEME_STORAGE_KEY, ThemeProvider, useTheme } from "../ThemeProvider";

function wrapper({ children }: { children: React.ReactNode }) {
  return <ThemeProvider>{children}</ThemeProvider>;
}

describe("resolveIsDark", () => {
  it("resolves explicit and system modes", () => {
    expect(resolveIsDark("light", "dark")).toBe(false);
    expect(resolveIsDark("dark", "light")).toBe(true);
    expect(resolveIsDark("system", "dark")).toBe(true);
    expect(resolveIsDark("system", "light")).toBe(false);
  });
});

describe("ThemeProvider", () => {
  beforeEach(async () => {
    await AsyncStorage.clear();
  });

  it("applies a stored dark preference after mount", async () => {
    await AsyncStorage.setItem(THEME_STORAGE_KEY, "dark");
    const { result } = await renderHook(() => useTheme(), { wrapper });

    await waitFor(() => {
      expect(result.current.themeMode).toBe("dark");
      expect(result.current.isDark).toBe(true);
    });
  });

  it("keeps a saved light preference after storage loads", async () => {
    await AsyncStorage.setItem(THEME_STORAGE_KEY, "light");
    const { result } = await renderHook(() => useTheme(), { wrapper });

    await waitFor(() => {
      expect(result.current.themeMode).toBe("light");
      expect(result.current.isDark).toBe(false);
    });
  });

  it("toggles between light and dark and persists the choice", async () => {
    const { result } = await renderHook(() => useTheme(), { wrapper });

    await waitFor(() => {
      expect(result.current.themeMode).toBe("system");
    });

    const wasDark = result.current.isDark;

    await act(async () => {
      result.current.toggleTheme();
    });

    expect(result.current.isDark).toBe(!wasDark);
    expect(result.current.themeMode).toBe(wasDark ? "light" : "dark");
    await expect(AsyncStorage.getItem(THEME_STORAGE_KEY)).resolves.toBe(wasDark ? "light" : "dark");

    await act(async () => {
      result.current.toggleTheme();
    });

    expect(result.current.isDark).toBe(wasDark);
    expect(result.current.themeMode).toBe(wasDark ? "dark" : "light");
  });

  it("throws when useTheme is used outside a provider", async () => {
    await expect(async () => {
      await renderHook(() => useTheme());
    }).rejects.toThrow("useTheme must be used within a ThemeProvider");
  });
});
