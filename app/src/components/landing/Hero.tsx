import { Link } from "expo-router";
import React, { useMemo } from "react";
import { Platform, Text, View } from "react-native";
import Svg, { Defs, LinearGradient, Path, Stop } from "react-native-svg";
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
      throwDistance: spec.throwDistance,
    }));
  }, [bp, diceBand, headerOffset, heroHeight, layoutWidth, platform]);

  // Spotlight: cone from above the content down to just above the dice.
  const spotlightPad = diceBand.maxSize * 0.35;
  const spotlightWidth = Math.min(layoutWidth, platform.width + spotlightPad * 2);
  const spotlightLeft = (layoutWidth - spotlightWidth) / 2;
  const spotlightTopWidth = Math.max(64, spotlightWidth * 0.22);
  const spotlightTopLeft = (spotlightWidth - spotlightTopWidth) / 2;
  const spotlightBlur = 28;
  const spotlightColor = isDark ? colors.accent : "#A896C8";
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

      {/* Native-only platform tray */}
      {Platform.OS !== "web" ? (
        <DicePlatform
          left={platform.left}
          top={platform.top}
          width={platform.width}
          height={platform.height}
        />
      ) : null}

      {/* Spotlight cone — ends just above the dice row */}
      <View
        pointerEvents="none"
        style={{
          position: "absolute",
          left: spotlightLeft - spotlightBlur,
          top: diceLineY - spotlightHeight - spotlightBlur,
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
            <LinearGradient id="heroSpotlight" x1="0" y1="0" x2="0" y2="1">
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
            fill="url(#heroSpotlight)"
          />
        </Svg>
      </View>

      {/* Dice stage — positioned so dice land at diceLineY */}
      <View
        pointerEvents="none"
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: layoutWidth,
          height: heroHeight,
          zIndex: 1,
          overflow: "visible",
          backgroundColor: "transparent",
        }}
      >
        <HeroDiceStage
          dice={scatteredDice}
          pipColor="#FFFFFF"
          width={layoutWidth}
          height={heroHeight}
          table={table}
          verticalOffset={0}
        />
      </View>

      {/* Centered content — always centered on all breakpoints */}
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          paddingHorizontal: 24,
          paddingBottom: diceBand.maxSize + (isPhone ? 64 : 80),
          zIndex: 2,
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
