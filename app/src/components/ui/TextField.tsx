import React from "react";
import { TextInput, type TextInputProps, type StyleProp, type TextStyle } from "react-native";
import { useTheme } from "../../theme/ThemeProvider";

type TextFieldProps = TextInputProps & {
  /** Shorter vertical padding for dense forms. */
  compact?: boolean;
};

export function TextField({ compact, style, ...props }: TextFieldProps) {
  const { colors, radii, spacing, typography } = useTheme();

  return (
    <TextInput
      placeholderTextColor={colors.textSecondary}
      style={[
        {
          borderWidth: 2,
          borderColor: colors.border,
          borderRadius: compact ? radii.sm : radii.md,
          paddingHorizontal: compact ? spacing.sm + 2 : spacing.md,
          paddingVertical: compact ? 8 : spacing.md,
          fontSize: compact ? 14 : typography.body.fontSize,
          fontFamily: typography.body.fontFamily,
          color: colors.textPrimary,
          backgroundColor: colors.surface,
        },
        style as StyleProp<TextStyle>,
      ]}
      {...props}
    />
  );
}
