import { Link } from "expo-router";
import React from "react";
import { Text, View, useWindowDimensions } from "react-native";
import { headingProps } from "../../lib/heading";
import { useTheme } from "../../theme/ThemeProvider";
import { Button } from "../ui/Button";

export function CTAFooter() {
  const { colors, spacing, typography } = useTheme();
  const { width } = useWindowDimensions();
  const isNarrow = width < 760;

  return (
    <View style={{ backgroundColor: colors.background }}>
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
            fontSize: isNarrow ? 28 : 34,
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
            fontSize: 16,
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

      <View
        className="flex-row flex-wrap items-center justify-between"
        style={{ maxWidth: 1120, width: "100%", alignSelf: "center", padding: spacing.lg, gap: spacing.sm }}
      >
        <Text style={{ color: colors.textSecondary, fontFamily: typography.caption.fontFamily, fontSize: 13 }}>
          © {new Date().getFullYear()} Liar&apos;s Dice
        </Text>
        <View className="flex-row flex-wrap" style={{ gap: spacing.lg }}>
          <Link href="/play" style={{ color: colors.textSecondary, fontFamily: typography.caption.fontFamily, fontSize: 13 }}>
            Play
          </Link>
          <Link href="/how-to-play" style={{ color: colors.textSecondary, fontFamily: typography.caption.fontFamily, fontSize: 13 }}>
            How to Play
          </Link>
          <Link href="/rules" style={{ color: colors.textSecondary, fontFamily: typography.caption.fontFamily, fontSize: 13 }}>
            Rules
          </Link>
          <Link href="/sign-in" style={{ color: colors.textSecondary, fontFamily: typography.caption.fontFamily, fontSize: 13 }}>
            Sign in
          </Link>
          <Link href="/sign-up" style={{ color: colors.textSecondary, fontFamily: typography.caption.fontFamily, fontSize: 13 }}>
            Create account
          </Link>
        </View>
      </View>
    </View>
  );
}
