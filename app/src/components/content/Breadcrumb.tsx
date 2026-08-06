import { Link } from "expo-router";
import React from "react";
import { Text, View } from "react-native";
import { useTheme } from "../../theme/ThemeProvider";

export interface BreadcrumbItem {
  label: string;
  href?: string;
}

export function Breadcrumb({ items }: { items: BreadcrumbItem[] }) {
  const { colors, spacing, typography } = useTheme();
  const all: BreadcrumbItem[] = [{ label: "Home", href: "/" }, ...items];

  return (
    <View className="flex-row flex-wrap items-center" style={{ gap: 6, marginBottom: spacing.md }}>
      {all.map((item, i) => {
        const isLast = i === all.length - 1;
        return (
          <React.Fragment key={`${item.label}-${i}`}>
            {i > 0 ? (
              <Text style={{ color: colors.textSecondary, fontSize: 12 }}>/</Text>
            ) : null}
            {item.href && !isLast ? (
              <Link href={item.href} style={{ color: colors.textSecondary, fontFamily: typography.caption.fontFamily, fontSize: 12 }}>
                {item.label}
              </Link>
            ) : (
              <Text style={{ color: colors.textPrimary, fontFamily: typography.caption.fontFamily, fontSize: 12 }}>{item.label}</Text>
            )}
          </React.Fragment>
        );
      })}
    </View>
  );
}
