import React from "react";
import { ActivityIndicator, Pressable, Text, type PressableProps, type StyleProp, type ViewStyle } from "react-native";
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from "react-native-reanimated";
import { useTheme } from "../../theme/ThemeProvider";

type Variant = "primary" | "secondary" | "ghost";

type ButtonProps = Omit<PressableProps, "children" | "style"> & {
  label: string;
  variant?: Variant;
  fullWidth?: boolean;
  loading?: boolean;
  style?: StyleProp<ViewStyle>;
};

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export function Button({
  label,
  variant = "primary",
  fullWidth,
  loading,
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
          borderWidth: variant === "ghost" ? 2 : 0,
          borderRadius: radii.pill,
          paddingVertical: spacing.md,
          paddingHorizontal: spacing.xl,
          alignItems: "center",
          justifyContent: "center",
          alignSelf: fullWidth ? "stretch" : "auto",
          opacity: disabled ? 0.5 : 1,
        },
        externalStyle,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={variantStyle.textColor} />
      ) : (
        <Text
          style={{
            color: variantStyle.textColor,
            fontFamily: typography.button.fontFamily,
            fontSize: typography.button.fontSize,
          }}
        >
          {label}
        </Text>
      )}
    </AnimatedPressable>
  );
}
