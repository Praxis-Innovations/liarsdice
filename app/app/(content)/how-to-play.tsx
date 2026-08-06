import { Link } from "expo-router";
import Head from "expo-router/head";
import React from "react";
import { Text, View } from "react-native";
import { ContentLayout } from "../../src/components/content/ContentLayout";
import { BulletList, Callout, NumberedList, Paragraph, Section } from "../../src/components/content/Prose";
import { headingProps } from "../../src/lib/heading";
import { useTheme } from "../../src/theme/ThemeProvider";
import { Button } from "../../src/components/ui/Button";

function Bold({ children }: { children: React.ReactNode }) {
  const { colors, typography } = useTheme();
  return <Text style={{ color: colors.textPrimary, fontFamily: typography.bodySemibold.fontFamily }}>{children}</Text>;
}

function InlineLink({ href, children }: { href: string; children: React.ReactNode }) {
  const { colors } = useTheme();
  return (
    <Link href={href} style={{ color: colors.primary, textDecorationLine: "underline" }}>
      {children}
    </Link>
  );
}

export default function HowToPlayPage() {
  const { colors, spacing, typography } = useTheme();

  return (
    <>
      <Head>
        <title>How to Play Liar&apos;s Dice — Beginner&apos;s Tutorial &amp; Step-by-Step Guide</title>
        <meta
          name="description"
          content="Learn how to play Liar's Dice (Dudo) with this beginner-friendly tutorial. Step-by-step rules for bidding, bluffing, wild aces, palifico rounds, and winning strategies."
        />
      </Head>
      <ContentLayout title="How to Play Liar's Dice: A Complete Beginner's Tutorial" breadcrumb={[{ label: "How to Play" }]}>
        <Paragraph>
          Liar&apos;s Dice is a classic bluffing dice game where players make increasingly bold claims about the dice hidden
          under everyone&apos;s cups. Also known as <Bold>Dudo</Bold>, <Bold>Cacho</Bold>, or <Bold>Perudo</Bold>, the game
          combines probability, deception, and nerve. This step-by-step tutorial will have you playing confidently in minutes.
        </Paragraph>
        <Paragraph>
          Want to dive right in? <InlineLink href="/play">Play Liar&apos;s Dice online for free</InlineLink> against AI
          opponents, or read on for the full breakdown. For a concise reference during a game, see our{" "}
          <InlineLink href="/rules">complete rules page</InlineLink>.
        </Paragraph>

        <Section title="What You Need">
          <Paragraph>
            Liar&apos;s Dice requires minimal equipment, which is one reason it has been popular for centuries across{" "}
            <InlineLink href="/history">cultures around the world</InlineLink>. Here is what you need:
          </Paragraph>
          <BulletList
            items={[
              <>
                <Bold>2 to 6 players</Bold> — the game works with as few as two, but three to six create the most exciting
                bluffing dynamics.
              </>,
              <>
                <Bold>Five six-sided dice per player</Bold> — standard dice numbered 1 to 6.
              </>,
              <>
                <Bold>One opaque cup per player</Bold> — any cup, shaker, or container that hides your dice.
              </>,
            ]}
          />
          <Paragraph>
            No dice or cups on hand? <InlineLink href="/play">Our free online version</InlineLink> handles all the equipment
            for you.
          </Paragraph>
        </Section>

        <Section title="Setting Up the Game">
          <Paragraph>Setting up a round takes less than a minute. Follow these steps before each round:</Paragraph>
          <NumberedList
            items={[
              "Each player places all of their remaining dice into their cup.",
              "Everyone shakes their cup simultaneously, then places it upside-down on the table.",
              "Each player lifts the edge of their cup to peek at their own dice.",
              "Choose a starting player — randomly for round one, then the loser of the previous challenge starts.",
            ]}
          />
          <Callout>
            <Bold>Key concept: </Bold>
            No one knows what anyone else rolled. You can see only your own dice. The total pool of all dice on the table is
            what bids refer to.
          </Callout>
        </Section>

        <Section title="How Bidding Works">
          <Paragraph>
            Bidding is the heart of Liar&apos;s Dice. On your turn you claim how many dice of a particular face value exist
            among all players&apos; dice combined — not just your own.
          </Paragraph>
          <Callout>
            <Bold>Anatomy of a bid: </Bold>A bid has a <Bold>quantity</Bold> and a <Bold>face value</Bold>. &quot;Four
            threes&quot; means you claim at least four dice showing 3 among every player&apos;s hidden dice.
          </Callout>
          <Paragraph>After the opening bid, each player must raise the bid. You can raise in three ways:</Paragraph>
          <NumberedList
            items={[
              <>
                <Bold>Increase the quantity</Bold> while keeping the same face value or choosing higher.
              </>,
              <>
                <Bold>Increase the face value</Bold> while keeping the same quantity.
              </>,
              <>
                <Bold>Switch to or from aces (ones)</Bold> — special rules apply, covered in Wild Aces below.
              </>,
            ]}
          />
          <Paragraph>You may never lower the bid. Bids keep climbing until someone calls the bidder a liar.</Paragraph>
        </Section>

        <Section title="Wild Aces">
          <Paragraph>
            One of the most important rules for beginners: <Bold>ones (aces) are wild</Bold>. Every die showing a 1 counts as
            whatever face value is being bid on.
          </Paragraph>
          <Callout>
            <Bold>Example: </Bold>
            15 dice on the table, bid is &quot;five sixes.&quot; There are three dice showing 6 and three showing 1. Because
            aces are wild, the true count is six — the bid is met.
          </Callout>
          <Paragraph>
            One critical exception: <Bold>if a player opens the round by bidding on ones</Bold>, aces are no longer wild for the
            rest of that round.
          </Paragraph>
          <Paragraph>When switching between aces and other face values mid-round, special conversion rules apply:</Paragraph>
          <BulletList
            items={[
              <>
                <Bold>Moving to aces:</Bold> the quantity must be at least half the current bid&apos;s quantity, rounded up.
              </>,
              <>
                <Bold>Moving from aces to a regular face:</Bold> the quantity must be at least double the current aces bid plus
                one.
              </>,
            ]}
          />
        </Section>

        <Section title='Calling "Liar!" (Challenge)'>
          <Paragraph>
            Instead of raising, you can <Bold>challenge</Bold> the previous bid by calling &quot;Liar!&quot; This is the
            climactic moment of every round.
          </Paragraph>
          <Paragraph>
            When called, all players reveal their dice. Everyone counts the dice matching the bid&apos;s face value, plus any
            wild aces.
          </Paragraph>
          <Callout>
            <Bold>If the bid is met or exceeded: </Bold>
            the challenger loses one die.{"\n"}
            <Bold>If the bid is not met: </Bold>
            the bidder loses one die.
          </Callout>
          <Paragraph>
            After a challenge resolves, the player who lost a die starts the next round, and bidding begins again from scratch.
          </Paragraph>
        </Section>

        <Section title="Spot On Calls">
          <Paragraph>
            Many groups also play an optional third action: <Bold>Spot On</Bold> (&quot;Calza&quot;). You declare that the
            current bid is exactly correct.
          </Paragraph>
          <BulletList
            items={[
              <>
                <Bold>If you are right:</Bold> you gain one die back (up to five). The only way to recover lost dice.
              </>,
              <>
                <Bold>If you are wrong:</Bold> you lose one die.
              </>,
            ]}
          />
          <Callout>
            <Bold>Tip: </Bold>
            Spot On calls become more viable when fewer dice are on the table. Learn more in our{" "}
            <InlineLink href="/strategy">strategy guide</InlineLink>.
          </Callout>
        </Section>

        <Section title="Palifico Rounds">
          <Paragraph>
            A <Bold>palifico round</Bold> is a special round triggered when a player is reduced to exactly one die.
          </Paragraph>
          <NumberedList
            items={[
              <>
                <Bold>Aces are not wild.</Bold> Ones count only as ones.
              </>,
              <>
                <Bold>Players must raise only the quantity</Bold>, not the face value.
              </>,
              <>
                <Bold>Exception for the opener:</Bold> the player who triggers the round may choose any face value; after that
                it&apos;s locked.
              </>,
            ]}
          />
          <Callout>
            Palifico rounds only happen once per player — even if they drop to one die again later, it won&apos;t trigger a
            second time.
          </Callout>
        </Section>

        <Section title="Winning the Game">
          <Paragraph>
            Each time you lose a challenge, you lose one die. When you lose your last die, you are eliminated. The{" "}
            <Bold>last player with dice remaining wins</Bold>.
          </Paragraph>
          <Paragraph>
            A typical game with four to five players lasts around 20 to 30 minutes. For edge cases and house variations, visit
            our <InlineLink href="/rules">detailed rules reference</InlineLink>.
          </Paragraph>
        </Section>

        <Section title="Tips for Beginners">
          <NumberedList
            items={[
              <>
                <Bold>Remember that aces are wild.</Bold> Bids sound higher than they really are once you factor in wild ones.
              </>,
              <>
                <Bold>Use the one-third rule.</Bold> With wild aces, the expected count of any face value is roughly one-third
                of the total dice in play.
              </>,
              <>
                <Bold>Pay attention to other players&apos; bids.</Bold> Confident early bids often mean strong hands.
              </>,
              <>
                <Bold>Bluff deliberately, not randomly.</Bold> Good bluffs force a tough decision on the next player.
              </>,
              <>
                <Bold>Don&apos;t challenge too early.</Bold> Let bids climb further before committing to a challenge.
              </>,
              <>
                <Bold>Be cautious in palifico rounds.</Bold> Without wild aces, the math changes dramatically.
              </>,
              <>
                <Bold>Practice online.</Bold> Playing against AI lets you experiment with strategies risk-free.
              </>,
            ]}
          />
          <Paragraph>
            Ready to level up? Our <InlineLink href="/strategy">strategy guide</InlineLink> covers probability tables and
            advanced bluffing techniques.
          </Paragraph>
        </Section>

        <View style={{ alignItems: "center", marginTop: spacing.lg, gap: spacing.sm }}>
          <Text {...headingProps(2)} style={{ color: colors.textPrimary, fontFamily: typography.h2.fontFamily, fontSize: 22 }}>
            Ready to Play?
          </Text>
          <Paragraph>Put your new knowledge to the test — no sign-up required.</Paragraph>
          <Link href="/play" asChild>
            <Button label="Play Liar's Dice Online — Free" />
          </Link>
        </View>
      </ContentLayout>
    </>
  );
}
