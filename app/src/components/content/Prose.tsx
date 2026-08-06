import React from "react";
import { Text, View } from "react-native";
import { headingProps } from "../../lib/heading";
import { useTheme } from "../../theme/ThemeProvider";

export function Section({ title, children }: { title: string; children: React.ReactNode }) {
  const { colors, spacing, typography } = useTheme();
  return (
    <View style={{ gap: spacing.sm }}>
      <Text {...headingProps(2)} style={{ color: colors.textPrimary, fontFamily: typography.h2.fontFamily, fontSize: 24 }}>
        {title}
      </Text>
      {children}
    </View>
  );
}

export function SubSection({ title, children }: { title: string; children: React.ReactNode }) {
  const { colors, spacing, typography } = useTheme();
  return (
    <View style={{ gap: spacing.xs, marginTop: spacing.sm }}>
      <Text {...headingProps(3)} style={{ color: colors.textPrimary, fontFamily: typography.h3.fontFamily, fontSize: 18 }}>
        {title}
      </Text>
      {children}
    </View>
  );
}

export function Paragraph({ children }: { children: React.ReactNode }) {
  const { colors, typography } = useTheme();
  return (
    <Text style={{ color: colors.textSecondary, fontFamily: typography.body.fontFamily, fontSize: 16, lineHeight: 25 }}>{children}</Text>
  );
}

export function BulletList({ items }: { items: React.ReactNode[] }) {
  const { colors, spacing, typography } = useTheme();
  return (
    <View style={{ gap: 6 }}>
      {items.map((item, i) => (
        <View key={i} className="flex-row" style={{ gap: spacing.xs }}>
          <Text style={{ color: colors.accent, fontFamily: typography.body.fontFamily, fontSize: 16, lineHeight: 25 }}>&bull;</Text>
          <Text style={{ flex: 1, color: colors.textSecondary, fontFamily: typography.body.fontFamily, fontSize: 16, lineHeight: 25 }}>
            {item}
          </Text>
        </View>
      ))}
    </View>
  );
}

export function NumberedList({ items }: { items: React.ReactNode[] }) {
  const { colors, spacing, typography } = useTheme();
  return (
    <View style={{ gap: spacing.sm }}>
      {items.map((item, i) => (
        <View key={i} className="flex-row" style={{ gap: spacing.sm }}>
          <Text style={{ color: colors.accent, fontFamily: typography.bodySemibold.fontFamily, fontSize: 16, lineHeight: 25 }}>
            {i + 1}.
          </Text>
          <Text style={{ flex: 1, color: colors.textSecondary, fontFamily: typography.body.fontFamily, fontSize: 16, lineHeight: 25 }}>
            {item}
          </Text>
        </View>
      ))}
    </View>
  );
}

export function Quote({ children }: { children: React.ReactNode }) {
  const { colors, spacing, typography } = useTheme();
  return (
    <View style={{ borderLeftWidth: 3, borderLeftColor: colors.accent, paddingLeft: spacing.md }}>
      <Text style={{ color: colors.textSecondary, fontFamily: typography.body.fontFamily, fontSize: 16, lineHeight: 25, fontStyle: "italic" }}>
        {children}
      </Text>
    </View>
  );
}

export function Callout({ children }: { children: React.ReactNode }) {
  const { colors, radii, spacing, typography } = useTheme();
  return (
    <View style={{ backgroundColor: colors.surfaceRaised, borderRadius: radii.md, padding: spacing.md }}>
      <Text style={{ color: colors.textSecondary, fontFamily: typography.body.fontFamily, fontSize: 15, lineHeight: 23 }}>{children}</Text>
    </View>
  );
}
