import { Link } from "expo-router";
import React from "react";
import { Text, View } from "react-native";
import { isCompactWidth } from "../../lib/breakpoints";
import { useHydrationSafeWindowDimensions } from "../../lib/useHydrationSafeWindowDimensions";
import { useTheme } from "../../theme/ThemeProvider";
import { Die } from "./Die";

const LEARN_LINKS = [
  { href: "/how-to-play", label: "How to Play" },
  { href: "/rules", label: "Rules" },
  { href: "/strategy", label: "Strategy" },
  { href: "/dudo-perudo-rules", label: "Dudo & Perudo" },
  { href: "/compare", label: "Compare Variants" },
  { href: "/history", label: "History" },
  { href: "/faq", label: "FAQ" },
  { href: "/products", label: "Our Products" },
] as const;

function DiceDivider({ colors }: { colors: ReturnType<typeof useTheme>["colors"] }) {
  const faces = [1, 3, 5, 2, 6] as const;
  return (
    <View style={{ flexDirection: "row", justifyContent: "center", gap: 12, paddingVertical: 24 }}>
      {faces.map((face, i) => (
        <View key={i} style={{ opacity: 0.2 + i * 0.08 }}>
          <Die face={face} color={colors.textSecondary} pipColor={colors.background} size={20} />
        </View>
      ))}
    </View>
  );
}

export function Footer() {
  const { colors, spacing, typography } = useTheme();
  const { width } = useHydrationSafeWindowDimensions();
  const isNarrow = isCompactWidth(width);

  return (
    <View
      style={{
        backgroundColor: colors.surface,
        borderTopWidth: 1,
        borderTopColor: colors.border,
        width: "100%",
        alignSelf: "stretch",
      }}
    >
      <DiceDivider colors={colors} />

      <View
        style={{
          maxWidth: 1120,
          width: "100%",
          alignSelf: "center",
          paddingHorizontal: isNarrow ? spacing.lg : 48,
          paddingBottom: spacing.xl,
          flexDirection: isNarrow ? "column" : "row",
          gap: isNarrow ? spacing.xl : 64,
        }}
      >
        {/* Brand column */}
        <View style={{ flex: 1, gap: spacing.sm }}>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 10, marginBottom: spacing.xs }}>
            <Die face={5} color={colors.primary} pipColor="#FFFFFF" size={28} />
            <Text style={{ fontFamily: typography.h2.fontFamily, fontSize: 23, color: colors.textPrimary }}>
              Liar&apos;s Dice
            </Text>
          </View>
          <Text
            style={{
              fontFamily: typography.body.fontFamily,
              fontSize: 18,
              lineHeight: 28,
              color: colors.textSecondary,
              maxWidth: 320,
            }}
          >
            The classic bluffing dice game. Play free against AI opponents — no sign-up, no download.
          </Text>
        </View>

        {/* Learn column */}
        <View style={{ gap: spacing.sm }}>
          <Text
            style={{
              fontFamily: typography.bodySemibold.fontFamily,
              fontSize: 15,
              color: colors.accentText,
              letterSpacing: 1.5,
              textTransform: "uppercase",
              marginBottom: spacing.xs,
            }}
          >
            Learn
          </Text>
          {LEARN_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              style={{
                fontFamily: typography.body.fontFamily,
                fontSize: 18,
                color: colors.textSecondary,
              }}
            >
              {link.label}
            </Link>
          ))}
        </View>

        {/* Play column */}
        <View style={{ gap: spacing.sm }}>
          <Text
            style={{
              fontFamily: typography.bodySemibold.fontFamily,
              fontSize: 15,
              color: colors.accentText,
              letterSpacing: 1.5,
              textTransform: "uppercase",
              marginBottom: spacing.xs,
            }}
          >
            Play
          </Text>
          <Link
            href="/play"
            style={{
              fontFamily: typography.body.fontFamily,
              fontSize: 18,
              color: colors.textSecondary,
            }}
          >
            Play vs AI
          </Link>
        </View>
      </View>

      {/* Bottom bar */}
      <View
        style={{
          borderTopWidth: 1,
          borderTopColor: colors.border,
          paddingVertical: spacing.md,
          paddingHorizontal: isNarrow ? spacing.lg : 48,
          alignItems: "center",
        }}
      >
        <Text
          style={{
            fontFamily: typography.caption.fontFamily,
            fontSize: 15,
            color: colors.textSecondary,
            textAlign: "center",
          }}
        >
          © {new Date().getFullYear()} Liar&apos;s Dice Online. Liar&apos;s Dice is a public domain game.
        </Text>
      </View>
    </View>
  );
}
