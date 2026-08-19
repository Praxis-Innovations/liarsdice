import React from "react";
import { Text, View } from "react-native";
import { useAuth } from "../../src/context/AuthContext";
import { headingProps } from "../../src/lib/heading";
import { useTheme } from "../../src/theme/ThemeProvider";

export default function HomeScreen() {
  const { colors, spacing, typography } = useTheme();
  const { user } = useAuth();
  const display_name = user?.email || "there";

  return (
    <View style={{ flex: 1, backgroundColor: colors.background, padding: spacing.lg, gap: spacing.sm }}>
      <Text
        {...headingProps(1)}
        style={{ fontFamily: typography.h2.fontFamily, fontSize: typography.h2.fontSize, color: colors.textPrimary }}
      >
        Welcome, {display_name}
      </Text>
      <Text style={{ fontFamily: typography.body.fontFamily, fontSize: 19, color: colors.textSecondary }}>
        This is the Home tab — replace with your app&apos;s actual content.
      </Text>
    </View>
  );
}
