import { Link } from "expo-router";
import Head from "expo-router/head";
import React from "react";
import { Text, View } from "react-native";
import { ContentLayout } from "../../src/components/content/ContentLayout";
import { DataTable } from "../../src/components/content/DataTable";
import { BulletList, Callout, Paragraph, Section, SubSection } from "../../src/components/content/Prose";
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

const COLUMNS = ["Rule", "Dudo (South America)", "Commercial Version", "European Bluff", "American Bar Rules"];
const ROWS = [
  ["Wild Aces", "Yes, special ace-bidding", "Yes, special ace-bidding", "Often yes, simplified", "Varies; often no"],
  ["Palifico Round", "Yes", "Yes", "Usually no", "No"],
  ["Spot-On / Calza", "Optional (regional)", "Yes (regain a die)", "Rarely", "Rarely"],
  ["Starting Dice", "5 per player", "5 per player", "5 or 6 per player", "5 per player"],
  ["Player Count", "2–6", "2–6", "2–6", "2–8+"],
  ["Who Starts Next Round", "Loser of challenge", "Loser of challenge", "Varies", "Varies"],
];

export default function DudoPerudoRulesPage() {
  const { spacing } = useTheme();

  return (
    <>
      <Head>
        <title>Dudo &amp; Perudo Rules — Regional Variations of Liar&apos;s Dice</title>
        <meta
          name="description"
          content="Learn about Dudo, Cacho, Cachito, Perudo, and Bluff — regional names and rule variations for Liar's Dice played across South America, Europe, and the United States."
        />
      </Head>
      <ContentLayout
        title="Dudo, Cacho, & Regional Variations of Liar's Dice"
        breadcrumb={[{ label: "Rules", href: "/rules" }, { label: "Dudo & Regional Variations" }]}
      >
        <Paragraph>
          Liar&apos;s Dice is not a single game with a single set of rules. Across South America, Europe, and the United
          States, the game has evolved under different names with distinct regional traditions. This guide explores each
          regional variant so you can find the version that suits your table.
        </Paragraph>

        <Section title="What Is Dudo?">
          <Paragraph>
            Dudo (pronounced <Text style={{ fontStyle: "italic" }}>DOO-doh</Text>) is the Spanish word for &quot;I doubt,&quot;
            the call a player makes when they believe the current bid is a lie. Dudo is not merely a variant of Liar&apos;s
            Dice — it is the original South American game from which most modern versions descend.
          </Paragraph>
          <Paragraph>
            The game has deep roots in Bolivia, Peru, and Chile, where it has been played for generations at family
            gatherings, in cantinas, and at festivals.
          </Paragraph>
          <Paragraph>
            For a deeper look at how the game traveled from the Andes to the rest of the world, see our{" "}
            <InlineLink href="/history">history of Liar&apos;s Dice</InlineLink>.
          </Paragraph>
        </Section>

        <Section title="Dudo Rules Explained">
          <Paragraph>
            The standard South American version of Dudo follows a clear structure that balances simplicity with strategic
            depth:
          </Paragraph>
          <SubSection title="Setup">
            <BulletList
              items={[
                <>
                  Each player starts with <Bold>5 dice</Bold> and a cup.
                </>,
                "All players roll simultaneously and keep their dice hidden from opponents.",
                "The game supports 2 to 6 players, though 3 to 5 is considered the ideal range.",
              ]}
            />
          </SubSection>
          <SubSection title="Wild Aces">
            <Paragraph>
              Aces (ones) are <Bold>wild</Bold> — they count as any face value. Bidding on aces directly follows special
              rules: the quantity required is halved (rounded up), and switching back requires more than doubling the ace
              quantity.
            </Paragraph>
          </SubSection>
          <SubSection title="Bidding">
            <Paragraph>
              Play proceeds clockwise. A player who does not want to raise the bid may challenge by calling &quot;Dudo!&quot;
              — all dice are then revealed and counted.
            </Paragraph>
          </SubSection>
          <SubSection title="Palifico">
            <Paragraph>
              When a player loses a die and is reduced to a single die, the next round is played under Palifico rules: aces
              are not wild, and bids can only increase in quantity unless the bidder is the Palifico player themselves.
            </Paragraph>
          </SubSection>
          <SubSection title="Losing Dice & Elimination">
            <Paragraph>
              The loser of each challenge loses one die. In traditional Dudo, the <Bold>loser starts the next round</Bold>,
              not the winner.
            </Paragraph>
          </SubSection>
          <Paragraph>
            For the complete rule set with examples and edge cases, visit our <InlineLink href="/rules">full rules
            reference</InlineLink>.
          </Paragraph>
        </Section>

        <Section title="Regional Names for the Game">
          <Paragraph>One game, many names. Here are the most common you will encounter:</Paragraph>
          <SubSection title="Dudo">
            <Paragraph>
              The original South American name, used throughout Bolivia, Peru, and parts of Argentina and Colombia. The
              most historically authentic name for the game.
            </Paragraph>
          </SubSection>
          <SubSection title="Cacho & Cachito">
            <Paragraph>
              In Chile, the game is almost universally known as <Bold>Cacho</Bold> or its diminutive <Bold>Cachito</Bold>.
              Commonly played at barbecues, during Fiestas Patrias, and in bars across Santiago.
            </Paragraph>
          </SubSection>
          <SubSection title="Perudo (Commercial Trademark)">
            <Paragraph>
              A <Bold>trademarked name</Bold> for a commercially packaged version of Dudo. The rules are essentially
              identical to traditional Dudo — Perudo is a brand name, not a distinct game.
            </Paragraph>
          </SubSection>
          <SubSection title="Bluff">
            <Paragraph>
              In Germany and parts of continental Europe, the game is commonly known as <Bold>Bluff</Bold>. The German
              edition won the Spiel des Jahres award in 1993.
            </Paragraph>
          </SubSection>
          <SubSection title="Liar's Dice">
            <Paragraph>
              The English-language catch-all term, widely used in the US, UK, and Australia. The game gained widespread
              pop-culture recognition through <Text style={{ fontStyle: "italic" }}>Pirates of the Caribbean: Dead Man&apos;s
              Chest</Text> (2006).
            </Paragraph>
          </SubSection>
        </Section>

        <Section title="Regional Rule Variations">
          <Paragraph>While every version shares the core loop, the details diverge significantly by region:</Paragraph>
          <SubSection title="Chilean Cacho / Cachito">
            <Paragraph>
              Follows traditional Dudo rules but introduces local twists — some groups play with poker dice, others modify
              the wild rules entirely.
            </Paragraph>
          </SubSection>
          <SubSection title="The Commercial Boxed Version (Perudo)">
            <Paragraph>
              Packages the full South American Dudo experience with colorful dice and a polished rulebook. Some editions
              include a &quot;spot-on&quot; (calza) rule.
            </Paragraph>
          </SubSection>
          <SubSection title="European Bluff">
            <Paragraph>
              Tends to simplify the rule set — most commonly omitting the Palifico round and the special ace-bidding rules.
            </Paragraph>
          </SubSection>
          <SubSection title="American Liar's Dice (Bar Game Version)">
            <Paragraph>
              Often a stripped-down rule set — frequently drops Palifico, plays without wild aces, and uses simpler bidding.
            </Paragraph>
            <Callout>
              There is also a distinct American game sometimes called &quot;Mia&quot; that uses a single die per player with
              different mechanics — a fundamentally different game, not to be confused with the multi-dice bidding game
              discussed here.
            </Callout>
          </SubSection>
          <Paragraph>
            For a side-by-side look at how these rule sets compare, see our{" "}
            <InlineLink href="/compare">dice game comparison page</InlineLink>.
          </Paragraph>
        </Section>

        <Section title="Common Rule Differences at a Glance">
          <Paragraph>The following table summarizes the key mechanical differences between the most common regional variants:</Paragraph>
          <DataTable columns={COLUMNS} rows={ROWS} />
        </Section>

        <Section title="Which Version Do We Use?">
          <Paragraph>
            This site implements the <Bold>full South American Dudo rules</Bold> — the most strategically rich and
            historically authentic version of the game:
          </Paragraph>
          <BulletList
            items={[
              <>
                <Bold>Wild aces</Bold> — ones count as any face value, with special half-quantity rules for bidding on aces
                directly.
              </>,
              <>
                <Bold>Palifico rounds</Bold> — when a player drops to a single die, the next round uses constrained bidding.
              </>,
              <>
                <Bold>Optional spot-on (calza)</Bold> — claim the current bid is exactly right to recover a lost die.
              </>,
              <>
                <Bold>5 dice per player</Bold>, supporting 2 to 6 players.
              </>,
              <>
                <Bold>Loser starts</Bold> the next round after a challenge.
              </>,
            ]}
          />
          <Paragraph>
            We chose these rules because they produce the deepest gameplay — wild aces create richer probability
            calculations, Palifico keeps eliminated players in the conversation longer, and spot-on adds a dramatic third
            dimension to every decision point.
          </Paragraph>
          <Paragraph>
            New to the game? Our <InlineLink href="/how-to-play">step-by-step tutorial</InlineLink> walks you through every
            rule. Already comfortable? Jump into our <InlineLink href="/strategy">strategy guide</InlineLink>.
          </Paragraph>
        </Section>

        <View style={{ alignItems: "center", marginTop: spacing.lg, gap: spacing.sm }}>
          <Paragraph>Ready to play Dudo with the authentic South American rules?</Paragraph>
          <Link href="/play" asChild>
            <Button label="Play Liar's Dice Online Free" />
          </Link>
        </View>
      </ContentLayout>
    </>
  );
}
