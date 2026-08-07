import { Link } from "expo-router";
import Head from "expo-router/head";
import React from "react";
import { Text, View } from "react-native";
import { ContentLayout } from "../../src/components/content/ContentLayout";
import { DataTable } from "../../src/components/content/DataTable";
import { DiceExample, DiceDivider, GameScenario } from "../../src/components/content/DiceIllustration";
import { Callout, Paragraph, Section } from "../../src/components/content/Prose";
import { headingProps } from "../../src/lib/heading";
import { useTheme } from "../../src/theme/ThemeProvider";
import { Button } from "../../src/components/ui/Button";

function Bold({ children }: { children: React.ReactNode }) {
  const { colors, typography } = useTheme();
  return <Text style={{ color: colors.accent, fontFamily: typography.bodySemibold.fontFamily }}>{children}</Text>;
}

function InlineLink({ href, children }: { href: string; children: React.ReactNode }) {
  const { colors } = useTheme();
  return (
    <Link href={href} style={{ color: colors.primary, textDecorationLine: "underline" }}>
      {children}
    </Link>
  );
}

const PROBABILITY_ROWS = [5, 10, 15, 20].map((dice) => [
  dice,
  (dice / 3).toFixed(1),
  "33.3%",
  (dice / 6).toFixed(1),
  "16.7%",
]);

export default function StrategyPage() {
  const { colors, spacing, typography } = useTheme();

  return (
    <>
      <Head>
        <title>Liar&apos;s Dice Strategy Guide — Probability, Bluffing &amp; Tips</title>
        <meta
          name="description"
          content="Master Liar's Dice with our comprehensive strategy guide. Learn probability math, bluffing tactics, when to challenge or spot on, and advanced tips to win more games of Dudo."
        />
      </Head>
      <ContentLayout title="Liar's Dice Strategy Guide" breadcrumb={[{ label: "Strategy Guide" }]}>
        <Paragraph>
          Winning at Liar&apos;s Dice isn&apos;t just about luck — it&apos;s about understanding probability, reading your
          opponents, and knowing when to bluff. This guide covers everything from the underlying math to advanced bluffing
          tactics.
        </Paragraph>
        <Paragraph>
          New to the game? <InlineLink href="/how-to-play">Learn how to play</InlineLink> first, or review the{" "}
          <InlineLink href="/rules">complete rules reference</InlineLink> before diving into strategy.
        </Paragraph>

        <Section title="Understanding the Probability">
          <Paragraph>
            At its core, Liar&apos;s Dice strategy is built on probability. Every decision — bid, challenge, or Spot On —
            should be informed by the math behind the dice.
          </Paragraph>
          <Callout>
            <Bold>With ones wild (standard rules): </Bold>
            Each unknown die has a <Bold>2/6 (~33.3%)</Bold> chance of matching any non-one face value.{"\n\n"}
            <Bold>Without ones wild (Palifico round): </Bold>
            Each unknown die has only a <Bold>1/6 (~16.7%)</Bold> chance of matching a specific face value.{"\n\n"}
            <Bold>Expected count formula: </Bold>
            Multiply total unknown dice by the probability — 15 unknown dice with ones wild gives 15 × 1/3 = 5.0.
          </Callout>
        </Section>

        <DiceDivider />

        <Section title="Probability Table">
          <Paragraph>
            Use this reference table to quickly estimate how many of a given face value are likely among the hidden dice. Bids
            near or below the expected count are statistically reasonable; bids well above are risky.
          </Paragraph>
          <DataTable
            columns={[
              "Unknown Dice",
              "Expected (Wild)",
              "P(Wild)",
              "Expected (No Wild)",
              "P(No Wild)",
            ]}
            rows={PROBABILITY_ROWS}
          />
          <Callout>
            <Bold>How to use this table: </Bold>
            With 15 unknown dice and ones wild, expect about 5.0 of any given face. A bid of &quot;five threes&quot; is right
            at expected value. &quot;Seven threes&quot; is well above and likely to be challenged. &quot;Three threes&quot; is
            very safe.
          </Callout>
        </Section>

        <DiceDivider />

        <Section title="When to Challenge">
          <Paragraph>
            Knowing when to call &quot;liar&quot; is the most critical skill in the game. Challenge too early and you lose a
            die needlessly; too late and opponents build impossible bids unchecked.
          </Paragraph>
          <Callout>
            <Bold>The 30% rule: </Bold>
            If the probability of the current bid being true drops below roughly 30%, it&apos;s often worth challenging.
            {"\n\n"}
            <Bold>Factor in your own dice: </Bold>
            Always count how many of the bid&apos;s face value (and ones, if wild) you hold.{"\n\n"}
            <Bold>Consider the bidder: </Bold>A conservative player making a high bid likely has the dice to back it up.
          </Callout>
          <GameScenario
            title="Should you challenge?"
            players={[
              { name: "You", dice: [4, 2, 5, 1, 3], isYou: true },
            ]}
            bid='"Six fours" — 15 total dice on the table'
            highlightValues={[4]}
            wildHighlight
            result="You hold 1 four + 1 wild ace = 2 matching. Need 4 more from 10 unknown dice. Expected: ~3.3. Bid is above expected — consider challenging."
          />
        </Section>

        <DiceDivider />

        <Section title="When to Use Spot On">
          <Paragraph>
            &quot;Spot On&quot; is high-risk, high-reward — you&apos;re betting the current bid is exactly correct. If
            right, you regain a lost die; if wrong, you lose one.
          </Paragraph>
          <Callout>
            <Bold>When to consider it: </Bold>
            Most valuable when you&apos;ve already lost dice and need to recover, and the bid is close to expected value.
            {"\n\n"}
            <Bold>The math: </Bold>
            An exact count is always less likely than &quot;at least that many,&quot; so Spot On is inherently riskier.
            {"\n\n"}
            <Bold>Avoid early game: </Bold>
            High variance with many dice makes exact counts unlikely — Spot On is more viable mid-to-late game.
          </Callout>
        </Section>

        <DiceDivider />

        <Section title="Bluffing Strategy">
          <Callout>
            <Bold>Bid on faces you don&apos;t hold: </Bold>
            Disguises your actual hand.{"\n\n"}
            <Bold>Vary your patterns: </Bold>
            Predictability is the worst thing a bluffer can be.{"\n\n"}
            <Bold>Escalate strategically: </Bold>
            A small increase suggests confidence; a wild jump invites a challenge.{"\n\n"}
            <Bold>Read the table: </Bold>
            Bluff when opponents seem uncertain.
          </Callout>
        </Section>

        <DiceDivider />

        <Section title="Reading Your Opponents">
          <Callout>
            <Bold>Track bid patterns: </Bold>
            A player who consistently bids on threes likely holds several.{"\n\n"}
            <Bold>Watch the bid frequency: </Bold>
            Players who keep raising the count on the same face often hold multiples of it.{"\n\n"}
            <Bold>Note challenge timing: </Bold>
            Calibrate your bids based on each opponent&apos;s challenge threshold.{"\n\n"}
            <Bold>Use elimination information: </Bold>
            Revealed dice from previous rounds give you valuable data.
          </Callout>
        </Section>

        <DiceDivider />

        <Section title="Opening Bid Strategy">
          <Callout>
            <Bold>Bid conservatively early: </Bold>
            Start at or below the expected count plus what you hold.{"\n\n"}
            <Bold>Get more aggressive later: </Bold>
            As dice shrink, your hand represents a larger proportion of the total.{"\n\n"}
            <Bold>Consider your position: </Bold>
            Use information from other players&apos; bids if you go later in the order.
          </Callout>
        </Section>

        <DiceDivider />

        <Section title="Palifico Round Strategy">
          <Paragraph>
            A Palifico round is triggered when a player is reduced to a single die. Ones are not wild, and players can only
            raise the quantity. See the <InlineLink href="/rules">rules reference</InlineLink> for full details.
          </Paragraph>
          <Callout>
            <Bold>Adjust your probability math: </Bold>
            Without ones wild, expected counts are halved.{"\n\n"}
            <Bold>Bid what you hold: </Bold>
            Your own die matters enormously — bid on the face value showing on it.{"\n\n"}
            <Bold>Challenge more aggressively: </Bold>
            Bids escalate into improbable territory much faster.
          </Callout>
        </Section>

        <DiceDivider />

        <Section title="Endgame Strategy">
          <Callout>
            <Bold>Your hand is most of the information: </Bold>
            With 2 dice each remaining, you know 50% of all dice in play.{"\n\n"}
            <Bold>Tighten challenge thresholds: </Bold>
            Even a bid of &quot;two&quot; can be risky with only four or five total dice remaining.{"\n\n"}
            <Bold>Bluff with purpose: </Bold>
            Your opponent has strong information too — wild bluffs are more likely to be caught.
          </Callout>
        </Section>

        <DiceDivider />

        <Section title="Common Mistakes">
          <Callout>
            <Bold>Challenging too early: </Bold>
            Bids above your own hand&apos;s expectation are often still true.{"\n\n"}
            <Bold>Challenging too late: </Bold>
            Letting bids spiral out of control forces you into a bad position.{"\n\n"}
            <Bold>Ignoring the ones-wild rule: </Bold>
            Wild ones double the expected count of every face value.{"\n\n"}
            <Bold>Being too predictable: </Bold>
            Good opponents will read and exploit patterns.{"\n\n"}
            <Bold>Neglecting position awareness: </Bold>
            Your seat relative to aggressive and passive players matters.
          </Callout>
        </Section>

        <View style={{ alignItems: "center", marginTop: spacing.lg, gap: spacing.sm }}>
          <Text {...headingProps(2)} style={{ color: colors.textPrimary, fontFamily: typography.h2.fontFamily, fontSize: 22 }}>
            Put Your Strategy to the Test
          </Text>
          <Paragraph>Play against AI opponents online and apply the probability math, bluffing tactics, and reading skills.</Paragraph>
          <Link href="/play" asChild>
            <Button label="Play Liar's Dice Now" />
          </Link>
        </View>

        <Paragraph>
          Still have questions? Check out our <InlineLink href="/faq">frequently asked questions</InlineLink>, or head to the{" "}
          <InlineLink href="/how-to-play">how to play tutorial</InlineLink>.
        </Paragraph>
      </ContentLayout>
    </>
  );
}
