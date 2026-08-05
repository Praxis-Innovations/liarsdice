import React from "react";
import { TextInput, type TextInputProps } from "react-native";
import { useTheme } from "../../theme/ThemeProvider";

export function TextField(props: TextInputProps) {
  const { colors, radii, spacing, typography } = useTheme();

  return (
    <TextInput
      placeholderTextColor={colors.textSecondary}
      style={{
        borderWidth: 2,
        borderColor: colors.border,
        borderRadius: radii.md,
        padding: spacing.md,
        fontSize: 16,
        fontFamily: typography.body.fontFamily,
        color: colors.textPrimary,
        backgroundColor: colors.surface,
      }}
      {...props}
    />
  );
}
