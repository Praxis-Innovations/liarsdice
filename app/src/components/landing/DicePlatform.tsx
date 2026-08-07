import React from "react";
import { View } from "react-native";
import { useTheme } from "../../theme/ThemeProvider";

export type {
  Breakpoint,
  DiceTableConfig,
  PlatformMetrics,
} from "./dicePlatformLayout";
export {
  getBreakpoint,
  getDiceBand,
  getPlatformMetrics,
  placeDiceOnPlatform,
} from "./dicePlatformLayout";

/** Visual table / tray the dice land on (native fallback; web uses Three.js halo). */
export function DicePlatform({
  left,
  top,
  width,
  height,
}: {
  left: number;
  top: number;
  width: number;
  height: number;
}) {
  const { colors, isDark } = useTheme();

  return (
    <View
      pointerEvents="none"
      style={{
        position: "absolute",
        left,
        top,
        width,
        height,
        zIndex: 1,
      }}
    >
      {/* Soft ground shadow under the platform */}
      <View
        style={{
          position: "absolute",
          left: width * 0.1,
          right: width * 0.1,
          bottom: -14,
          height: 22,
          borderRadius: 999,
          backgroundColor: "#1C1730",
          opacity: isDark ? 0.35 : 0.12,
        }}
      />

      {/* Lower front face: creates visible platform thickness */}
      <View
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          top: height * 0.18,
          bottom: 0,
          borderRadius: Math.min(28, height * 0.45),
          backgroundColor: isDark ? colors.surface : colors.border,
          borderWidth: 1,
          borderColor: colors.border,
          overflow: "hidden",
        }}
      />

      {/* Raised top surface: slight perspective makes the tray feel dimensional */}
      <View
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          top: 0,
          height: height * 0.42,
          borderRadius: Math.min(28, height * 0.45),
          backgroundColor: isDark ? colors.surfaceRaised : colors.surfaceRaised,
          borderWidth: 1,
          borderColor: colors.border,
          overflow: "hidden",
          transform: [{ perspective: 600 }, { rotateX: "8deg" }],
          shadowColor: "#1C1730",
          shadowOpacity: isDark ? 0.4 : 0.12,
          shadowRadius: 10,
          shadowOffset: { width: 0, height: 7 },
        }}
      >
        <View
          style={{
            height: 3,
            backgroundColor: colors.accent,
            opacity: 0.9,
          }}
        />
        <View
          style={{
            position: "absolute",
            top: 10,
            left: width * 0.08,
            right: width * 0.08,
            height: 1,
            backgroundColor: isDark ? colors.textPrimary : "#FFFFFF",
            opacity: isDark ? 0.08 : 0.55,
          }}
        />
      </View>
    </View>
  );
}
