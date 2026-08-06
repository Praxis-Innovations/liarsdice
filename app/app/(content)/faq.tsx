import { Link } from "expo-router";
import Head from "expo-router/head";
import React from "react";
import { Text, View } from "react-native";
import { ContentLayout } from "../../src/components/content/ContentLayout";
import { Callout, Paragraph, Section } from "../../src/components/content/Prose";
import { headingProps } from "../../src/lib/heading";
import { useTheme } from "../../src/theme/ThemeProvider";
import { Button } from "../../src/components/ui/Button";

function InlineLink({ href, children }: { href: string; children: React.ReactNode }) {
  const { colors } = useTheme();
  return (
    <Link href={href} style={{ color: colors.primary, textDecorationLine: "underline" }}>
      {children}
    </Link>
  );
}

export const FAQ_ITEMS: { category: "General" | "Rules" | "Strategy" | "About"; question: string; answer: string }[] = [
  {
    category: "General",
    question: "What is Liar's Dice?",
    answer:
      "Liar's Dice is a classic bluffing dice game where each player rolls dice hidden under a cup and makes bids about the total number of a certain face value among all players' dice. Players must decide whether to raise the bid or challenge the previous player's claim. The last player with dice remaining wins. The game combines probability, psychology, and deception.",
  },
  {
    category: "General",
    question: "How many players do you need?",
    answer:
      "Liar's Dice is best played with 2 to 6 players, though the game works with any number in that range. With more players there are more dice on the table, making probability calculations more interesting and bluffing more rewarding.",
  },
  {
    category: "General",
    question: "What equipment do you need?",
    answer:
      "Traditionally, each player needs five six-sided dice and an opaque cup to hide them. Online, you don't need any physical equipment at all — just visit the play page and the game handles everything for you.",
  },
  {
    category: "General",
    question: "Is Liar's Dice the same as Dudo?",
    answer:
      "Yes, Dudo is the original South American name for the game that English speakers commonly call Liar's Dice. The rules are essentially identical. Dudo originated in the Andes region of South America and spread worldwide.",
  },
  {
    category: "General",
    question: "What are other names for Liar's Dice?",
    answer:
      "The game goes by many names around the world. Common alternatives include Dudo, Perudo, Bluff, Cachito, and Cacho. Despite the different names, the core mechanics — hidden dice, bidding, and challenging — remain consistent.",
  },
  {
    category: "Rules",
    question: "How does bidding work?",
    answer:
      'Each round, a player makes a bid consisting of a quantity and a face value — for example, "three fives," meaning they claim there are at least three dice showing five among all players\' dice combined. The next player must either raise the bid or challenge it.',
  },
  {
    category: "Rules",
    question: 'What does "wild aces" mean?',
    answer:
      'In the standard rules, dice showing a one (aces) count as wild — they match whatever face value is being bid on. For example, if someone bids "four threes," then every die showing a three AND every die showing a one counts toward that total.',
  },
  {
    category: "Rules",
    question: "What happens when someone opens bidding on ones?",
    answer:
      'When a player opens the bidding on ones (aces), aces are no longer wild for that entire round. This is sometimes called "breaking aces." Bids on ones require roughly half the quantity of normal bids to be equivalent in difficulty.',
  },
  {
    category: "Rules",
    question: "What is a palifico round?",
    answer:
      "A palifico round is a special round triggered when a player is reduced to exactly one die. During a palifico round, aces are not wild and players can only raise the quantity, not change the face value of the current bid.",
  },
  {
    category: "Strategy",
    question: 'What is a "Spot On" call?',
    answer:
      'A Spot On call (also called "Calza" in Dudo) is when a player declares that the current bid is exactly right — neither too high nor too low. If correct, the caller gains back one lost die (up to a maximum of five). If wrong, the caller loses a die.',
  },
  {
    category: "Strategy",
    question: "Can you gain dice back?",
    answer:
      "In the standard Dudo rules, the only way to gain a die back is by making a successful Spot On (Calza) call. If you correctly identify that the current bid is exactly right, you recover one lost die, up to the starting maximum of five.",
  },
  {
    category: "Strategy",
    question: "What happens when you lose all your dice?",
    answer:
      "When you lose your last die, you are eliminated from the game. The game continues with the remaining players until only one player has dice left — that player is the winner.",
  },
  {
    category: "Strategy",
    question: "When should I challenge?",
    answer:
      'Challenge (call "Dudo") when you believe the current bid is too high — that there are fewer dice of that value on the table than claimed. As a rule of thumb, each face value appears on roughly one-third of all dice when aces are wild.',
  },
  {
    category: "Strategy",
    question: "How do I calculate probability with wild aces?",
    answer:
      "With wild aces, each die has a 2-in-6 (one-third) chance of matching any non-ace face value. So the expected count for any bid value across N total dice on the table is roughly N divided by 3. For example, with 15 dice in play, you would expect about 5 of any given value.",
  },
  {
    category: "Strategy",
    question: "Is bluffing important in Liar's Dice?",
    answer:
      "Absolutely. Bluffing is the heart of the game. While probability gives you a foundation, skilled players use deception to mislead opponents about what they hold. A well-timed bluff can force other players into bad challenges.",
  },
  {
    category: "About",
    question: "Is this game free to play?",
    answer:
      "Yes, Liar's Dice Online is completely free to play. There are no paywalls, no premium currencies, and no pay-to-win mechanics.",
  },
  {
    category: "About",
    question: "Can I play on mobile?",
    answer:
      "Yes! The game is fully responsive and works on phones, tablets, and desktops. No app download is required — just open the site in your mobile browser and start playing.",
  },
  {
    category: "About",
    question: "How does the AI work?",
    answer:
      "Our AI opponents use a combination of probability calculations and strategic heuristics to make decisions. They evaluate the likelihood of bids being true based on their own dice and the total number of dice in play, then add controlled randomness to simulate realistic bluffing behavior.",
  },
  {
    category: "About",
    question: "Do I need to create an account?",
    answer:
      "No account is required to play Liar's Dice Online. You can jump straight into a game against AI opponents without signing up, logging in, or providing any personal information.",
  },
  {
    category: "About",
    question: "Can I play offline?",
    answer:
      "The game requires an internet connection to load initially, but once loaded it runs entirely in your browser. If you lose connectivity mid-game against AI opponents, your current game will continue to function.",
  },
];

const CATEGORY_TITLES = {
  General: "General Questions",
  Rules: "Rules Questions",
  Strategy: "Strategy Questions",
  About: "About This Site",
} as const;

export default function FAQPage() {
  const { colors, spacing, typography } = useTheme();
  const categories = ["General", "Rules", "Strategy", "About"] as const;

  return (
    <>
      <Head>
        <title>FAQ — Liar&apos;s Dice Questions &amp; Answers</title>
        <meta
          name="description"
          content="Frequently asked questions about Liar's Dice (Dudo). Learn the rules, bidding, wild aces, palifico rounds, strategy tips, and how to play online for free."
        />
      </Head>
      <ContentLayout title="Liar's Dice FAQ" breadcrumb={[{ label: "FAQ" }]}>
        <Paragraph>
          Everything you need to know about Liar&apos;s Dice, from basic rules to advanced strategy. Can&apos;t find your
          answer? <InlineLink href="/rules">Read the full rules</InlineLink> or{" "}
          <InlineLink href="/play">jump into a game</InlineLink> and learn by playing.
        </Paragraph>

        {categories.map((category) => (
          <Section key={category} title={CATEGORY_TITLES[category]}>
            <View style={{ gap: spacing.sm }}>
              {FAQ_ITEMS.filter((item) => item.category === category).map((item) => (
                <Callout key={item.question}>
                  <Text style={{ color: colors.textPrimary, fontFamily: typography.bodySemibold.fontFamily, fontSize: 15, marginBottom: 4 }}>
                    {item.question}
                  </Text>
                  {"\n"}
                  {item.answer}
                </Callout>
              ))}
            </View>
          </Section>
        ))}

        <View style={{ alignItems: "center", marginTop: spacing.lg, gap: spacing.sm }}>
          <Text {...headingProps(2)} style={{ color: colors.textPrimary, fontFamily: typography.h2.fontFamily, fontSize: 22 }}>
            Ready to put your knowledge to the test?
          </Text>
          <Link href="/play" asChild>
            <Button label="Play Liar's Dice Now" />
          </Link>
        </View>
      </ContentLayout>
    </>
  );
}
