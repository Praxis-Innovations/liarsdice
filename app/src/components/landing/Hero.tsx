import { Link } from "expo-router";
import { MotiView } from "moti";
import React from "react";
import { Text, View, useWindowDimensions } from "react-native";
import { headingProps } from "../../lib/heading";
import { useTheme } from "../../theme/ThemeProvider";
import { Button } from "../ui/Button";
import AnimatedDiceGroup from "./AnimatedDice";

export function Hero() {
  const { colors, spacing, typography } = useTheme();
  const { width } = useWindowDimensions();
  const isNarrow = width < 760;

  return (
    <View style={{ backgroundColor: colors.background }} className="relative overflow-hidden px-6 pb-12 pt-16 md:px-16 md:pb-20 md:pt-24">
      <View
        pointerEvents="none"
        style={{
          position: "absolute",
          top: -140,
          right: -120,
          width: 380,
          height: 380,
          borderRadius: 999,
          backgroundColor: colors.primary,
          opacity: 0.14,
        }}
      />
      <View
        pointerEvents="none"
        style={{
          position: "absolute",
          bottom: -160,
          left: -100,
          width: 320,
          height: 320,
          borderRadius: 999,
          backgroundColor: colors.secondary,
          opacity: 0.12,
        }}
      />

      <View
        className={isNarrow ? "items-center" : "flex-row items-center justify-between"}
        style={{ maxWidth: 1120, width: "100%", alignSelf: "center", gap: 48 }}
      >
        <MotiView
          from={{ opacity: 0, translateY: 16 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ type: "timing", duration: 500 }}
          style={{ flex: 1, alignItems: isNarrow ? "center" : "flex-start", maxWidth: 560 }}
        >
          <View
            style={{
              backgroundColor: colors.surface,
              borderRadius: 999,
              paddingHorizontal: spacing.md,
              paddingVertical: spacing.xs,
              marginBottom: spacing.md,
            }}
          >
            <Text
              style={{
                color: colors.accent,
                fontFamily: typography.caption.fontFamily,
                fontSize: typography.caption.fontSize,
                letterSpacing: 1.5,
              }}
            >
              FREE · ONLINE · NO DOWNLOAD
            </Text>
          </View>

          <Text
            {...headingProps(1)}
            style={{
              color: colors.textPrimary,
              fontFamily: typography.display.fontFamily,
              fontSize: isNarrow ? 44 : typography.display.fontSize,
              lineHeight: isNarrow ? 48 : typography.display.lineHeight,
              textAlign: isNarrow ? "center" : "left",
            }}
          >
            Liar&apos;s Dice
          </Text>

          <Text
            style={{
              color: colors.textSecondary,
              fontFamily: typography.body.fontFamily,
              fontSize: 19,
              lineHeight: 28,
              marginTop: spacing.md,
              textAlign: isNarrow ? "center" : "left",
            }}
          >
            Bid boldly. Call the bluff. Trust no one at the table — play free with friends, right in
            your browser.
          </Text>

          <View
            className="flex-row flex-wrap"
            style={{ gap: spacing.md, marginTop: spacing.xl, justifyContent: isNarrow ? "center" : "flex-start" }}
          >
            <Link href="/play" asChild>
              <Button label="Play now — it's free" variant="primary" />
            </Link>
            <Link href="/sign-up" asChild>
              <Button label="Create account" variant="ghost" />
            </Link>
          </View>
        </MotiView>

        <AnimatedDiceGroup
          pipColor="#FFFFFF"
          dice={[
            { face: 3, color: colors.primary, restRotate: "-8deg" },
            { face: 5, color: colors.accent, restRotate: "6deg" },
            { face: 4, color: colors.secondary, restRotate: "-3deg" },
          ]}
        />
      </View>
    </View>
  );
}
