import { MotiView } from "moti";
import React from "react";
import { Pressable, StyleSheet, Text, View, useWindowDimensions } from "react-native";
import { useTheme } from "../../theme/ThemeProvider";
import { TUTORIAL_STEPS, type TutorialStep } from "./tutorialSteps";

export interface MeasuredRect {
  x: number;
  y: number;
  width: number;
  height: number;
}

interface TutorialOverlayProps {
  stepIndex: number;
  measurements: Record<string, MeasuredRect>;
  containerOffset: { x: number; y: number };
  onNext: () => void;
  onSkip: () => void;
}

const BACKDROP_COLOR = "rgba(0,0,0,0.55)";
const CUTOUT_PAD = 6;
const TOOLTIP_MARGIN = 10;

function StepDots({ current, total }: { current: number; total: number }) {
  const { colors } = useTheme();
  return (
    <View className="flex-row items-center justify-center" style={{ gap: 4, marginTop: 2 }}>
      {Array.from({ length: total }, (_, i) => (
        <View
          key={i}
          style={{
            width: i === current ? 6 : 4,
            height: i === current ? 6 : 4,
            borderRadius: 3,
            backgroundColor: i === current ? colors.accent : colors.border,
          }}
        />
      ))}
    </View>
  );
}

function CompactButton({ label, onPress, colors, typography }: {
  label: string;
  onPress: () => void;
  colors: ReturnType<typeof useTheme>["colors"];
  typography: ReturnType<typeof useTheme>["typography"];
}) {
  return (
    <Pressable
      onPress={onPress}
      style={{
        backgroundColor: colors.primary,
        borderRadius: 999,
        paddingVertical: 8,
        paddingHorizontal: 24,
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <Text style={{ color: colors.primaryText, fontFamily: typography.button.fontFamily, fontSize: 14 }}>
        {label}
      </Text>
    </Pressable>
  );
}

function CutoutBackdrop({
  rect,
  containerHeight,
  interactive,
}: {
  rect: MeasuredRect;
  containerHeight: number;
  interactive: boolean;
}) {
  const { colors } = useTheme();
  const padded = {
    x: Math.max(0, rect.x - CUTOUT_PAD),
    y: Math.max(0, rect.y - CUTOUT_PAD),
    width: rect.width + CUTOUT_PAD * 2,
    height: rect.height + CUTOUT_PAD * 2,
  };

  return (
    <>
      <View
        pointerEvents="auto"
        style={{ position: "absolute", top: 0, left: 0, right: 0, height: Math.max(0, padded.y), backgroundColor: BACKDROP_COLOR }}
      />
      <View
        pointerEvents="auto"
        style={{
          position: "absolute",
          top: padded.y,
          left: 0,
          width: Math.max(0, padded.x),
          height: padded.height,
          backgroundColor: BACKDROP_COLOR,
        }}
      />
      <View
        pointerEvents="auto"
        style={{
          position: "absolute",
          top: padded.y,
          left: padded.x + padded.width,
          right: 0,
          height: padded.height,
          backgroundColor: BACKDROP_COLOR,
        }}
      />
      <View
        pointerEvents="auto"
        style={{
          position: "absolute",
          top: padded.y + padded.height,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: BACKDROP_COLOR,
        }}
      />
      <View
        pointerEvents={interactive ? "none" : "auto"}
        style={{
          position: "absolute",
          top: padded.y,
          left: padded.x,
          width: padded.width,
          height: padded.height,
        }}
      />
      <View
        pointerEvents="none"
        style={{
          position: "absolute",
          top: padded.y,
          left: padded.x,
          width: padded.width,
          height: padded.height,
          borderRadius: 10,
          borderWidth: 2,
          borderColor: colors.accent,
        }}
      />
    </>
  );
}

function getTooltipPosition(
  step: TutorialStep,
  targetRect: MeasuredRect | null,
  containerHeight: number,
): "top" | "bottom" {
  if (!targetRect) return "bottom";

  const cutoutBottom = targetRect.y + targetRect.height + CUTOUT_PAD;
  const cutoutTop = targetRect.y - CUTOUT_PAD;
  const spaceAbove = cutoutTop;
  const spaceBelow = containerHeight - cutoutBottom;

  if (step.position === "above") return "top";
  if (step.position === "below") return "bottom";
  return spaceBelow >= 120 ? "bottom" : "top";
}

export function TutorialOverlay({ stepIndex, measurements, containerOffset, onNext, onSkip }: TutorialOverlayProps) {
  const { colors, radii, spacing, typography } = useTheme();
  const { height: screenHeight, width: screenWidth } = useWindowDimensions();
  const containerHeight = screenHeight - containerOffset.y;

  if (stepIndex >= TUTORIAL_STEPS.length) return null;

  const step = TUTORIAL_STEPS[stepIndex];

  const rawRect = step.targetRef ? measurements[step.targetRef] ?? null : null;
  const targetRect = rawRect
    ? {
        x: rawRect.x - containerOffset.x,
        y: rawRect.y - containerOffset.y,
        width: rawRect.width,
        height: rawRect.height,
      }
    : null;

  const showNextButton = step.action === "tap-continue" || step.action === "celebrate";
  const buttonLabel = step.action === "celebrate" ? "Let's Play!" : "Next";
  const isCentered = !targetRect;
  const tooltipSide = getTooltipPosition(step, targetRect, containerHeight);

  const compact = screenWidth < 480;

  if (isCentered) {
    return (
      <View style={StyleSheet.absoluteFill} pointerEvents="box-none">
        <View pointerEvents="auto" style={[StyleSheet.absoluteFill, { backgroundColor: BACKDROP_COLOR, justifyContent: "center", alignItems: "center" }]}>
          <MotiView
            key={step.id}
            from={{ opacity: 0, translateY: 10 }}
            animate={{ opacity: 1, translateY: 0 }}
            transition={{ type: "timing", duration: 220 }}
            style={{ width: "100%", maxWidth: 320, paddingHorizontal: spacing.md }}
            pointerEvents="auto"
          >
            <View
              style={{
                backgroundColor: colors.surfaceRaised,
                borderRadius: radii.md,
                padding: compact ? spacing.sm : spacing.md,
                gap: 6,
                borderWidth: 1,
                borderColor: colors.border,
              }}
            >
              <Text
                style={{
                  color: colors.accent,
                  fontFamily: typography.bodySemibold.fontFamily,
                  fontSize: compact ? 16 : 17,
                  textAlign: "center",
                }}
              >
                {step.title}
              </Text>
              <Text
                style={{
                  color: colors.textSecondary,
                  fontFamily: typography.body.fontFamily,
                  fontSize: compact ? 12 : 13,
                  lineHeight: compact ? 16 : 18,
                  textAlign: "center",
                }}
              >
                {step.body}
              </Text>

              <View className="flex-row items-center justify-center" style={{ gap: spacing.sm, marginTop: 2 }}>
                {showNextButton ? (
                  <CompactButton label={buttonLabel} onPress={onNext} colors={colors} typography={typography} />
                ) : null}
                <Pressable onPress={onSkip} hitSlop={8}>
                  <Text style={{ color: colors.textSecondary, fontFamily: typography.caption.fontFamily, fontSize: 11, textDecorationLine: "underline" }}>
                    Skip
                  </Text>
                </Pressable>
              </View>

              <StepDots current={stepIndex} total={TUTORIAL_STEPS.length} />
            </View>
          </MotiView>
        </View>
      </View>
    );
  }

  const tooltipStyle =
    tooltipSide === "top"
      ? { top: TOOLTIP_MARGIN }
      : { bottom: TOOLTIP_MARGIN };

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="box-none">
      <CutoutBackdrop
        rect={targetRect!}
        containerHeight={containerHeight}
        interactive={step.allowInteraction}
      />

      <MotiView
        key={step.id}
        from={{ opacity: 0, translateY: tooltipSide === "top" ? -8 : 8 }}
        animate={{ opacity: 1, translateY: 0 }}
        transition={{ type: "timing", duration: 220 }}
        style={{
          position: "absolute",
          ...tooltipStyle,
          left: TOOLTIP_MARGIN,
          right: TOOLTIP_MARGIN,
          maxWidth: 340,
          alignSelf: "center",
        }}
        pointerEvents="auto"
      >
        <View
          style={{
            backgroundColor: colors.surfaceRaised,
            borderRadius: radii.md,
            paddingVertical: compact ? 8 : 10,
            paddingHorizontal: compact ? 12 : 16,
            gap: compact ? 4 : 6,
            borderWidth: 1,
            borderColor: colors.border,
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.25,
            shadowRadius: 8,
            elevation: 6,
          }}
        >
          <Text
            style={{
              color: colors.accent,
              fontFamily: typography.bodySemibold.fontFamily,
              fontSize: compact ? 14 : 15,
              textAlign: "center",
            }}
          >
            {step.title}
          </Text>
          <Text
            style={{
              color: colors.textSecondary,
              fontFamily: typography.body.fontFamily,
              fontSize: compact ? 11 : 12,
              lineHeight: compact ? 15 : 17,
              textAlign: "center",
            }}
          >
            {step.body}
          </Text>

          <View className="flex-row items-center justify-center" style={{ gap: spacing.sm, marginTop: 2 }}>
            {showNextButton ? (
              <CompactButton label={buttonLabel} onPress={onNext} colors={colors} typography={typography} />
            ) : null}
            <Pressable onPress={onSkip} hitSlop={8}>
              <Text style={{ color: colors.textSecondary, fontFamily: typography.caption.fontFamily, fontSize: 11, textDecorationLine: "underline" }}>
                Skip
              </Text>
            </Pressable>
          </View>

          <StepDots current={stepIndex} total={TUTORIAL_STEPS.length} />
        </View>
      </MotiView>
    </View>
  );
}
