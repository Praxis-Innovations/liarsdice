import React from "react";
import {
  ActivityIndicator,
  Pressable,
  Text,
  View,
  type PressableProps,
  type StyleProp,
  type ViewStyle,
} from "react-native";
import { useTheme } from "../../theme/ThemeProvider";

type Variant = "primary" | "secondary" | "ghost" | "danger";

type ButtonProps = Omit<PressableProps, "children" | "style"> & {
  label: string;
  variant?: Variant;
  fullWidth?: boolean;
  loading?: boolean;
  compact?: boolean;
  labelFontSize?: number;
  icon?: React.ReactNode;
  style?: StyleProp<ViewStyle>;
};

/**
 * Web Button — no reanimated. Keeps react-native-reanimated out of the
 * marketing-route critical path (press scale is a native-only nicety).
 */
export function Button({
  label,
  variant = "primary",
  fullWidth,
  loading,
  compact = false,
  labelFontSize,
  icon,
  disabled,
  style: externalStyle,
  ...pressableProps
}: ButtonProps) {
  const { colors, radii, spacing, typography } = useTheme();

  const variantStyle = {
    primary: { backgroundColor: colors.primary, textColor: colors.primaryText, borderColor: "transparent" },
    secondary: { backgroundColor: colors.secondary, textColor: colors.secondaryText, borderColor: "transparent" },
    ghost: { backgroundColor: "transparent", textColor: colors.textPrimary, borderColor: colors.border },
    danger: { backgroundColor: "transparent", textColor: colors.danger, borderColor: colors.danger },
  }[variant];

  return (
    <Pressable
      {...pressableProps}
      accessibilityRole="button"
      disabled={disabled || loading}
      style={[
        {
          backgroundColor: variantStyle.backgroundColor,
          borderColor: variantStyle.borderColor,
          borderWidth: 2,
          borderRadius: radii.pill,
          paddingVertical: compact ? spacing.sm : spacing.md,
          paddingHorizontal: compact ? spacing.md : spacing.xl,
          alignItems: "center",
          justifyContent: "center",
          alignSelf: fullWidth ? "stretch" : "auto",
          opacity: disabled ? 0.45 : 1,
        },
        externalStyle,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={variantStyle.textColor} />
      ) : (
        <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
          {icon}
          <Text
            style={{
              color: variantStyle.textColor,
              fontFamily: typography.button.fontFamily,
              fontSize: compact ? 14 : (labelFontSize ?? typography.button.fontSize),
            }}
          >
            {label}
          </Text>
        </View>
      )}
    </Pressable>
  );
}
