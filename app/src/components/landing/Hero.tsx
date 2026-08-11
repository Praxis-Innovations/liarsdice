import { Link } from "expo-router";
import React, { useEffect, useId, useMemo, useState } from "react";
import { Platform, Text, View } from "react-native";
import Svg, { Defs, FeGaussianBlur, Filter, LinearGradient, Path, Stop } from "react-native-svg";
import { headingProps } from "../../lib/heading";
import { useHydrationSafeWindowDimensions } from "../../lib/useHydrationSafeWindowDimensions";
import { useHeaderOffset } from "../shared/Header";
import { useTheme } from "../../theme/ThemeProvider";
import { Button } from "../ui/Button";
import { type ScatteredDieConfig } from "./AnimatedDice";
import {
  DicePlatform,
  buildHeroDiceSpecs,
  getDiceBand,
  getHeroStageMetrics,
  type DiceTableConfig,
} from "./DicePlatform";
import { HeroDiceStage } from "./HeroDiceStage";

const HERO_DICE_PALETTE = ["#FF5A5F", "#00B894", "#FFC145"] as const;
const HERO_TABLE_HALO = "#1C1730";

export function Hero() {
  const { colors, spacing, typography, isDark } = useTheme();
  const { width, height } = useHydrationSafeWindowDimensions();
  const headerOffset = useHeaderOffset();
  // Stack navigation keeps prior screens mounted. SVG paint-server IDs must
  // therefore be unique for every Hero instance, not global constants.
  const spotlightId = useId().replace(/:/g, "");
  const spotlightBlurId = `heroSpotlightBlur-${spotlightId}`;
  const spotlightGradientId = `heroSpotlight-${spotlightId}`;
  // Use a stable first render for SSG/hydration, then reroll the hero dice
  // client-side so each page load has a fresh table.
  const [diceSeed, setDiceSeed] = useState(0);

  useEffect(() => {
    setDiceSeed(Math.floor(Math.random() * 0x7fffffff));
  }, []);

  const stage = useMemo(
    () => getHeroStageMetrics(width, height, headerOffset),
    [headerOffset, height, width],
  );
  const { bp, layoutWidth, heroHeight, platform, diceLineY } = stage;
  const isPhone = bp === "phone";
  const diceBand = useMemo(() => getDiceBand(bp, layoutWidth), [bp, layoutWidth]);

  const table = useMemo<DiceTableConfig>(
    () => ({ ...platform, haloColor: HERO_TABLE_HALO }),
    [platform],
  );

  const scatteredDice = useMemo<ScatteredDieConfig[]>(() => {
    const breakpointOffset = bp === "phone" ? 1 : bp === "tablet" ? 2 : 3;
    const specs = buildHeroDiceSpecs(platform, diceBand, heroHeight, headerOffset, diceSeed + breakpointOffset);
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
      throwDistance: spec.throwDistance,
    }));
  }, [bp, diceBand, diceSeed, headerOffset, heroHeight, platform]);

  // Spotlight: cone from above the content down to just above the dice.
  const spotlightPad = diceBand.maxSize * 0.35;
  const spotlightWidth = Math.min(layoutWidth, platform.width + spotlightPad * 2);
  const spotlightTopWidth = Math.max(64, spotlightWidth * 0.22);
  const spotlightTopLeft = (spotlightWidth - spotlightTopWidth) / 2;
  // Apply blur within the SVG rather than with CSS. CSS filters can disappear
  // after a React Native Web route transition in some browsers.
  const spotlightBlur = 28;
  const spotlightColor = isDark ? colors.accent : "#8B72B5";
  const spotlightHeight = Math.max(180, diceLineY - diceBand.maxSize);

  return (
    <View
      style={{
        backgroundColor: colors.background,
        height: heroHeight,
        width: "100%",
        overflow: "visible",
      }}
    >
      {/* Decorative blur circles */}
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
      <View
        pointerEvents="none"
        style={{
          position: "absolute",
          bottom: -230,
          left: -190,
          width: 520,
          height: 520,
          borderRadius: 999,
          backgroundColor: colors.secondary,
          opacity: isDark ? 0.12 : 0.055,
        }}
      />

      {/* Native-only platform tray */}
      {Platform.OS !== "web" ? (
        <DicePlatform
          left={platform.left}
          top={platform.top}
          width={platform.width}
          height={platform.height}
        />
      ) : null}

      {/* Spotlight cone — SVG-centered so it remains visible after web navigation. */}
      <View
        pointerEvents="none"
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          top: diceLineY - spotlightHeight - spotlightBlur,
          height: spotlightHeight + spotlightBlur,
          // Keep the cone above the hero background. On react-native-web,
          // zIndex: 0 can be composited beneath the parent surface after a
          // client-side route transition.
          zIndex: 1,
          alignItems: "center",
        }}
      >
        <View
          style={{ width: spotlightWidth + spotlightBlur * 2, height: spotlightHeight + spotlightBlur }}
        >
          <Svg
            width="100%"
            height="100%"
            viewBox={`0 0 ${spotlightWidth + spotlightBlur * 2} ${spotlightHeight + spotlightBlur}`}
            preserveAspectRatio="none"
          >
            <Defs>
              <Filter id={spotlightBlurId} x="-20%" y="-20%" width="140%" height="140%">
                <FeGaussianBlur stdDeviation={spotlightBlur / 2} />
              </Filter>
              <LinearGradient id={spotlightGradientId} x1="0" y1="0" x2="0" y2="1">
                <Stop offset="0" stopColor={spotlightColor} stopOpacity={isDark ? 0.38 : 0.42} />
                <Stop offset="0.55" stopColor={spotlightColor} stopOpacity={isDark ? 0.18 : 0.24} />
                <Stop offset="1" stopColor={spotlightColor} stopOpacity={0} />
              </LinearGradient>
            </Defs>
            <Path
              d={`M${spotlightBlur + spotlightTopLeft} ${spotlightBlur} L${
                spotlightBlur + spotlightTopLeft + spotlightTopWidth
              } ${spotlightBlur} L${spotlightBlur + spotlightWidth} ${spotlightBlur + spotlightHeight} L${spotlightBlur} ${
                spotlightBlur + spotlightHeight
              } Z`}
              fill={`url(#${spotlightGradientId})`}
              filter={`url(#${spotlightBlurId})`}
            />
          </Svg>
        </View>
      </View>

      {/* Dice stage — CSS-centered so SSR dice band stays centered at any viewport width */}
      <View
        pointerEvents="none"
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          height: heroHeight,
          zIndex: 2,
          overflow: "visible",
          backgroundColor: "transparent",
          alignItems: "center",
        }}
      >
        <View style={{ width: layoutWidth, height: heroHeight, overflow: "visible" }}>
          <HeroDiceStage
            dice={scatteredDice}
            pipColor="#FFFFFF"
            width={layoutWidth}
            height={heroHeight}
            table={table}
            verticalOffset={0}
          />
        </View>
      </View>

      {/* Centered content — always centered on all breakpoints */}
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          paddingHorizontal: 24,
          paddingBottom: diceBand.maxSize + (isPhone ? 64 : 80),
          zIndex: 3,
          backgroundColor: "transparent",
        }}
      >
        <View
          style={{
            width: "100%",
            maxWidth: 600,
            alignItems: "center",
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
            }}
          >
            <Text
              style={{
                color: colors.accentText,
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
              textAlign: "center",
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
              textAlign: "center",
            }}
          >
            Bid boldly. Call the bluff. Trust no one at the table — the classic dice game of
            deception, free in your browser.
          </Text>

          <View style={{ marginTop: spacing.xl + 8, alignItems: "center" }}>
            <Link href="/play" asChild>
              <Button label="Play now — it's free" variant="primary" />
            </Link>
          </View>

          <Text
            style={{
              color: colors.textSecondary,
              fontFamily: typography.caption.fontFamily,
              fontSize: typography.caption.fontSize,
              marginTop: spacing.md,
              textAlign: "center",
              alignSelf: "stretch",
            }}
          >
            No account needed · 2–6 players · AI opponents
          </Text>
        </View>
      </View>
    </View>
  );
}
