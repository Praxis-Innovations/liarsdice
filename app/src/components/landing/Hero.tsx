import { Link } from "expo-router";
import { MotiView } from "moti";
import React, { useEffect, useMemo, useState } from "react";
import { Platform, Text, View, useWindowDimensions } from "react-native";
import Svg, { Defs, LinearGradient, Path, Stop } from "react-native-svg";
import { headingProps } from "../../lib/heading";
import { useHeaderOffset } from "../shared/Header";
import { useTheme } from "../../theme/ThemeProvider";
import { Button } from "../ui/Button";
import { type ScatteredDieConfig } from "./AnimatedDice";
import { ScatteredCssDice } from "./CssDice3D";
import {
  DicePlatform,
  type DiceTableConfig,
  getBreakpoint,
  getDiceBand,
  getPlatformMetrics,
  placeDiceOnPlatform,
} from "./DicePlatform";

export function Hero() {
  const { colors, spacing, typography, isDark } = useTheme();
  const { width, height } = useWindowDimensions();
  const headerOffset = useHeaderOffset();
  const bp = getBreakpoint(width);
  const isPhone = bp === "phone";
  const isCompact = bp !== "laptop";
  const [scatteredDice, setScatteredDice] = useState<ScatteredDieConfig[]>([]);

  // On web, headerOffset === HEADER_HEIGHT (safe-area inset is 0).
  const heroHeight = Math.max(height - headerOffset, isPhone ? 640 : 560);
  const platform = useMemo(() => getPlatformMetrics(width, heroHeight), [heroHeight, width]);
  const table = useMemo<DiceTableConfig>(
    () => ({
      ...platform,
      haloColor: isDark ? colors.textPrimary : "#1C1730",
    }),
    [colors.textPrimary, isDark, platform],
  );

  useEffect(() => {
    const randomFace = () => (Math.floor(Math.random() * 6) + 1) as ScatteredDieConfig["face"];
    const randomBetween = (min: number, max: number) => min + Math.random() * (max - min);
    const palette = [colors.primary, colors.secondary, colors.accent];
    const band = getDiceBand(bp, width);
    const positions = placeDiceOnPlatform(platform, band.count, band.minSize, band.maxSize);

    const nextDice = positions.map((pos, index): ScatteredDieConfig => ({
      face: randomFace(),
      color: palette[index % palette.length],
      size: pos.size,
      top: pos.top,
      left: pos.left,
      tableDepth: pos.tableDepth,
      // Rest yaw is handled in the Three.js land pose (flat on bottom)
      restRotate: "0deg",
      tossRotate: `${Math.round(randomBetween(540, 900)) * (index % 2 === 0 ? 1 : -1)}deg`,
      // Almost no horizontal drift — fall straight down (gravity)
      throwOffsetX: randomBetween(-12, 12),
      // Full hero + header so native/SVG fallback also starts above the navbar.
      throwDistance: heroHeight + headerOffset + randomBetween(40, 120),
    }));

    setScatteredDice(nextDice);
  }, [bp, colors.accent, colors.primary, colors.secondary, headerOffset, heroHeight, platform, width]);

  // Reserve the dice height as well as the pad, so CTA/caption never cross the table stage.
  const contentBottomPad =
    platform.height + getDiceBand(bp, width).maxSize + (isPhone ? 68 : bp === "tablet" ? 100 : 140);
  // Extend the dice stage behind the sticky header on every breakpoint.
  const diceCanvasOffset = headerOffset;
  // Spotlight is stage-local: anchored to the dice platform, not the full hero width.
  const diceBand = getDiceBand(bp, width);
  const spotlightPad = diceBand.maxSize * 0.35;
  const spotlightWidth = Math.min(width, platform.width + spotlightPad * 2);
  const spotlightLeft = Math.max(
    0,
    Math.min(width - spotlightWidth, platform.left + platform.width / 2 - spotlightWidth / 2),
  );
  // Stop at the top of the dice band; blur softens the final edge into the dice.
  const spotlightHeight = Math.max(180, platform.surfaceTop - diceBand.maxSize);
  const spotlightTopWidth = Math.max(isPhone ? 48 : 64, spotlightWidth * (isCompact ? 0.28 : 0.22));
  const spotlightTopLeft = (spotlightWidth - spotlightTopWidth) / 2;
  const spotlightBlur = isPhone ? 18 : isCompact ? 22 : 28;
  // Soft lavender mist in light mode — ties to the navy palette without washing out.
  const spotlightColor = isDark ? colors.accent : "#A896C8";

  return (
    <View
      style={{
        backgroundColor: colors.background,
        minHeight: heroHeight,
        justifyContent: isCompact ? "flex-start" : "center",
        overflow: "visible",
      }}
      className="relative px-6 md:px-16"
    >
      {/* Background blobs */}
      <View
        pointerEvents="none"
        style={{
          position: "absolute",
          top: -160,
          right: -140,
          width: 440,
          height: 440,
          borderRadius: 999,
          backgroundColor: colors.primary,
          opacity: isDark ? 0.12 : 0.05,
        }}
      />
      <View
        pointerEvents="none"
        style={{
          position: "absolute",
          bottom: -180,
          left: -120,
          width: 380,
          height: 380,
          borderRadius: 999,
          backgroundColor: colors.secondary,
          opacity: isDark ? 0.1 : 0.04,
        }}
      />
      <View
        pointerEvents="none"
        style={{
          position: "absolute",
          top: "30%",
          left: -60,
          width: 280,
          height: 280,
          borderRadius: 999,
          backgroundColor: colors.accent,
          opacity: isDark ? 0.07 : 0.03,
        }}
      />

      {/* Native fallback platform. Web renders the perspective-matched Three.js table. */}
      {Platform.OS !== "web" ? (
        <DicePlatform left={platform.left} top={platform.top} width={platform.width} height={platform.height} />
      ) : null}

      {/* Soft cone of light over the dice stage — blurred, ends at the dice tops. */}
      <View
        pointerEvents="none"
        style={{
          position: "absolute",
          left: spotlightLeft - spotlightBlur,
          top: -spotlightBlur,
          width: spotlightWidth + spotlightBlur * 2,
          height: spotlightHeight + spotlightBlur,
          zIndex: 0,
          // Web-only soft edge; RN style typing doesn't include CSS filter.
          ...(Platform.OS === "web" ? ({ filter: `blur(${spotlightBlur}px)` } as object) : null),
        }}
      >
        <Svg
          width="100%"
          height="100%"
          viewBox={`0 0 ${spotlightWidth + spotlightBlur * 2} ${spotlightHeight + spotlightBlur}`}
          preserveAspectRatio="none"
        >
          <Defs>
            <LinearGradient id="diceSpotlight" x1="0" y1="0" x2="0" y2="1">
              <Stop offset="0" stopColor={spotlightColor} stopOpacity={isDark ? 0.2 : 0.28} />
              <Stop offset="0.62" stopColor={spotlightColor} stopOpacity={isDark ? 0.1 : 0.16} />
              <Stop offset="1" stopColor={spotlightColor} stopOpacity={0} />
            </LinearGradient>
          </Defs>
          <Path
            d={`M${spotlightBlur + spotlightTopLeft} ${spotlightBlur} L${
              spotlightBlur + spotlightTopLeft + spotlightTopWidth
            } ${spotlightBlur} L${spotlightBlur + spotlightWidth} ${spotlightBlur + spotlightHeight} L${spotlightBlur} ${
              spotlightBlur + spotlightHeight
            } Z`}
            fill="url(#diceSpotlight)"
          />
        </Svg>
      </View>

      {/* Dice fall onto the platform */}
      <View
        pointerEvents="none"
        style={{
          // Extend behind the header; Header has zIndex 100 so it stays in front.
          position: "absolute",
          top: -diceCanvasOffset,
          left: 0,
          width,
          height: heroHeight + diceCanvasOffset,
          zIndex: 1,
          overflow: "visible",
        }}
      >
        <ScatteredCssDice
          dice={scatteredDice}
          pipColor="#FFFFFF"
          width={width}
          height={heroHeight + diceCanvasOffset}
          table={table}
          verticalOffset={diceCanvasOffset}
        />
      </View>

      {/* Main content */}
      <View
        style={{
          position: "relative",
          maxWidth: 1120,
          width: "100%",
          alignSelf: "center",
          paddingTop: isCompact ? 48 : 64,
          paddingBottom: contentBottomPad,
          zIndex: 3,
        }}
      >
        <MotiView
          from={{ translateY: 20 }}
          animate={{ translateY: 0 }}
          transition={{ type: "timing", duration: 600 }}
          style={{
            alignItems: isCompact ? "center" : "flex-start",
            alignSelf: isCompact ? "center" : "flex-start",
            width: isCompact ? "100%" : undefined,
            maxWidth: 600,
          }}
        >
          <View
            style={{
              backgroundColor: colors.surface,
              borderRadius: 999,
              borderWidth: 1,
              borderColor: colors.border,
              paddingHorizontal: spacing.md,
              paddingVertical: spacing.xs + 2,
              marginBottom: spacing.lg,
            }}
          >
            <Text
              style={{
                color: colors.accent,
                fontFamily: typography.bodySemibold.fontFamily,
                fontSize: 13,
                letterSpacing: 1.8,
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
              fontSize: isPhone ? 44 : bp === "tablet" ? 48 : 60,
              lineHeight: isPhone ? 48 : bp === "tablet" ? 52 : 66,
              textAlign: isCompact ? "center" : "left",
            }}
          >
            Liar&apos;s Dice
          </Text>

          <Text
            style={{
              color: colors.textSecondary,
              fontFamily: typography.body.fontFamily,
              fontSize: isPhone ? 17 : 20,
              lineHeight: isPhone ? 26 : 30,
              marginTop: spacing.md,
              textAlign: isCompact ? "center" : "left",
              maxWidth: 480,
            }}
          >
            Bid boldly. Call the bluff. Trust no one at the table — the classic dice game of
            deception, free in your browser.
          </Text>

          <View style={{ marginTop: spacing.xl + 8 }}>
            <Link href="/play" asChild>
              <Button label="Play now — it's free" variant="primary" />
            </Link>
          </View>

          <Text
            style={{
              color: colors.textSecondary,
              fontFamily: typography.caption.fontFamily,
              fontSize: 13,
              marginTop: spacing.md,
              textAlign: isCompact ? "center" : "left",
              opacity: 0.7,
            }}
          >
            No account needed · 2–6 players · AI opponents
          </Text>
        </MotiView>
      </View>
    </View>
  );
}
