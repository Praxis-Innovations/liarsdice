import { Link, usePathname } from "expo-router";
import React from "react";
import { View } from "react-native";
import { useTheme } from "../../theme/ThemeProvider";

const LINKS = [
  { href: "/play", label: "Play" },
  { href: "/how-to-play", label: "How to Play" },
  { href: "/rules", label: "Rules" },
  { href: "/strategy", label: "Strategy" },
  { href: "/dudo-perudo-rules", label: "Dudo & Perudo" },
  { href: "/compare", label: "Compare" },
  { href: "/history", label: "History" },
  { href: "/faq", label: "FAQ" },
] as const;

export function ContentNav() {
  const { colors, spacing, typography } = useTheme();
  const pathname = usePathname();

  return (
    <View className="flex-row flex-wrap" style={{ gap: spacing.sm }}>
      {LINKS.map((link) => {
        const active = pathname === link.href;
        return (
          <Link
            key={link.href}
            href={link.href}
            style={{
              backgroundColor: active ? colors.accent : colors.surface,
              color: active ? colors.primaryText : colors.textSecondary,
              paddingHorizontal: spacing.md,
              paddingVertical: 6,
              borderRadius: 999,
              fontFamily: typography.bodyMedium.fontFamily,
              fontSize: typography.caption.fontSize,
              overflow: "hidden",
            }}
          >
            {link.label}
          </Link>
        );
      })}
    </View>
  );
}
