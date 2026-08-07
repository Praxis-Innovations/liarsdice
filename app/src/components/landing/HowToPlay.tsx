import { MotiView } from "moti";
import React from "react";
import { Text, View, useWindowDimensions } from "react-native";
import Svg, { Circle, Path, Rect } from "react-native-svg";
import { headingProps } from "../../lib/heading";
import { isCompactWidth } from "../../lib/breakpoints";
import { useTheme } from "../../theme/ThemeProvider";

function RollIcon({ color }: { color: string }) {
  return (
    <Svg width={40} height={40} viewBox="0 0 40 40">
      <Rect x={4} y={4} width={32} height={32} rx={10} fill={color} />
      <Circle cx={14} cy={14} r={3} fill="#fff" />
      <Circle cx={26} cy={14} r={3} fill="#fff" />
      <Circle cx={14} cy={26} r={3} fill="#fff" />
      <Circle cx={26} cy={26} r={3} fill="#fff" />
      <Circle cx={20} cy={20} r={3} fill="#fff" />
    </Svg>
  );
}

function BidIcon({ color }: { color: string }) {
  return (
    <Svg width={40} height={40} viewBox="0 0 40 40">
      <Path
        d="M6 10a6 6 0 0 1 6-6h16a6 6 0 0 1 6 6v10a6 6 0 0 1-6 6H16l-8 8v-8a6 6 0 0 1-6-6z"
        fill={color}
      />
      <Rect x={12} y={13} width={16} height={3.5} rx={1.75} fill="#fff" />
      <Rect x={12} y={19} width={10} height={3.5} rx={1.75} fill="#fff" />
    </Svg>
  );
}

function BluffIcon({ color }: { color: string }) {
  return (
    <Svg width={40} height={40} viewBox="0 0 40 40">
      <Circle cx={20} cy={20} r={16} fill={color} />
      <Rect x={17.5} y={10} width={5} height={14} rx={2.5} fill="#fff" />
      <Circle cx={20} cy={28} r={2.6} fill="#fff" />
    </Svg>
  );
}

function TrophyIcon({ color }: { color: string }) {
  return (
    <Svg width={40} height={40} viewBox="0 0 40 40">
      <Path
        d="M12 6h16v9a8 8 0 0 1-16 0z"
        fill={color}
      />
      <Path d="M9 8H6a1 1 0 0 0-1 1v2a6 6 0 0 0 6 6" stroke={color} strokeWidth={2.5} fill="none" />
      <Path d="M31 8h3a1 1 0 0 1 1 1v2a6 6 0 0 1-6 6" stroke={color} strokeWidth={2.5} fill="none" />
      <Rect x={17} y={23} width={6} height={7} fill={color} />
      <Rect x={12} y={30} width={16} height={4} rx={2} fill={color} />
    </Svg>
  );
}

const STEPS = [
  {
    title: "Roll in secret",
    body: "Everyone rolls their dice hidden under a cup — you only see your own.",
    Icon: RollIcon,
  },
  {
    title: "Bid boldly",
    body: "Guess how many of a value are on the table across all hands, or raise the last bid.",
    Icon: BidIcon,
  },
  {
    title: "Call the bluff",
    body: "Think they're lying? Call it. Wrong callers lose a die — so does a bad bluff.",
    Icon: BluffIcon,
  },
  {
    title: "Last die standing wins",
    body: "Keep bidding, bluffing, and calling until one player is the last one left.",
    Icon: TrophyIcon,
  },
];

export function HowToPlay() {
  const { colors, spacing, typography } = useTheme();
  const { width } = useWindowDimensions();
  const isNarrow = isCompactWidth(width);

  return (
    <View style={{ backgroundColor: colors.surface }} className="px-6 py-16 md:px-16 md:py-24">
      <View style={{ maxWidth: 1120, width: "100%", alignSelf: "center" }}>
        <Text
          {...headingProps(2)}
          style={{
            color: colors.textPrimary,
            fontFamily: typography.h1.fontFamily,
            fontSize: isNarrow ? 30 : 36,
            textAlign: "center",
            marginBottom: spacing.xl,
          }}
        >
          How to play
        </Text>

        <View className={isNarrow ? "flex-col" : "flex-row flex-wrap"} style={{ gap: spacing.lg, justifyContent: "center" }}>
          {STEPS.map((step, index) => (
            <MotiView
              key={step.title}
              from={{ opacity: 0, translateY: 24 }}
              animate={{ opacity: 1, translateY: 0 }}
              transition={{ type: "timing", duration: 450, delay: 150 + index * 120 }}
              style={{
                backgroundColor: colors.surfaceRaised,
                borderRadius: 24,
                padding: spacing.lg,
                width: isNarrow ? "100%" : 250,
                gap: spacing.sm,
              }}
            >
              <View
                style={{
                  width: 56,
                  height: 56,
                  borderRadius: 18,
                  alignItems: "center",
                  justifyContent: "center",
                  backgroundColor: colors.background,
                }}
              >
                <step.Icon color={colors.primary} />
              </View>
              <Text
                style={{
                  color: colors.textPrimary,
                  fontFamily: typography.h3.fontFamily,
                  fontSize: typography.h3.fontSize,
                }}
              >
                {step.title}
              </Text>
              <Text
                style={{
                  color: colors.textSecondary,
                  fontFamily: typography.body.fontFamily,
                  fontSize: 15,
                  lineHeight: 22,
                }}
              >
                {step.body}
              </Text>
            </MotiView>
          ))}
        </View>
      </View>
    </View>
  );
}
