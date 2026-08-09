import { MotiView } from "moti";
import React from "react";
import { Text, View } from "react-native";
import type { GameState, Player } from "../../engine/types";
import { headingProps } from "../../lib/heading";
import { useTheme } from "../../theme/ThemeProvider";
import { Button } from "../ui/Button";
import { shortName } from "./shortName";

interface RoundResultProps {
  state: GameState;
  onContinue: () => void;
  animating: boolean;
  /** Phone dock stacks vertically; desktop docks as a wide strip under the table. */
  compact?: boolean;
  /** Fill the reserved controls dock height (mobile) so the table size stays put. */
  fillDock?: boolean;
  maxWidth?: number;
}

function displayName(player: Player | undefined): string {
  if (!player) return "?";
  return player.id === "human" ? "You" : player.name;
}

/** Second-person agreement: "You lose" / "Drake loses". */
function withVerb(name: string, youForm: string, otherForm: string): string {
  return `${name} ${name === "You" ? youForm : otherForm}`;
}

function BidActualColumns({
  bidLabel,
  actualValue,
  actualCaption,
  bidderLabel,
  resultColor,
  valueSize,
  labelSize,
  captionSize,
  dividerWidth,
  padV,
  padH,
  gap,
  grow = false,
  surface,
  textPrimary,
  textSecondary,
  border,
  radii,
  captionFont,
  valueFont,
}: {
  bidLabel: string;
  actualValue: number;
  actualCaption: string;
  bidderLabel: string;
  resultColor: string;
  valueSize: number;
  labelSize: number;
  captionSize: number;
  dividerWidth: number;
  padV: number;
  padH: number;
  gap: number;
  grow?: boolean;
  surface: string;
  textPrimary: string;
  textSecondary: string;
  border: string;
  radii: number;
  captionFont: string;
  valueFont: string;
}) {
  return (
    <View
      style={{
        flex: grow ? 1 : undefined,
        flexDirection: "row",
        alignItems: "center",
        gap: grow ? padH : 6,
        paddingVertical: padV,
        paddingHorizontal: padH,
        borderRadius: radii,
        backgroundColor: surface,
        minWidth: 0,
      }}
    >
      <View style={{ flex: 1, alignItems: "center", gap }}>
        <Text
          style={{
            color: textSecondary,
            fontFamily: captionFont,
            fontSize: labelSize,
            letterSpacing: 0.4,
            textTransform: "uppercase",
          }}
        >
          Bid
        </Text>
        <Text style={{ color: textPrimary, fontFamily: valueFont, fontSize: valueSize }}>{bidLabel}</Text>
        <Text
          style={{ color: textSecondary, fontFamily: captionFont, fontSize: captionSize }}
          numberOfLines={1}
        >
          {bidderLabel}
        </Text>
      </View>

      <View style={{ width: dividerWidth, alignSelf: "stretch", backgroundColor: border }} />

      <View style={{ flex: 1, alignItems: "center", gap }}>
        <Text
          style={{
            color: textSecondary,
            fontFamily: captionFont,
            fontSize: labelSize,
            letterSpacing: 0.4,
            textTransform: "uppercase",
          }}
        >
          Actual
        </Text>
        <Text style={{ color: resultColor, fontFamily: valueFont, fontSize: valueSize }}>{actualValue}</Text>
        <Text style={{ color: textSecondary, fontFamily: captionFont, fontSize: captionSize }}>
          {actualCaption}
        </Text>
      </View>
    </View>
  );
}

/** Challenge / Spot On result — docks under the table (not over the felt). */
export function RoundResult({
  state,
  onContinue,
  animating,
  compact = true,
  fillDock = false,
  maxWidth,
}: RoundResultProps) {
  const { colors, radii, spacing, typography } = useTheme();
  const result = state.lastRoundResult;
  if (!result) return null;

  const challenger = state.players.find((p) => p.id === result.challenger);
  const bidder = state.players.find((p) => p.id === result.challengedPlayer);
  const loser = state.players.find((p) => p.id === result.loser);
  const isSpotOn = result.challengeType === "spot-on";
  const humanWon = result.loser !== "human";
  const resultColor = humanWon ? colors.secondary : colors.danger;
  const challengerName = displayName(challenger);
  const bidderName = displayName(bidder);
  const loserName = displayName(loser);

  const nameCap = compact ? 12 : 18;
  const outcomeLine = result.challengerWins
    ? withVerb(shortName(challengerName, nameCap), "win", "wins")
    : withVerb(shortName(challengerName, nameCap), "lose", "loses");

  let consequence = "";
  if (loser && loser.id !== "") {
    consequence = withVerb(shortName(loserName, nameCap), "lose a die", "loses a die");
    if (loser.diceCount <= 0) consequence += " — out";
    if (result.diceGained) {
      consequence += ` · ${withVerb(shortName(challengerName, nameCap), "gain one", "gains one")}`;
    }
  }

  const title = isSpotOn ? "Spot On!" : "Liar!";
  const bidLabel = `${result.currentBid.quantity}×${result.currentBid.faceValue}`;
  const actualCaption = isSpotOn ? "exact" : "on table";
  const continueLabel = state.gameOver ? "See Results" : "Next Round";
  const bidderShort = shortName(bidderName, nameCap);

  if (!compact) {
    // Desktop / tablet: one wide strip under the table — room for CTA, no felt overlap.
    return (
      <MotiView
        from={{ opacity: animating ? 0 : 1, translateY: animating ? 8 : 0 }}
        animate={{ opacity: 1, translateY: 0 }}
        transition={{ type: "timing", duration: 280 }}
        style={{
          width: "100%",
          maxWidth: maxWidth ?? 960,
          alignSelf: "center",
          backgroundColor: colors.surfaceRaised,
          borderRadius: radii.lg,
          borderWidth: 2,
          borderColor: resultColor,
          paddingVertical: spacing.md,
          paddingHorizontal: spacing.lg,
          flexDirection: "row",
          alignItems: "center",
          gap: spacing.md,
          shadowColor: "#000",
          shadowOpacity: 0.28,
          shadowRadius: 18,
          shadowOffset: { width: 0, height: 8 },
          elevation: 10,
        }}
      >
        <View style={{ flexShrink: 0, gap: 2, minWidth: 120 }}>
          <Text
            {...headingProps(2)}
            style={{
              color: colors.accent,
              fontFamily: typography.h2.fontFamily,
              fontSize: 28,
            }}
          >
            {title}
          </Text>
          <Text
            style={{
              color: resultColor,
              fontFamily: typography.h3.fontFamily,
              fontSize: 16,
            }}
            numberOfLines={1}
          >
            {outcomeLine}
          </Text>
        </View>

        <BidActualColumns
          bidLabel={bidLabel}
          actualValue={result.actualCount}
          actualCaption={actualCaption}
          bidderLabel={bidderShort}
          resultColor={resultColor}
          valueSize={26}
          labelSize={11}
          captionSize={12}
          dividerWidth={2}
          padV={spacing.sm}
          padH={spacing.md}
          gap={2}
          grow
          surface={colors.surface}
          textPrimary={colors.textPrimary}
          textSecondary={colors.textSecondary}
          border={colors.border}
          radii={radii.md}
          captionFont={typography.caption.fontFamily}
          valueFont={typography.h3.fontFamily}
        />

        {consequence ? (
          <Text
            style={{
              color: resultColor,
              fontFamily: typography.h3.fontFamily,
              fontSize: 16,
              flexShrink: 1,
              maxWidth: 160,
            }}
            numberOfLines={2}
          >
            {consequence}
          </Text>
        ) : null}

        <Button
          label={continueLabel}
          variant="primary"
          onPress={onContinue}
          labelFontSize={17}
          style={{ flexShrink: 0, minWidth: 150, paddingHorizontal: spacing.lg }}
        />
      </MotiView>
    );
  }

  // Phone: stacked dock card — fillDock expands into the bid/button area.
  const pad = fillDock ? spacing.md : spacing.sm;
  const titleSize = fillDock ? 24 : 18;
  const outcomeSize = fillDock ? 16 : 14;
  const valueSize = fillDock ? 22 : 16;
  return (
    <MotiView
      from={{ opacity: animating ? 0 : 1, scale: animating ? 0.96 : 1 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ type: "timing", duration: 280 }}
      style={{
        backgroundColor: colors.surfaceRaised,
        borderRadius: radii.md,
        padding: pad,
        gap: fillDock ? spacing.sm : 6,
        width: "100%",
        maxWidth: maxWidth ?? 280,
        flex: fillDock ? 1 : undefined,
        height: fillDock ? "100%" : undefined,
        justifyContent: fillDock ? "space-between" : undefined,
        borderWidth: fillDock ? 2 : 1,
        borderColor: fillDock ? resultColor : colors.border,
        shadowColor: "#000",
        shadowOpacity: 0.12,
        shadowRadius: 10,
        shadowOffset: { width: 0, height: 3 },
        elevation: 4,
      }}
    >
      <View style={{ alignItems: "center", gap: fillDock ? 4 : 0 }}>
        {fillDock ? (
          <>
            <Text
              {...headingProps(2)}
              style={{
                color: colors.accent,
                fontFamily: typography.h2.fontFamily,
                fontSize: titleSize,
                textAlign: "center",
              }}
            >
              {title}
            </Text>
            <Text
              style={{
                color: resultColor,
                fontFamily: typography.h3.fontFamily,
                fontSize: outcomeSize,
                textAlign: "center",
              }}
              numberOfLines={1}
            >
              {outcomeLine}
            </Text>
          </>
        ) : (
          <View className="flex-row items-center justify-between" style={{ gap: 8, width: "100%" }}>
            <Text
              {...headingProps(2)}
              style={{
                color: colors.accent,
                fontFamily: typography.h2.fontFamily,
                fontSize: titleSize,
                flexShrink: 0,
              }}
            >
              {title}
            </Text>
            <Text
              style={{
                color: resultColor,
                fontFamily: typography.h3.fontFamily,
                fontSize: outcomeSize,
                flex: 1,
                textAlign: "right",
              }}
              numberOfLines={1}
            >
              {outcomeLine}
            </Text>
          </View>
        )}
      </View>

      <BidActualColumns
        bidLabel={bidLabel}
        actualValue={result.actualCount}
        actualCaption={actualCaption}
        bidderLabel={bidderShort}
        resultColor={resultColor}
        valueSize={valueSize}
        labelSize={10}
        captionSize={11}
        dividerWidth={1}
        padV={fillDock ? spacing.sm : 4}
        padH={fillDock ? spacing.sm : 8}
        gap={fillDock ? 2 : 1}
        surface={colors.surface}
        textPrimary={colors.textPrimary}
        textSecondary={colors.textSecondary}
        border={colors.border}
        radii={radii.sm}
        captionFont={typography.caption.fontFamily}
        valueFont={typography.h3.fontFamily}
      />

      {consequence ? (
        <View
          style={{
            borderRadius: radii.sm,
            paddingVertical: fillDock ? 10 : 6,
            paddingHorizontal: spacing.sm,
            borderWidth: fillDock ? 2 : 0,
            borderColor: resultColor,
            backgroundColor: fillDock ? colors.surface : "transparent",
            alignItems: "center",
          }}
        >
          <Text
            style={{
              color: resultColor,
              fontFamily: typography.h3.fontFamily,
              fontSize: fillDock ? 16 : 14,
              textAlign: "center",
            }}
            numberOfLines={2}
          >
            {consequence}
          </Text>
        </View>
      ) : null}

      <Button
        label={continueLabel}
        variant="primary"
        fullWidth
        compact={!fillDock}
        onPress={onContinue}
      />
    </MotiView>
  );
}
