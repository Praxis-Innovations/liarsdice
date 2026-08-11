import { Link, usePathname } from "expo-router";
import React, { useState } from "react";
import { Pressable, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Svg, { Circle, Line, Path } from "react-native-svg";
import { isDesktopWidth } from "../../lib/breakpoints";
import { useHydrationSafeWindowDimensions } from "../../lib/useHydrationSafeWindowDimensions";
import { useTheme } from "../../theme/ThemeProvider";
import { Die } from "./Die";
import { NavLink } from "./NavLink";

const NAV_LINKS = [
  { href: "/how-to-play", label: "How to Play" },
  { href: "/rules", label: "Rules" },
  { href: "/strategy", label: "Strategy" },
  { href: "/history", label: "History" },
  { href: "/faq", label: "FAQ" },
] as const;

const PLAY_HREF = "/play" as const;

/** Content-row height of the sticky header (excludes status-bar inset). */
export const HEADER_HEIGHT = 64;

/** Total sticky-header offset including top safe-area (0 on typical web). */
export function useHeaderOffset() {
  const insets = useSafeAreaInsets();
  return HEADER_HEIGHT + insets.top;
}

function SunIcon({ color, size = 22 }: { color: string; size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Circle cx={12} cy={12} r={5} fill="none" stroke={color} strokeWidth={2} />
      <Line x1={12} y1={1} x2={12} y2={3} stroke={color} strokeWidth={2} strokeLinecap="round" />
      <Line x1={12} y1={21} x2={12} y2={23} stroke={color} strokeWidth={2} strokeLinecap="round" />
      <Line x1={4.22} y1={4.22} x2={5.64} y2={5.64} stroke={color} strokeWidth={2} strokeLinecap="round" />
      <Line x1={18.36} y1={18.36} x2={19.78} y2={19.78} stroke={color} strokeWidth={2} strokeLinecap="round" />
      <Line x1={1} y1={12} x2={3} y2={12} stroke={color} strokeWidth={2} strokeLinecap="round" />
      <Line x1={21} y1={12} x2={23} y2={12} stroke={color} strokeWidth={2} strokeLinecap="round" />
      <Line x1={4.22} y1={19.78} x2={5.64} y2={18.36} stroke={color} strokeWidth={2} strokeLinecap="round" />
      <Line x1={18.36} y1={5.64} x2={19.78} y2={4.22} stroke={color} strokeWidth={2} strokeLinecap="round" />
    </Svg>
  );
}

function MoonIcon({ color, size = 22 }: { color: string; size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Path
        d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"
        fill="none"
        stroke={color}
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

function HamburgerIcon({ color, size = 24 }: { color: string; size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Line x1={3} y1={6} x2={21} y2={6} stroke={color} strokeWidth={2} strokeLinecap="round" />
      <Line x1={3} y1={12} x2={21} y2={12} stroke={color} strokeWidth={2} strokeLinecap="round" />
      <Line x1={3} y1={18} x2={21} y2={18} stroke={color} strokeWidth={2} strokeLinecap="round" />
    </Svg>
  );
}

function CloseIcon({ color, size = 24 }: { color: string; size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Line x1={18} y1={6} x2={6} y2={18} stroke={color} strokeWidth={2} strokeLinecap="round" />
      <Line x1={6} y1={6} x2={18} y2={18} stroke={color} strokeWidth={2} strokeLinecap="round" />
    </Svg>
  );
}

export function Header() {
  const { colors, spacing, typography, isDark, toggleTheme } = useTheme();
  const { width } = useHydrationSafeWindowDimensions();
  const insets = useSafeAreaInsets();
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  const isDesktop = isDesktopWidth(width);
  const headerOffset = HEADER_HEIGHT + insets.top;
  // Navy ink on gold/coral stays WCAG-AA in both themes (white-on-accent does not).
  const onBrightText = "#1C1730";

  return (
    <View style={{ zIndex: 100, backgroundColor: colors.background, paddingTop: insets.top }}>
      <View
        style={{
          height: HEADER_HEIGHT,
          backgroundColor: colors.background,
          borderBottomWidth: 1,
          borderBottomColor: colors.border,
          paddingHorizontal: isDesktop ? 32 : 16,
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        {/* Logo */}
        <Link href="/" style={{ flexDirection: "row", alignItems: "center" }} onPress={() => setMenuOpen(false)}>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
            <Die face={5} color={colors.primary} pipColor="#FFFFFF" size={36} />
            <Text
              style={{
                fontFamily: typography.h1.fontFamily,
                fontSize: 25,
                color: colors.textPrimary,
              }}
            >
              Liar&apos;s Dice
            </Text>
          </View>
        </Link>

        {/* Desktop nav */}
        {isDesktop ? (
          <View style={{ flexDirection: "row", alignItems: "center", gap: 4 }}>
            {NAV_LINKS.map((link) => {
              const active = pathname === link.href;
              return (
                <NavLink
                  key={link.href}
                  href={link.href}
                  style={{
                    paddingHorizontal: 14,
                    paddingVertical: 8,
                    borderRadius: 999,
                    backgroundColor: active ? colors.accent : "transparent",
                    overflow: "hidden",
                  }}
                >
                  <Text
                    style={{
                      fontFamily: typography.bodyMedium.fontFamily,
                      fontSize: 18,
                      color: active ? onBrightText : colors.textSecondary,
                    }}
                  >
                    {link.label}
                  </Text>
                </NavLink>
              );
            })}

            {/* Theme toggle */}
            <Pressable
              onPress={toggleTheme}
              accessibilityRole="button"
              accessibilityLabel={isDark ? "Switch to light theme" : "Switch to dark theme"}
              style={{
                width: 40,
                height: 40,
                borderRadius: 999,
                alignItems: "center",
                justifyContent: "center",
                marginLeft: 4,
              }}
            >
              {isDark ? <SunIcon color={colors.accent} /> : <MoonIcon color={colors.textSecondary} />}
            </Pressable>

            {/* Primary CTA — matches Button primary (primaryText), sized to the nav row */}
            <NavLink
              href={PLAY_HREF}
              prefetchOnMount={false}
              style={{
                marginLeft: 8,
                paddingHorizontal: 16,
                paddingVertical: 8,
                borderRadius: 999,
                backgroundColor: colors.primary,
                overflow: "hidden",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Text
                style={{
                  fontFamily: typography.bodySemibold.fontFamily,
                  fontSize: 16,
                  lineHeight: 20,
                  color: colors.primaryText,
                }}
              >
                Play
              </Text>
            </NavLink>
          </View>
        ) : (
          <View style={{ flexDirection: "row", alignItems: "center", gap: 4 }}>
            {/* Theme toggle (mobile) */}
            <Pressable
              onPress={toggleTheme}
              accessibilityRole="button"
              accessibilityLabel={isDark ? "Switch to light theme" : "Switch to dark theme"}
              style={{
                width: 40,
                height: 40,
                borderRadius: 999,
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              {isDark ? <SunIcon color={colors.accent} /> : <MoonIcon color={colors.textSecondary} />}
            </Pressable>

            {/* Hamburger */}
            <Pressable
              onPress={() => setMenuOpen(!menuOpen)}
              accessibilityRole="button"
              accessibilityLabel={menuOpen ? "Close navigation menu" : "Open navigation menu"}
              style={{
                width: 40,
                height: 40,
                borderRadius: 999,
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              {menuOpen ? (
                <CloseIcon color={colors.textPrimary} />
              ) : (
                <HamburgerIcon color={colors.textPrimary} />
              )}
            </Pressable>
          </View>
        )}
      </View>

      {/* Mobile dropdown menu — plain Views so moti/reanimated stay off the chrome path. */}
      {!isDesktop && menuOpen && (
        <View
          style={{
            position: "absolute",
            top: headerOffset,
            left: 0,
            right: 0,
            backgroundColor: colors.background,
            borderBottomWidth: 1,
            borderBottomColor: colors.border,
            paddingVertical: spacing.sm,
            paddingHorizontal: spacing.md,
            zIndex: 99,
          }}
        >
          {NAV_LINKS.map((link) => {
            const active = pathname === link.href;
            return (
              <NavLink
                key={link.href}
                href={link.href}
                onPress={() => setMenuOpen(false)}
                style={{
                  paddingVertical: 12,
                  paddingHorizontal: spacing.md,
                  borderRadius: 12,
                  backgroundColor: active ? colors.accent : "transparent",
                  overflow: "hidden",
                }}
              >
                <Text
                  style={{
                    fontFamily: typography.bodyMedium.fontFamily,
                    fontSize: typography.body.fontSize,
                    color: active ? onBrightText : colors.textPrimary,
                  }}
                >
                  {link.label}
                </Text>
              </NavLink>
            );
          })}

          <View style={{ marginTop: spacing.sm, marginBottom: spacing.xs }}>
            <NavLink
              href={PLAY_HREF}
              prefetchOnMount={false}
              onPress={() => setMenuOpen(false)}
              style={{
                paddingVertical: 12,
                paddingHorizontal: spacing.md,
                borderRadius: 12,
                backgroundColor: colors.primary,
                alignItems: "center",
                justifyContent: "center",
                overflow: "hidden",
              }}
            >
              <Text
                style={{
                  fontFamily: typography.bodySemibold.fontFamily,
                  fontSize: 18,
                  lineHeight: 24,
                  color: colors.primaryText,
                }}
              >
                Play
              </Text>
            </NavLink>
          </View>
        </View>
      )}
    </View>
  );
}
