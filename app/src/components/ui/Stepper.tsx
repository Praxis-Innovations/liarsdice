import React from "react";
import { Pressable, Text } from "react-native";
import { useTheme } from "../../theme/ThemeProvider";

export function StepperButton({
  label,
  disabled,
  onPress,
  compact = false,
}: {
  label: string;
  disabled: boolean;
  onPress: () => void;
  compact?: boolean;
}) {
  const { colors, radii } = useTheme();
  const size = compact ? 28 : 32;
  return (
    <Pressable
      disabled={disabled}
      onPress={onPress}
      style={{
        width: size,
        height: size,
        borderRadius: radii.sm,
        backgroundColor: colors.surface,
        alignItems: "center",
        justifyContent: "center",
        opacity: disabled ? 0.4 : 1,
      }}
    >
      <Text style={{ color: colors.textPrimary, fontSize: compact ? 14 : 16 }}>{label}</Text>
    </Pressable>
  );
}
