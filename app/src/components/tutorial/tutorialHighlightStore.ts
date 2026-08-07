import { create } from "zustand";
import type { MeasuredRect } from "./tutorialTypes";

/** Window-space highlight rects for the full-screen tutorial overlay. */
type TutorialHighlightStore = {
  measurements: Record<string, MeasuredRect>;
  setMeasurements: (measurements: Record<string, MeasuredRect>) => void;
  clearMeasurements: () => void;
};

export const useTutorialHighlightStore = create<TutorialHighlightStore>((set) => ({
  measurements: {},
  setMeasurements: (measurements) => set({ measurements }),
  clearMeasurements: () => set({ measurements: {} }),
}));
