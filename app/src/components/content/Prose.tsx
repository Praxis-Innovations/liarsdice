import React from "react";
import { Text, View } from "react-native";
import { headingProps } from "../../lib/heading";
import { useTheme } from "../../theme/ThemeProvider";

export function Section({ title, children }: { title: string; children: React.ReactNode }) {
  const { colors, spacing, typography } = useTheme();
  return (
    <View style={{ gap: spacing.sm }}>
      <Text
        {...headingProps(2)}
        style={{
          color: colors.textPrimary,
          fontFamily: typography.h2.fontFamily,
          fontSize: typography.h2.fontSize,
          lineHeight: typography.h2.lineHeight,
        }}
      >
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
      <Text
        {...headingProps(3)}
        style={{
          color: colors.textPrimary,
          fontFamily: typography.h3.fontFamily,
          fontSize: typography.h3.fontSize,
          lineHeight: typography.h3.lineHeight,
        }}
      >
        {title}
      </Text>
      {children}
    </View>
  );
}

export function Paragraph({ children }: { children: React.ReactNode }) {
  const { colors, typography } = useTheme();
  return (
    <Text
      style={{
        color: colors.textSecondary,
        fontFamily: typography.body.fontFamily,
        fontSize: typography.body.fontSize,
        lineHeight: typography.body.lineHeight,
      }}
    >
      {children}
    </Text>
  );
}

export function BulletList({ items }: { items: React.ReactNode[] }) {
  const { colors, spacing, typography } = useTheme();
  return (
    <View style={{ gap: 6 }}>
      {items.map((item, i) => (
        <View key={i} className="flex-row" style={{ gap: spacing.xs }}>
          <Text
            style={{
              color: colors.accent,
              fontFamily: typography.body.fontFamily,
              fontSize: typography.body.fontSize,
              lineHeight: typography.body.lineHeight,
            }}
          >
            &bull;
          </Text>
          <Text
            style={{
              flex: 1,
              color: colors.textSecondary,
              fontFamily: typography.body.fontFamily,
              fontSize: typography.body.fontSize,
              lineHeight: typography.body.lineHeight,
            }}
          >
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
          <Text
            style={{
              color: colors.accent,
              fontFamily: typography.bodySemibold.fontFamily,
              fontSize: typography.body.fontSize,
              lineHeight: typography.body.lineHeight,
            }}
          >
            {i + 1}.
          </Text>
          <Text
            style={{
              flex: 1,
              color: colors.textSecondary,
              fontFamily: typography.body.fontFamily,
              fontSize: typography.body.fontSize,
              lineHeight: typography.body.lineHeight,
            }}
          >
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
      <Text
        style={{
          color: colors.textSecondary,
          fontFamily: typography.body.fontFamily,
          fontSize: typography.body.fontSize,
          lineHeight: typography.body.lineHeight,
          fontStyle: "italic",
        }}
      >
        {children}
      </Text>
    </View>
  );
}

export function Callout({ children }: { children: React.ReactNode }) {
  const { colors, radii, spacing, typography } = useTheme();
  return (
    <View style={{ backgroundColor: colors.surfaceRaised, borderRadius: radii.md, padding: spacing.md }}>
      <Text
        style={{
          color: colors.textSecondary,
          fontFamily: typography.body.fontFamily,
          fontSize: typography.body.fontSize,
          lineHeight: typography.body.lineHeight,
        }}
      >
        {children}
      </Text>
    </View>
  );
}

/** Non-interactive Q&A block — question as H3, answer as body. */
export function FaqItem({
  question,
  children,
  showDivider = true,
}: {
  question: string;
  children: React.ReactNode;
  showDivider?: boolean;
}) {
  const { colors, spacing, typography } = useTheme();
  return (
    <View
      style={{
        gap: spacing.sm + spacing.xs,
        paddingVertical: spacing.md,
        borderBottomWidth: showDivider ? 1 : 0,
        borderBottomColor: colors.border,
      }}
    >
      <Text
        {...headingProps(3)}
        style={{
          color: colors.textPrimary,
          fontFamily: typography.h3.fontFamily,
          fontSize: typography.h3.fontSize,
          lineHeight: typography.h3.lineHeight,
        }}
      >
        {question}
      </Text>
      <Text
        style={{
          color: colors.textSecondary,
          fontFamily: typography.body.fontFamily,
          fontSize: typography.body.fontSize,
          lineHeight: typography.body.lineHeight,
        }}
      >
        {children}
      </Text>
    </View>
  );
}
