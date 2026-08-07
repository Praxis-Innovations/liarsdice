import { Link } from "expo-router";
import Head from "expo-router/head";
import React from "react";
import { Text, View } from "react-native";
import { BulletList, Callout, NumberedList, Paragraph, Section, SubSection } from "../../src/components/content/Prose";
import { ContentLayout } from "../../src/components/content/ContentLayout";
import { DiceExample, DiceDivider, GameScenario } from "../../src/components/content/DiceIllustration";
import { useTheme } from "../../src/theme/ThemeProvider";
import { Button } from "../../src/components/ui/Button";
import { headingProps } from "../../src/lib/heading";

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

export default function RulesPage() {
  const { colors, spacing, typography } = useTheme();

  return (
    <>
      <Head>
        <title>Liar&apos;s Dice Rules — Complete Official Rules &amp; Variations</title>
        <meta
          name="description"
          content="Complete rules for Liar's Dice (Dudo). Learn bidding, wild aces, palifico rounds, spot on calls, and all official rules with examples. 2-6 players."
        />
      </Head>
      <ContentLayout title="Liar's Dice Rules" breadcrumb={[{ label: "Rules" }]}>
        <Paragraph>
          Liar&apos;s Dice (also called <Bold>Dudo</Bold>) is a classic bluffing dice game for 2 to 6 players. Each player rolls
          dice hidden under a cup, then takes turns making increasingly bold claims about all the dice on the table. Bluff
          convincingly, read your opponents, and be the last player standing. These are the complete, official rules used in our{" "}
          <InlineLink href="/play">free online version</InlineLink>.
        </Paragraph>
        <Paragraph>
          New to the game? Start with our <InlineLink href="/how-to-play">beginner-friendly How to Play guide</InlineLink> for a
          quicker introduction, then return here for the full rules reference.
        </Paragraph>

        <Section title="Overview">
          <Paragraph>
            Liar&apos;s Dice is a game of deduction, probability, and deception. Players make bids about the total quantity of a
            particular face value among <Bold>all dice on the table</Bold>, not just their own. When a player believes the
            current bid is too high, they challenge it by calling <Bold>&quot;Liar!&quot;</Bold> and all dice are revealed.
          </Paragraph>
          <BulletList
            items={[
              <>
                <Bold>Players:</Bold> 2 to 6
              </>,
              <>
                <Bold>Equipment:</Bold> 5 standard six-sided dice per player, plus an opaque cup for each player
              </>,
              <>
                <Bold>Objective:</Bold> Be the last player with dice remaining
              </>,
              <>
                <Bold>Skill level:</Bold> Easy to learn, difficult to master — combines probability, psychology, and bluffing
              </>,
            ]}
          />
        </Section>

        <DiceDivider />

        <Section title="Setup">
          <Paragraph>Getting started is simple:</Paragraph>
          <NumberedList
            items={[
              <>
                Each player receives <Bold>5 dice</Bold> and a <Bold>cup</Bold>.
              </>,
              "All players simultaneously shake their dice in the cup and slam it face-down on the table.",
              "Each player lifts the edge of their cup to peek at their own dice without revealing them to anyone else.",
              "A starting player is chosen (randomly, or the loser of the previous round goes first).",
            ]}
          />
          <DiceExample
            label="You peek under your cup:"
            dice={[3, 3, 5, 6, 1]}
            caption="These are your 5 dice. No one else can see them."
          />
          <Paragraph>
            Your own dice are the only certain information you have. Everything else is a matter of deduction, estimation, and
            reading your opponents.
          </Paragraph>
        </Section>

        <DiceDivider />

        <Section title="Wild Aces Rules">
          <Paragraph>
            Before the bidding rules make sense, learn this key concept: by default, <Bold>ones (aces) are wild</Bold>.
            Any die showing a 1 counts as whatever face value is being bid on. Wild aces effectively double the
            probability of any given face value appearing.
          </Paragraph>
          <DiceExample
            label="Wild aces example — bid is &quot;four threes&quot;:"
            dice={[3, 5, 1, 3, 2, 6, 1, 3, 4, 2]}
            highlightValues={[3]}
            wildHighlight
            caption="3 threes (gold) + 2 wild aces (green) = 5 total. The bid of four threes is met."
          />

          <SubSection title="When Ones Are Not Wild">
            <Paragraph>
              There is one important exception: <Bold>if the first bid of a round is made on ones themselves</Bold> (e.g.,
              &quot;two ones&quot;), then ones are <Bold>not wild</Bold> for that entire round. This makes bidding on ones a
              powerful strategic choice.
            </Paragraph>
            <Paragraph>Ones are also not wild during Palifico rounds.</Paragraph>
          </SubSection>
        </Section>

        <DiceDivider />

        <Section title="Ones Bid Transitions">
          <Paragraph>
            Because ones are wild, switching between bidding on ones and bidding on other face values follows special quantity
            rules.
          </Paragraph>

          <SubSection title="Switching from Non-Ones to Ones">
            <Paragraph>
              The minimum quantity for your ones bid must be at least the ceiling of half the current quantity:{" "}
              <Text style={{ backgroundColor: colors.surface, fontFamily: "Manrope_600SemiBold", fontSize: 13 }}>
                {" "}
                ones quantity &ge; ceil(current quantity / 2){" "}
              </Text>
              .
            </Paragraph>
            <Callout>
              <Bold>Example: </Bold>
              The current bid is &quot;six fours.&quot; To switch to ones, you need at least ceil(6 / 2) = 3. So &quot;three
              ones&quot; is the minimum valid ones bid.
            </Callout>
          </SubSection>

          <SubSection title="Switching from Ones to Non-Ones">
            <Paragraph>
              The minimum quantity for your new bid must be at least double the ones quantity plus one:{" "}
              <Text style={{ backgroundColor: colors.surface, fontFamily: "Manrope_600SemiBold", fontSize: 13 }}>
                {" "}
                new quantity &ge; ones quantity &times; 2 + 1{" "}
              </Text>
              .
            </Paragraph>
            <Callout>
              <Bold>Example: </Bold>
              The current bid is &quot;three ones.&quot; To switch to any non-one face value, you need at least 3 &times; 2 + 1
              = 7.
            </Callout>
          </SubSection>

          <Paragraph>
            These transition rules only apply when ones are wild. During rounds where ones are not wild, bids simply follow the
            normal raising rules.
          </Paragraph>
        </Section>

        <DiceDivider />

        <Section title="Bidding Rules">
          <Paragraph>
            On your turn, you must make a <Bold>bid</Bold> about how many dice of a particular face value are on the table
            (among all players&apos; dice combined). Unless ones were opened as the first bid, wild aces count toward that
            face value. A bid consists of two parts:
          </Paragraph>
          <BulletList
            items={[
              <>
                <Bold>Quantity:</Bold> How many dice you claim are showing a particular value (including wild aces)
              </>,
              <>
                <Bold>Face value:</Bold> Which number on the die
              </>,
            ]}
          />
          <Callout>
            <Bold>Example: </Bold>
            &quot;Three fives&quot; means you claim there are at least 3 dice showing a 5 — counting wild aces — among all
            players&apos; dice on the table.
          </Callout>
          <Paragraph>
            Each subsequent bid must <Bold>raise</Bold> the stakes. There are two ways to raise:
          </Paragraph>
          <BulletList
            items={[
              <>
                <Bold>Increase the quantity</Bold> — bid a higher number of any face value
              </>,
              <>
                <Bold>Increase the face value at the same quantity</Bold> — keep the same count but name a higher face
              </>,
            ]}
          />
          <Callout>
            <Bold>Example: </Bold>
            The current bid is &quot;three fours.&quot; Valid raises include &quot;three fives,&quot; &quot;three sixes,&quot;
            &quot;four twos,&quot; &quot;five threes,&quot; and so on. &quot;Three threes&quot; or &quot;two sixes&quot; would be
            invalid because neither the quantity nor the face value has increased. Switching to or from ones uses the
            transition rules above.
          </Callout>
          <Paragraph>
            If you don&apos;t want to raise the bid, you must instead challenge the previous player&apos;s bid. You are never
            allowed to pass.
          </Paragraph>
        </Section>

        <DiceDivider />

        <Section title='Challenging ("Liar!")'>
          <Paragraph>
            Instead of raising the bid, you may <Bold>challenge</Bold> the previous player&apos;s bid by calling{" "}
            <Bold>&quot;Liar!&quot;</Bold> (also known as &quot;Dudo&quot;). This is the core mechanism that makes the game
            exciting.
          </Paragraph>
          <Paragraph>When a challenge is called:</Paragraph>
          <NumberedList
            items={[
              <>
                <Bold>All players</Bold> lift their cups and reveal their dice.
              </>,
              "The total number of dice matching the bid's face value is counted across the entire table (wild ones count too).",
              <>
                The bid is compared against the actual count: if it&apos;s <Bold>equal to or greater than</Bold> the bid
                quantity, the <Bold>challenger</Bold> loses a die. If it&apos;s <Bold>less than</Bold> the bid quantity, the{" "}
                <Bold>bidder</Bold> loses a die.
              </>,
            ]}
          />
          <GameScenario
            title="Challenge resolution"
            players={[
              { name: "Alice", dice: [3, 5, 3, 2, 6] },
              { name: "Bob", dice: [4, 1, 3, 5, 1] },
              { name: "Carlos", dice: [3, 6, 2, 4, 1] },
            ]}
            bid='"Five threes" — Bob calls Liar!'
            highlightValues={[3]}
            wildHighlight
            result="4 threes + 3 wild aces = 7 total. Bid of 5 is met — Bob (the challenger) loses a die."
          />
          <Paragraph>
            After a challenge is resolved, the player who lost a die starts the next round. All players re-roll their remaining
            dice.
          </Paragraph>
        </Section>

        <DiceDivider />

        <Section title="Spot On (Optional Rule)">
          <Paragraph>
            A player may declare <Bold>&quot;Spot On!&quot;</Bold> (sometimes called &quot;Calza&quot;) — a claim that the
            current bid is <Bold>exactly correct</Bold>.
          </Paragraph>
          <BulletList
            items={[
              <>
                If the count is <Bold>exactly equal</Bold> to the bid, the caller <Bold>gains one die back</Bold> (up to a
                maximum of 5).
              </>,
              <>
                If the count is anything other than exactly equal, the caller <Bold>loses one die</Bold>.
              </>,
            ]}
          />
          <Callout>
            <Bold>Example: </Bold>
            Carlos bids &quot;four sixes.&quot; Diana calls &quot;Spot On!&quot; There are exactly 4 sixes on the table. Diana is
            correct and gains a die back.
          </Callout>
          <Paragraph>
            The Spot On call cannot be made by the player who just placed the bid — only a different player can call it.
          </Paragraph>
        </Section>

        <DiceDivider />

        <Section title="Palifico Rounds">
          <Paragraph>
            A <Bold>Palifico round</Bold> is a special restricted round triggered when a player is reduced to{" "}
            <Bold>exactly 1 die</Bold>. Each player can only trigger one Palifico round over the course of the game.
          </Paragraph>
          <DiceExample
            label="A player is down to one die:"
            dice={[4]}
            caption="Palifico round triggered — aces are not wild, and the face value is locked."
          />
          <Paragraph>Palifico rounds have three special rules:</Paragraph>
          <NumberedList
            items={[
              <>
                <Bold>Ones are NOT wild.</Bold> A 1 is just a 1.
              </>,
              <>
                <Bold>The face value is locked.</Bold> The first bidder sets the face value, and all subsequent bids must stay
                on that face.
              </>,
              <>
                <Bold>Only the Palifico player is exempt from the face-lock</Bold> and may change the face value when bidding.
              </>,
            ]}
          />
          <Callout>
            <Bold>Example: </Bold>
            Eve has 1 die, triggering Palifico. She bids &quot;two fours.&quot; Frank can bid &quot;three fours&quot; or higher
            but cannot switch faces. If Eve gets another turn, she could switch to a different face.
          </Callout>
        </Section>

        <DiceDivider />

        <Section title="Elimination and Winning">
          <Paragraph>
            When a player loses their <Bold>last remaining die</Bold>, they are eliminated. The game is won by the{" "}
            <Bold>last player with dice</Bold>.
          </Paragraph>
          <BulletList
            items={[
              "As players are eliminated, the total dice on the table shrinks, making bids easier to evaluate.",
              "Endgame situations become intense mind games where reading your opponent matters more than probability.",
              "An eliminated player cannot bid, challenge, or call Spot On for the rest of the game.",
            ]}
          />
          <Paragraph>
            Ready to put these rules into practice? Check out our <InlineLink href="/strategy">strategy guide</InlineLink> for
            probability tables and advanced bluffing tactics.
          </Paragraph>
        </Section>

        <DiceDivider />

        <Section title="Common House Rules and Variations">
          <Paragraph>Numerous variations exist. Here are some of the most popular house rules and regional differences:</Paragraph>
          <SubSection title="No Wild Aces">
            <Paragraph>Some groups play without wild ones entirely, simplifying the probability calculations.</Paragraph>
          </SubSection>
          <SubSection title="No Palifico">
            <Paragraph>Some groups skip the Palifico rule entirely — more common in casual settings.</Paragraph>
          </SubSection>
          <SubSection title="No Spot On">
            <Paragraph>A simplified version removes the Spot On / Calza call, leaving only bidding and challenging.</Paragraph>
          </SubSection>
          <SubSection title="Losing Multiple Dice">
            <Paragraph>
              In some variations, the loser of a challenge loses dice equal to the difference between bid and actual count.
            </Paragraph>
          </SubSection>
          <Paragraph>
            For a deeper dive into regional rule sets, see our{" "}
            <InlineLink href="/dudo-perudo-rules">guide to Dudo and regional variations</InlineLink>, or explore the{" "}
            <InlineLink href="/history">history of Liar&apos;s Dice</InlineLink>.
          </Paragraph>
        </Section>

        <View style={{ alignItems: "center", marginTop: spacing.lg, gap: spacing.sm }}>
          <Text {...headingProps(2)} style={{ color: colors.textPrimary, fontFamily: typography.h2.fontFamily, fontSize: 22 }}>
            Ready to Play?
          </Text>
          <Paragraph>Put your knowledge to the test against AI opponents with adjustable difficulty. No sign-up required.</Paragraph>
          <Link href="/play" asChild>
            <Button label="Play Liar's Dice Now" />
          </Link>
        </View>
      </ContentLayout>
    </>
  );
}
