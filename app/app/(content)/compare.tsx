import { Link } from "expo-router";
import Head from "expo-router/head";
import React from "react";
import { Text, View } from "react-native";
import { ContentLayout } from "../../src/components/content/ContentLayout";
import { DataTable } from "../../src/components/content/DataTable";
import { Paragraph, Section } from "../../src/components/content/Prose";
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

const COMPARISON_COLUMNS = ["Feature", "Standard", "Dudo", "Perudo", "Bluff", "Bar Dice"];
const COMPARISON_ROWS = [
  ["Number of Dice", "5 per player", "5 per player", "5 per player", "5 per player", "5 shared or per player"],
  ["Wild Aces", "Yes", "Yes — central mechanic", "Yes — same as Dudo", "Often yes, sometimes optional", "Varies by house rules"],
  ["Palifico", "Optional", "Yes — triggered at one die", "Yes — codified rules", "Rarely used", "No"],
  ["Spot-On", "Optional", "Yes — calza earns a die", "Yes — same as Dudo", "Sometimes included", "No"],
  ["Ones-Bid Transitions", "Switching changes count", "Halve to ones, double+1 back", "Same as Dudo", "Varies", "N/A"],
  ["Player Count", "2–6", "2–6 (best 3–5)", "2–6", "2–6", "2–8+"],
  ["Starting Player", "Loser of previous round", "Loser of previous round", "Loser of previous round", "Loser or left of caller", "Loser buys the round"],
  ["Elimination Rules", "Lose all dice, out", "Lose all dice, out", "Lose all dice, out", "Lose all dice, out", "Often single-round"],
];

export default function ComparePage() {
  const { spacing } = useTheme();

  return (
    <>
      <Head>
        <title>Liar&apos;s Dice Variants Comparison — Dudo vs Perudo vs Bluff</title>
        <meta
          name="description"
          content="Compare Liar's Dice variants side by side: standard rules, Dudo, Perudo, Bluff, Bar Dice, and Liar's Bar. Find the version that fits your group."
        />
      </Head>
      <ContentLayout title="Liar's Dice Variants Comparison" breadcrumb={[{ label: "Variants Comparison" }]}>
        <Paragraph>
          Whether you call it Liar&apos;s Dice, Dudo, Bluff, or something else entirely, the core game of hidden dice and
          escalating bids has been played around the world for centuries. This guide compares every major variant so you can
          choose the right version for your table.
        </Paragraph>

        <Section title="Overview">
          <Paragraph>
            Liar&apos;s Dice is not a single game but a family of closely related bluffing games. The differences lie in the
            fine print — how wild aces work, what happens when a player loses all their dice, and whether special rules like
            Palifico kick in.
          </Paragraph>
          <Paragraph>
            Most variations trace their roots to <InlineLink href="/history">the long history of Liar&apos;s Dice</InlineLink>,
            which stretches from 15th-century South America to modern-day pubs and mobile screens.
          </Paragraph>
        </Section>

        <Section title="Feature Comparison Table">
          <Paragraph>
            The table below gives a bird&apos;s-eye view of the five most common ways to play. For detailed rules, see the{" "}
            <InlineLink href="/rules">complete rules</InlineLink> or the{" "}
            <InlineLink href="/dudo-perudo-rules">Dudo and South American rules page</InlineLink>.
          </Paragraph>
          <DataTable columns={COMPARISON_COLUMNS} rows={COMPARISON_ROWS} />
        </Section>

        <Section title="Liar's Dice vs Dudo">
          <Paragraph>
            Are Liar&apos;s Dice and Dudo different games? In practice, they are nearly identical. &quot;Dudo&quot; (Spanish
            for &quot;I doubt&quot;) is the South American name for the same dice-and-cup bluffing game.
          </Paragraph>
          <Paragraph>
            Where Dudo diverges is in how precisely it codifies certain edge cases — Palifico rounds, the calza (spot-on)
            call, and the exact arithmetic for switching bids to and from ones.
          </Paragraph>
          <Paragraph>
            If you already know Liar&apos;s Dice, you can sit at a Dudo table with almost no adjustment. Read the{" "}
            <InlineLink href="/dudo-perudo-rules">full Dudo rules breakdown</InlineLink> for the fine differences.
          </Paragraph>
        </Section>

        <Section title="Liar's Dice vs Perudo">
          <Paragraph>
            Perudo is a commercial brand name for what is essentially the same game as Dudo, popularized internationally in
            the 1980s and 1990s with high-quality cups, colorful dice, and a polished rulebook.
          </Paragraph>
          <Paragraph>
            The rules in a Perudo box match standard Dudo almost exactly. The primary difference is packaging, not gameplay.
            You can learn the full rules on our <InlineLink href="/rules">Liar&apos;s Dice rules page</InlineLink> and play
            immediately, no commercial set required.
          </Paragraph>
        </Section>

        <Section title="Liar's Dice vs Bluff">
          <Paragraph>
            &quot;Bluff&quot; is the name most commonly used in Germany and other parts of Europe for a variant of
            Liar&apos;s Dice. It won the Spiel des Jahres award in 1993.
          </Paragraph>
          <Paragraph>
            European Bluff tends to simplify a few intricate rules — Palifico rounds are often omitted, wild aces may be left
            out, and the spot-on call is sometimes absent.
          </Paragraph>
          <Paragraph>
            If you want a lighter introduction, Bluff-style rules are a fine starting point. Once comfortable, layer in
            aces-wild and Palifico for the full experience — see our <InlineLink href="/how-to-play">step-by-step guide</InlineLink>.
          </Paragraph>
        </Section>

        <Section title="Liar's Dice vs Bar Dice">
          <Paragraph>
            Bar Dice is a simplified, American casual variant often played in pubs and taverns — typically to decide who buys
            the next round of drinks.
          </Paragraph>
          <Paragraph>
            Key differences: Bar Dice is frequently a single-round game rather than elimination format, players may share a
            single set of dice, and wild aces/Palifico/spot-on are almost never used.
          </Paragraph>
          <Paragraph>
            Bar Dice is a great gateway into the broader family. Check out the{" "}
            <InlineLink href="/how-to-play">how to play guide</InlineLink> to level up to the complete game.
          </Paragraph>
        </Section>

        <Section title="Liar's Dice vs Liar's Bar">
          <Paragraph>
            Liar&apos;s Bar is a 2024 multiplayer video game inspired by — but not identical to — the traditional dice game,
            featuring online multiplayer and a dramatic elimination mechanic.
          </Paragraph>
          <Paragraph>
            While it captures the spirit of bluffing, its mechanics differ — there is no Palifico, no calza, and the
            wild-aces system is modified for the digital format.
          </Paragraph>
          <Paragraph>
            If you discovered Liar&apos;s Dice through Liar&apos;s Bar, welcome. The traditional game offers deeper
            strategy — <InlineLink href="/play">play Liar&apos;s Dice online here</InlineLink> to experience the real rules.
          </Paragraph>
        </Section>

        <Section title="Which Version Should You Play?">
          <Paragraph>
            <Bold>Complete beginners: </Bold>
            Start with Bluff-style rules — no wild aces, no Palifico. See our{" "}
            <InlineLink href="/how-to-play">beginner&apos;s guide</InlineLink>.
          </Paragraph>
          <Paragraph>
            <Bold>Casual groups and parties: </Bold>
            Standard Liar&apos;s Dice with wild aces gives you the right balance. Skip Palifico at first.
          </Paragraph>
          <Paragraph>
            <Bold>Experienced players seeking depth: </Bold>
            Play the full Dudo ruleset — see the <InlineLink href="/dudo-perudo-rules">complete Dudo rules</InlineLink>.
          </Paragraph>
          <Paragraph>
            <Bold>Bar and pub nights: </Bold>
            Bar Dice keeps it light and fast.
          </Paragraph>
          <Paragraph>
            No matter which variant you choose, the heart of the game remains the same: read your opponents, bluff
            convincingly, and know when to call.
          </Paragraph>
        </Section>

        <View style={{ alignItems: "center", marginTop: spacing.lg }}>
          <Link href="/play" asChild>
            <Button label="Play Liar's Dice Online — Free" />
          </Link>
        </View>
      </ContentLayout>
    </>
  );
}
