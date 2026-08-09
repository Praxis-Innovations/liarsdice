import { Link } from "expo-router";
import { MotiView } from "moti";
import React, { useMemo } from "react";
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
  buildHeroDiceSpecs,
  getDiceBand,
  getHeroStageMetrics,
  type DiceTableConfig,
} from "./DicePlatform";

/** Fixed marketing palette — keeps WebGL from remounting when theme hydrates/toggles. */
const HERO_DICE_PALETTE = ["#FF5A5F", "#00B894", "#FFC145"] as const;
const HERO_TABLE_HALO = "#1C1730";

export function Hero() {
  const { colors, spacing, typography, isDark } = useTheme();
  const { width, height } = useWindowDimensions();
  const headerOffset = useHeaderOffset();

  const stage = useMemo(
    () => getHeroStageMetrics(width, height, headerOffset),
    [headerOffset, height, width],
  );
  const {
    bp,
    layoutWidth,
    heroHeight,
    platform,
    contentTopPad,
    contentBottomPad,
    flowBandHeight,
    justifyContent,
    diceCanvasOffset,
  } = stage;
  const isPhone = bp === "phone";
  const isCompact = bp !== "laptop";
  const diceBand = useMemo(() => getDiceBand(bp, layoutWidth), [bp, layoutWidth]);

  const table = useMemo<DiceTableConfig>(
    () => ({
      ...platform,
      haloColor: HERO_TABLE_HALO,
    }),
    [platform],
  );

  // Deterministic first-paint dice — same seed for a given layout width / bp.
  const scatteredDice = useMemo<ScatteredDieConfig[]>(() => {
    const seed = Math.round(layoutWidth) * 10 + (bp === "phone" ? 1 : bp === "tablet" ? 2 : 3);
    const specs = buildHeroDiceSpecs(platform, diceBand, heroHeight, headerOffset, seed);
    return specs.map((spec) => ({
      face: spec.face,
      color: HERO_DICE_PALETTE[spec.colorIndex] ?? HERO_DICE_PALETTE[0],
      size: spec.size,
      top: spec.top,
      left: spec.left,
      tableDepth: spec.tableDepth,
      restRotate: spec.restRotate,
      tossRotate: spec.tossRotate,
      throwOffsetX: spec.throwOffsetX,
      // Full-hero toss on every breakpoint (canvas extends behind the nav).
      throwDistance: spec.throwDistance,
    }));
  }, [bp, diceBand, headerOffset, heroHeight, layoutWidth, platform]);

  const marketingStack = (
    <View
      style={{
        width: "100%",
        maxWidth: 600,
        alignItems: isCompact ? "center" : "flex-start",
        backgroundColor: "transparent",
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
          alignSelf: isCompact ? "center" : "flex-start",
        }}
      >
        <Text
          style={{
            color: colors.accent,
            fontFamily: typography.bodySemibold.fontFamily,
            fontSize: typography.caption.fontSize,
            letterSpacing: 1.8,
            textAlign: "center",
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
          fontSize: isPhone ? 50 : bp === "tablet" ? 54 : 68,
          lineHeight: isPhone ? 54 : bp === "tablet" ? 59 : 74,
          textAlign: isCompact ? "center" : "left",
          alignSelf: "stretch",
        }}
      >
        Liar&apos;s Dice
      </Text>

      <Text
        style={{
          color: colors.textSecondary,
          fontFamily: typography.body.fontFamily,
          fontSize: isPhone ? 21 : 25,
          lineHeight: isPhone ? 33 : 38,
          marginTop: spacing.md,
          maxWidth: 480,
          textAlign: isCompact ? "center" : "left",
          alignSelf: isCompact ? "center" : "stretch",
        }}
      >
        Bid boldly. Call the bluff. Trust no one at the table — the classic dice game of deception,
        free in your browser.
      </Text>

      <View
        style={{
          marginTop: spacing.xl + 8,
          width: isCompact ? "100%" : undefined,
          alignItems: isCompact ? "center" : "flex-start",
        }}
      >
        <Link href="/play" asChild>
          <Button label="Play now — it's free" variant="primary" style={{ alignSelf: "center" }} />
        </Link>
      </View>

      <Text
        style={{
          color: colors.textSecondary,
          fontFamily: typography.caption.fontFamily,
          fontSize: typography.caption.fontSize,
          marginTop: spacing.md,
          opacity: 0.7,
          textAlign: isCompact ? "center" : "left",
          alignSelf: "stretch",
        }}
      >
        No account needed · 2–6 players · AI opponents
      </Text>
    </View>
  );

  // Soft conical beam over the tray (compact + laptop).
  const spotlightPad = diceBand.maxSize * 0.35;
  const spotlightWidth = Math.min(layoutWidth, platform.width + spotlightPad * 2);
  const spotlightLeft = Math.max(
    0,
    Math.min(layoutWidth - spotlightWidth, platform.left + platform.width / 2 - spotlightWidth / 2),
  );
  const spotlightTopWidth = Math.max(64, spotlightWidth * 0.22);
  const spotlightTopLeft = (spotlightWidth - spotlightTopWidth) / 2;
  const spotlightBlur = 28;
  const spotlightColor = isDark ? colors.accent : "#A896C8";

  const spotlightHeight = Math.max(180, platform.surfaceTop - diceBand.maxSize);

  // —— Compact: full-height hero; copy above 80%, dice land on 80% ——
  if (isCompact && flowBandHeight != null) {
    return (
      <View
        style={{
          backgroundColor: colors.background,
          height: heroHeight,
          width: "100%",
          overflow: "visible",
        }}
      >
        <View
          pointerEvents="none"
          style={{
            position: "absolute",
            top: -120,
            right: -100,
            width: 320,
            height: 320,
            borderRadius: 999,
            backgroundColor: colors.primary,
            opacity: isDark ? 0.12 : 0.05,
          }}
        />

        {Platform.OS !== "web" ? (
          <DicePlatform
            left={platform.left}
            top={platform.top}
            width={platform.width}
            height={platform.height}
          />
        ) : null}

        {/* Flash beam — same cone as laptop, aimed at the 80% landing line. */}
        <View
          pointerEvents="none"
          style={{
            position: "absolute",
            left: spotlightLeft - spotlightBlur,
            top: platform.surfaceTop - spotlightHeight - spotlightBlur,
            width: spotlightWidth + spotlightBlur * 2,
            height: spotlightHeight + spotlightBlur,
            zIndex: 0,
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
              <LinearGradient id="diceSpotlightCompact" x1="0" y1="0" x2="0" y2="1">
                <Stop offset="0" stopColor={spotlightColor} stopOpacity={isDark ? 0.32 : 0.34} />
                <Stop offset="0.55" stopColor={spotlightColor} stopOpacity={isDark ? 0.16 : 0.2} />
                <Stop offset="1" stopColor={spotlightColor} stopOpacity={0} />
              </LinearGradient>
            </Defs>
            <Path
              d={`M${spotlightBlur + spotlightTopLeft} ${spotlightBlur} L${
                spotlightBlur + spotlightTopLeft + spotlightTopWidth
              } ${spotlightBlur} L${spotlightBlur + spotlightWidth} ${spotlightBlur + spotlightHeight} L${spotlightBlur} ${
                spotlightBlur + spotlightHeight
              } Z`}
              fill="url(#diceSpotlightCompact)"
            />
          </Svg>
        </View>

        {/* Full-hero WebGL stage — landing Y is platform.surfaceTop (80% device). */}
        <View
          pointerEvents="none"
          style={{
            position: "absolute",
            top: -diceCanvasOffset,
            left: 0,
            width: layoutWidth,
            height: heroHeight + diceCanvasOffset,
            zIndex: 1,
            overflow: "visible",
            backgroundColor: "transparent",
          }}
        >
          <ScatteredCssDice
            dice={scatteredDice}
            pipColor="#FFFFFF"
            width={layoutWidth}
            height={heroHeight + diceCanvasOffset}
            table={table}
            verticalOffset={diceCanvasOffset}
          />
        </View>

        {/*
          Copy lives in the band above the 80% landing line. Pin the stack to
          the vertical center of that band (~40% of the device), and keep the
          band transparent so the toss/beam show through.
        */}
        <View
          style={{
            height: flowBandHeight,
            width: "100%",
            justifyContent: "center",
            alignItems: "center",
            paddingHorizontal: 24,
            paddingBottom: Math.round(diceBand.maxSize * 1.25),
            zIndex: 2,
            backgroundColor: "transparent",
          }}
        >
          <MotiView
            from={{ translateY: 20 }}
            animate={{ translateY: 0 }}
            transition={{ type: "timing", duration: 600 }}
            style={{ width: "100%", maxWidth: 600, backgroundColor: "transparent" }}
          >
            {marketingStack}
          </MotiView>
        </View>
      </View>
    );
  }

  // —— Laptop: side-by-side absolute dice stage ——

  return (
    <View
      style={{
        backgroundColor: colors.background,
        minHeight: heroHeight,
        height: heroHeight,
        justifyContent,
        overflow: "visible",
      }}
      className="relative px-6 md:px-16"
    >
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

      {Platform.OS !== "web" ? (
        <DicePlatform left={platform.left} top={platform.top} width={platform.width} height={platform.height} />
      ) : null}

      <View
        pointerEvents="none"
        style={{
          position: "absolute",
          left: spotlightLeft - spotlightBlur,
          top: -spotlightBlur,
          width: spotlightWidth + spotlightBlur * 2,
          height: spotlightHeight + spotlightBlur,
          zIndex: 0,
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

      <View
        pointerEvents="none"
        style={{
          position: "absolute",
          top: -diceCanvasOffset,
          left: 0,
          width: layoutWidth,
          height: heroHeight + diceCanvasOffset,
          zIndex: 1,
          overflow: "visible",
        }}
      >
        <ScatteredCssDice
          dice={scatteredDice}
          pipColor="#FFFFFF"
          width={layoutWidth}
          height={heroHeight + diceCanvasOffset}
          table={table}
          verticalOffset={diceCanvasOffset}
        />
      </View>

      <View
        style={{
          position: "relative",
          maxWidth: 1120,
          width: "100%",
          alignSelf: "center",
          paddingTop: contentTopPad,
          paddingBottom: contentBottomPad,
          zIndex: 3,
          alignItems: "flex-start",
        }}
      >
        <MotiView
          from={{ translateY: 20 }}
          animate={{ translateY: 0 }}
          transition={{ type: "timing", duration: 600 }}
          style={{ width: "100%", maxWidth: 600 }}
        >
          {marketingStack}
        </MotiView>
      </View>
    </View>
  );
}
