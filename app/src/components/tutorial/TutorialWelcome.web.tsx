import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { useTheme } from "../../theme/ThemeProvider";
import { Button } from "../ui/Button";
import { Die } from "../shared/Die";

interface TutorialWelcomeProps {
  onStart: () => void;
  onSkip: () => void;
}

export function TutorialWelcome({ onStart, onSkip }: TutorialWelcomeProps) {
  const { colors, radii, spacing, typography } = useTheme();

  return (
    <View style={[StyleSheet.absoluteFill, { backgroundColor: "rgba(0,0,0,0.6)", justifyContent: "center", alignItems: "center" }]} pointerEvents="auto">
      <View
        className="animate-modal-pop-in motion-reduce:animate-none"
        style={{ width: "100%", maxWidth: 360, paddingHorizontal: spacing.md }}
      >
        <View
          style={{
            backgroundColor: colors.surfaceRaised,
            borderRadius: radii.lg,
            padding: spacing.xl,
            gap: spacing.md,
            alignItems: "center",
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.3,
            shadowRadius: 12,
            elevation: 8,
            borderWidth: 1,
            borderColor: colors.border,
          }}
        >
          <View className="flex-row" style={{ gap: 8 }}>
            {([3, 5, 2] as const).map((face, i) => (
              <View
                key={i}
                className="animate-fade-drop-in motion-reduce:animate-none"
                style={{ animationDelay: `${100 + i * 80}ms` } as object}
              >
                <Die face={face} color={colors.primary} pipColor="#FFFFFF" size={40} />
              </View>
            ))}
          </View>

          <Text
            style={{
              color: colors.accent,
              fontFamily: typography.h2.fontFamily,
              fontSize: 24,
              textAlign: "center",
            }}
          >
            New to Liar's Dice?
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
            Take a quick guided tour to learn how to bid, bluff, and call your opponents' bluffs.
          </Text>

          <View style={{ width: "100%", gap: spacing.sm, marginTop: spacing.xs }}>
            <Button label="Learn to Play" fullWidth labelFontSize={16} onPress={onStart} />
            <Pressable onPress={onSkip} hitSlop={8} style={{ alignSelf: "center", paddingVertical: spacing.xs }}>
              <Text
                style={{
                  color: colors.textSecondary,
                  fontFamily: typography.caption.fontFamily,
                  fontSize: 13,
                }}
              >
                Skip — I know the rules
              </Text>
            </Pressable>
          </View>
        </View>
      </View>
    </View>
  );
}
