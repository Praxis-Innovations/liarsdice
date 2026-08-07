import { MotiView } from "moti";
import React from "react";
import { Pressable, StyleSheet, Text, View, useWindowDimensions } from "react-native";
import { useTheme } from "../../theme/ThemeProvider";
import { Button } from "../ui/Button";
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
  onNext: () => void;
  onSkip: () => void;
}

const BACKDROP_COLOR = "rgba(0,0,0,0.6)";
const CUTOUT_PAD = 8;
const TOOLTIP_MARGIN = 16;
const ESTIMATED_TOOLTIP_HEIGHT = 220;

function StepDots({ current, total }: { current: number; total: number }) {
  const { colors, spacing } = useTheme();
  return (
    <View className="flex-row items-center justify-center" style={{ gap: 6, marginTop: spacing.sm }}>
      {Array.from({ length: total }, (_, i) => (
        <View
          key={i}
          style={{
            width: i === current ? 8 : 6,
            height: i === current ? 8 : 6,
            borderRadius: 4,
            backgroundColor: i === current ? colors.accent : colors.border,
          }}
        />
      ))}
    </View>
  );
}

function CutoutBackdrop({
  rect,
  screenHeight,
  interactive,
}: {
  rect: MeasuredRect;
  screenHeight: number;
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
      {/* Transparent cutout — passthrough when interactive */}
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
      {/* Highlight border */}
      <View
        pointerEvents="none"
        style={{
          position: "absolute",
          top: padded.y,
          left: padded.x,
          width: padded.width,
          height: padded.height,
          borderRadius: 12,
          borderWidth: 2,
          borderColor: colors.accent,
        }}
      />
    </>
  );
}

function getTooltipTop(
  step: TutorialStep,
  targetRect: MeasuredRect | null,
  screenHeight: number,
): number {
  if (!targetRect) {
    return Math.max(TOOLTIP_MARGIN, (screenHeight - ESTIMATED_TOOLTIP_HEIGHT) / 2);
  }

  const cutoutBottom = targetRect.y + targetRect.height + CUTOUT_PAD;
  const cutoutTop = targetRect.y - CUTOUT_PAD;
  const spaceAbove = cutoutTop;
  const spaceBelow = screenHeight - cutoutBottom;
  const needsAbove =
    step.position === "above" ||
    (step.position === "auto" && spaceBelow < ESTIMATED_TOOLTIP_HEIGHT + TOOLTIP_MARGIN * 2 && spaceAbove > spaceBelow);

  if (needsAbove) {
    return Math.max(TOOLTIP_MARGIN, cutoutTop - ESTIMATED_TOOLTIP_HEIGHT - TOOLTIP_MARGIN);
  }

  return Math.min(cutoutBottom + TOOLTIP_MARGIN, screenHeight - ESTIMATED_TOOLTIP_HEIGHT - TOOLTIP_MARGIN);
}

export function TutorialOverlay({ stepIndex, measurements, onNext, onSkip }: TutorialOverlayProps) {
  const { colors, radii, spacing, typography } = useTheme();
  const { height: screenHeight } = useWindowDimensions();

  if (stepIndex >= TUTORIAL_STEPS.length) return null;

  const step = TUTORIAL_STEPS[stepIndex];
  const targetRect = step.targetRef ? measurements[step.targetRef] ?? null : null;

  const tooltipTop = getTooltipTop(step, targetRect, screenHeight);
  const showNextButton = step.action === "tap-continue" || step.action === "celebrate";
  const buttonLabel = step.action === "celebrate" ? "Let's Play!" : "Next";

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="box-none">
      {targetRect ? (
        <CutoutBackdrop
          rect={targetRect}
          screenHeight={screenHeight}
          interactive={step.allowInteraction}
        />
      ) : (
        <View pointerEvents="auto" style={[StyleSheet.absoluteFill, { backgroundColor: BACKDROP_COLOR }]} />
      )}

      <MotiView
        key={step.id}
        from={{ opacity: 0, translateY: 12 }}
        animate={{ opacity: 1, translateY: 0 }}
        transition={{ type: "timing", duration: 300 }}
        style={{
          position: "absolute",
          top: tooltipTop,
          left: TOOLTIP_MARGIN,
          right: TOOLTIP_MARGIN,
          maxWidth: 400,
          alignSelf: "center",
        }}
        pointerEvents="auto"
      >
        <View
          style={{
            backgroundColor: colors.surfaceRaised,
            borderRadius: radii.lg,
            padding: spacing.lg,
            gap: spacing.sm,
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.3,
            shadowRadius: 12,
            elevation: 8,
            borderWidth: 1,
            borderColor: colors.border,
          }}
        >
          <Text
            style={{
              color: colors.accent,
              fontFamily: typography.h3.fontFamily,
              fontSize: typography.h3.fontSize,
              textAlign: "center",
            }}
          >
            {step.title}
          </Text>
          <Text
            style={{
              color: colors.textSecondary,
              fontFamily: typography.body.fontFamily,
              fontSize: 14,
              lineHeight: 20,
              textAlign: "center",
            }}
          >
            {step.body}
          </Text>

          {showNextButton ? (
            <View style={{ marginTop: spacing.xs }}>
              <Button label={buttonLabel} fullWidth onPress={onNext} />
            </View>
          ) : null}

          <Pressable onPress={onSkip} hitSlop={8} style={{ alignSelf: "center", marginTop: 4 }}>
            <Text
              style={{
                color: colors.textSecondary,
                fontFamily: typography.caption.fontFamily,
                fontSize: 12,
                textDecorationLine: "underline",
              }}
            >
              Skip tutorial
            </Text>
          </Pressable>

          <StepDots current={stepIndex} total={TUTORIAL_STEPS.length} />
        </View>
      </MotiView>
    </View>
  );
}
