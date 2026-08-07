import { Link } from "expo-router";
import React from "react";
import { Text, View, useWindowDimensions } from "react-native";
import { headingProps } from "../../lib/heading";
import { isCompactWidth } from "../../lib/breakpoints";
import { useTheme } from "../../theme/ThemeProvider";
import { Button } from "../ui/Button";

export function CTABanner() {
  const { colors, spacing, typography } = useTheme();
  const { width } = useWindowDimensions();
  const isNarrow = isCompactWidth(width);

  return (
    <View style={{ backgroundColor: colors.background, paddingBottom: spacing.xl }}>
      <View
        style={{
          backgroundColor: colors.textPrimary,
          borderRadius: 32,
          marginHorizontal: isNarrow ? 20 : 64,
          marginTop: 8,
          padding: isNarrow ? 32 : 56,
          alignItems: "center",
        }}
      >
        <Text
          {...headingProps(2)}
          style={{
            color: colors.background,
            fontFamily: typography.h1.fontFamily,
            fontSize: isNarrow ? 31 : 38,
            textAlign: "center",
          }}
        >
          Ready to call someone&apos;s bluff?
        </Text>
        <Text
          style={{
            color: colors.background,
            opacity: 0.72,
            fontFamily: typography.body.fontFamily,
            fontSize: typography.body.fontSize,
            textAlign: "center",
            marginTop: spacing.sm,
            marginBottom: spacing.lg,
            maxWidth: 440,
          }}
        >
          Jump into a free game right now — no account needed.
        </Text>
        <Link href="/play" asChild>
          <Button label="Play now" variant="primary" />
        </Link>
      </View>
    </View>
  );
}
