import React from "react";
import { ScrollView, Text, View } from "react-native";
import { headingProps } from "../../lib/heading";
import { useTheme } from "../../theme/ThemeProvider";

export function AuthCard({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}) {
  const { colors, spacing, typography } = useTheme();

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: colors.background }}
      contentContainerStyle={{ flexGrow: 1, alignItems: "center", justifyContent: "center", padding: spacing.lg }}
    >
      <View
        style={{
          width: "100%",
          maxWidth: 420,
          backgroundColor: colors.surfaceRaised,
          borderRadius: 32,
          padding: spacing.xl,
          gap: spacing.md,
        }}
      >
        <Text
          {...headingProps(1)}
          style={{
            color: colors.textPrimary,
            fontFamily: typography.h1.fontFamily,
            fontSize: 30,
          }}
        >
          {title}
        </Text>
        {subtitle ? (
          <Text
            style={{
              color: colors.textSecondary,
              fontFamily: typography.body.fontFamily,
              fontSize: 15,
              lineHeight: 22,
              marginTop: -spacing.sm,
            }}
          >
            {subtitle}
          </Text>
        ) : null}
        {children}
      </View>
    </ScrollView>
  );
}
