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
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from "react-native-reanimated";
import { useTheme } from "../../theme/ThemeProvider";

type Variant = "primary" | "secondary" | "ghost" | "danger";

type ButtonProps = Omit<PressableProps, "children" | "style"> & {
  label: string;
  variant?: Variant;
  fullWidth?: boolean;
  loading?: boolean;
  /** Smaller padding/type for the play dock. */
  compact?: boolean;
  /**
   * Override label size. Play/setup keep pre-scale 16 when not compact;
   * omit to use site typography.button (enlarged for marketing/content/auth).
   */
  labelFontSize?: number;
  /** Optional leading icon (caller colors it to match the variant). */
  icon?: React.ReactNode;
  style?: StyleProp<ViewStyle>;
};

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

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
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const variantStyle = {
    primary: { backgroundColor: colors.primary, textColor: colors.primaryText, borderColor: "transparent" },
    secondary: { backgroundColor: colors.secondary, textColor: colors.secondaryText, borderColor: "transparent" },
    ghost: { backgroundColor: "transparent", textColor: colors.textPrimary, borderColor: colors.border },
    danger: { backgroundColor: "transparent", textColor: colors.danger, borderColor: colors.danger },
  }[variant];

  return (
    <AnimatedPressable
      {...pressableProps}
      accessibilityRole="button"
      disabled={disabled || loading}
      onPressIn={() => {
        scale.value = withTiming(0.96, { duration: 100 });
      }}
      onPressOut={() => {
        scale.value = withTiming(1, { duration: 150 });
      }}
      style={[
        animatedStyle,
        {
          backgroundColor: variantStyle.backgroundColor,
          borderColor: variantStyle.borderColor,
          borderWidth: variant === "ghost" || variant === "danger" ? 2 : 0,
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
    </AnimatedPressable>
  );
}
