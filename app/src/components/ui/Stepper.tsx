import React from "react";
import { Pressable, Text } from "react-native";
import { useTheme } from "../../theme/ThemeProvider";

export function StepperButton({ label, disabled, onPress }: { label: string; disabled: boolean; onPress: () => void }) {
  const { colors, radii } = useTheme();
  return (
    <Pressable
      disabled={disabled}
      onPress={onPress}
      style={{
        width: 32,
        height: 32,
        borderRadius: radii.sm,
        backgroundColor: colors.surface,
        alignItems: "center",
        justifyContent: "center",
        opacity: disabled ? 0.4 : 1,
      }}
    >
      <Text style={{ color: colors.textPrimary, fontSize: 16 }}>{label}</Text>
    </Pressable>
  );
}
