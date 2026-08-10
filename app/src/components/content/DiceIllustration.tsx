import { MotiView } from "moti";
import React from "react";
import { Text, View } from "react-native";
import { useTheme } from "../../theme/ThemeProvider";
import { Die, type DieFace } from "../shared/Die";

/** Always reserve the same frame so highlight borders don't change die size in a row. */
const HIGHLIGHT_BORDER = 2.5;
const HIGHLIGHT_PAD = 1.5;

function DieSlot({
  face,
  size,
  isHighlighted,
  isWild,
  accentColor,
  wildColor,
  dieColor,
  emptyColor,
}: {
  face: DieFace | null;
  size: number;
  isHighlighted: boolean;
  isWild: boolean;
  accentColor: string;
  wildColor: string;
  dieColor: string;
  emptyColor: string;
}) {
  return (
    <View
      style={{
        borderRadius: size * 0.24 + HIGHLIGHT_BORDER + HIGHLIGHT_PAD,
        borderWidth: HIGHLIGHT_BORDER,
        borderColor: isWild ? wildColor : isHighlighted ? accentColor : "transparent",
        padding: HIGHLIGHT_PAD,
      }}
    >
      <Die face={face} color={face === null ? emptyColor : dieColor} pipColor="#FFFFFF" size={size} />
    </View>
  );
}

interface DiceExampleProps {
  label: string;
  dice: (DieFace | null)[];
  highlightValues?: number[];
  wildHighlight?: boolean;
  caption?: string;
}

export function DiceExample({ label, dice, highlightValues = [], wildHighlight = false, caption }: DiceExampleProps) {
  const { colors, spacing, typography } = useTheme();
  const dieSize = 44;

  return (
    <MotiView
      from={{ opacity: 0, translateY: 8 }}
      animate={{ opacity: 1, translateY: 0 }}
      transition={{ type: "timing", duration: 400 }}
      style={{
        backgroundColor: colors.surfaceRaised,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: colors.border,
        padding: spacing.md,
        gap: spacing.sm,
        marginVertical: spacing.sm,
      }}
    >
      <Text style={{ fontFamily: typography.bodySemibold.fontFamily, fontSize: 18, color: colors.textPrimary }}>
        {label}
      </Text>
      <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8, alignItems: "center" }}>
        {dice.map((face, i) => {
          const isHighlighted = face !== null && highlightValues.includes(face);
          const isWild = wildHighlight && face === 1;
          return (
            <DieSlot
              key={i}
              face={face}
              size={dieSize}
              isHighlighted={isHighlighted}
              isWild={isWild}
              accentColor={colors.accent}
              wildColor={colors.secondary}
              dieColor={colors.primary}
              emptyColor={colors.surface}
            />
          );
        })}
      </View>
      {caption && (
        <Text
          style={{
            fontFamily: typography.caption.fontFamily,
            fontSize: typography.caption.fontSize,
            color: colors.textSecondary,
            lineHeight: typography.caption.lineHeight,
          }}
        >
          {caption}
        </Text>
      )}
    </MotiView>
  );
}

interface PlayerHand {
  name: string;
  dice: (DieFace | null)[];
  isYou?: boolean;
}

interface GameScenarioProps {
  title: string;
  players: PlayerHand[];
  bid?: string;
  result?: string;
  highlightValues?: number[];
  wildHighlight?: boolean;
}

export function GameScenario({ title, players, bid, result, highlightValues = [], wildHighlight = false }: GameScenarioProps) {
  const { colors, spacing, typography } = useTheme();
  const dieSize = 36;

  return (
    <MotiView
      from={{ opacity: 0, translateY: 8 }}
      animate={{ opacity: 1, translateY: 0 }}
      transition={{ type: "timing", duration: 400 }}
      style={{
        backgroundColor: colors.surfaceRaised,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: colors.border,
        padding: spacing.md,
        gap: spacing.md,
        marginVertical: spacing.sm,
      }}
    >
      <Text style={{ fontFamily: typography.h3.fontFamily, fontSize: typography.body.fontSize, color: colors.textPrimary }}>
        {title}
      </Text>

      {players.map((player) => (
        <View key={player.name} style={{ gap: 6 }}>
          <Text
            style={{
              fontFamily: typography.bodyMedium.fontFamily,
              fontSize: typography.caption.fontSize,
              color: player.isYou ? colors.accent : colors.textSecondary,
            }}
          >
            {player.name}{player.isYou ? " (You)" : ""}
          </Text>
          <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 6, alignItems: "center" }}>
            {player.dice.map((face, i) => {
              const isHighlighted = face !== null && highlightValues.includes(face);
              const isWild = wildHighlight && face === 1;
              return (
                <DieSlot
                  key={i}
                  face={face}
                  size={dieSize}
                  isHighlighted={isHighlighted}
                  isWild={isWild}
                  accentColor={colors.accent}
                  wildColor={colors.secondary}
                  dieColor={colors.primary}
                  emptyColor={colors.surface}
                />
              );
            })}
          </View>
        </View>
      ))}

      {bid && (
        <View
          style={{
            backgroundColor: colors.surface,
            borderRadius: 12,
            paddingHorizontal: spacing.md,
            paddingVertical: spacing.sm,
          }}
        >
          <Text style={{ fontFamily: typography.bodySemibold.fontFamily, fontSize: 18, color: colors.accentText }}>
            Current bid: {bid}
          </Text>
        </View>
      )}

      {result && (
        <Text style={{ fontFamily: typography.bodyMedium.fontFamily, fontSize: 18, color: colors.secondary }}>
          {result}
        </Text>
      )}
    </MotiView>
  );
}

export function DiceDivider() {
  const { colors, spacing } = useTheme();
  const faces: DieFace[] = [2, 5, 3];

  return (
    <View style={{ flexDirection: "row", justifyContent: "center", alignItems: "center", gap: 10, paddingVertical: spacing.lg }}>
      <View style={{ flex: 1, height: 1, backgroundColor: colors.border }} />
      {faces.map((face, i) => (
        <View key={i} style={{ opacity: 0.25 }}>
          <Die face={face} color={colors.textSecondary} pipColor={colors.background} size={18} />
        </View>
      ))}
      <View style={{ flex: 1, height: 1, backgroundColor: colors.border }} />
    </View>
  );
}
