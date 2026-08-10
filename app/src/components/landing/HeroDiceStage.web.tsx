/**
 * Web hero dice — keep Three.js / WebGL out of the landing critical path.
 * The module (and `three`) only download after the browser is idle.
 */
import React, { useEffect, useState, type ComponentType } from "react";
import { View } from "react-native";
import type { ScatteredDieConfig } from "./AnimatedDice";
import type { DiceTableConfig } from "./DicePlatform";

type DiceStageProps = {
  dice: ScatteredDieConfig[];
  pipColor?: string;
  width?: number;
  height?: number;
  table?: DiceTableConfig;
  verticalOffset?: number;
};

type DiceStageComponent = ComponentType<DiceStageProps>;

/** Wrapper so we never store a bare function component in useState (React/TS footgun). */
type StageState = { Comp: DiceStageComponent };

function scheduleIdle(cb: () => void): () => void {
  const w = window as Window & {
    requestIdleCallback?: (fn: () => void, opts?: { timeout: number }) => number;
    cancelIdleCallback?: (id: number) => void;
  };
  if (typeof w.requestIdleCallback === "function") {
    const id = w.requestIdleCallback(cb, { timeout: 1500 });
    return () => w.cancelIdleCallback?.(id);
  }
  const id = window.setTimeout(cb, 200);
  return () => window.clearTimeout(id);
}

export function HeroDiceStage(props: DiceStageProps) {
  const [stage, setStage] = useState<StageState | null>(null);

  useEffect(() => {
    let cancelled = false;
    const cancelIdle = scheduleIdle(() => {
      void import("./CssDice3D").then((m) => {
        if (!cancelled) setStage({ Comp: m.ScatteredCssDice });
      });
    });
    return () => {
      cancelled = true;
      cancelIdle();
    };
  }, []);

  if (!stage) {
    return <View style={{ width: props.width, height: props.height }} />;
  }
  const { Comp } = stage;
  return <Comp {...props} />;
}
