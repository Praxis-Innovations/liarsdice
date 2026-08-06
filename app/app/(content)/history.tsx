import { Link } from "expo-router";
import Head from "expo-router/head";
import React from "react";
import { Text, View } from "react-native";
import { ContentLayout } from "../../src/components/content/ContentLayout";
import { BulletList, Callout, Paragraph, Quote, Section } from "../../src/components/content/Prose";
import { useTheme } from "../../src/theme/ThemeProvider";
import { Button } from "../../src/components/ui/Button";

function Bold({ children }: { children: React.ReactNode }) {
  const { colors, typography } = useTheme();
  return <Text style={{ color: colors.textPrimary, fontFamily: typography.bodySemibold.fontFamily }}>{children}</Text>;
}

function Italic({ children }: { children: React.ReactNode }) {
  const { colors, typography } = useTheme();
  return <Text style={{ color: colors.textPrimary, fontFamily: typography.body.fontFamily, fontStyle: "italic" }}>{children}</Text>;
}

function InlineLink({ href, children }: { href: string; children: React.ReactNode }) {
  const { colors } = useTheme();
  return (
    <Link href={href} style={{ color: colors.primary, textDecorationLine: "underline" }}>
      {children}
    </Link>
  );
}

export default function HistoryPage() {
  const { spacing } = useTheme();

  return (
    <>
      <Head>
        <title>History of Liar&apos;s Dice — Origins, Dudo &amp; Modern Revival</title>
        <meta
          name="description"
          content="Discover the rich history of Liar's Dice — from its ancient South American origins as Dudo and Cacho, through its Pirates of the Caribbean fame, to the modern Liar's Bar revival."
        />
      </Head>
      <ContentLayout title="The History of Liar's Dice" breadcrumb={[{ label: "History" }]}>
        <Paragraph>
          Liar&apos;s Dice is one of the oldest bluffing games in the world. Its roots stretch back centuries to the highlands
          of South America, where players would shake dice in leather cups and stake their wits on bold claims and well-timed
          doubts. From smoky cantinas in the Andes to Hollywood blockbusters and viral video games, the game has traveled
          further than almost any other tabletop pastime. This is its story.
        </Paragraph>

        <Section title="Origins in South America">
          <Paragraph>
            The earliest forms of Liar&apos;s Dice emerged in South America, likely centuries before European contact. Dice
            games of various kinds were played throughout the ancient Americas, and the bluffing mechanic that defines
            Liar&apos;s Dice appears to have developed independently in the Andean region.
          </Paragraph>
          <Callout>
            Traditions in <Bold>Bolivia</Bold> and <Bold>Peru</Bold> point to the game&apos;s oldest continuous lineage. In
            these countries, the game known as <Italic>Dudo</Italic> or <Italic>Cacho</Italic> has been a staple of social
            gatherings for generations. The Inca Empire, which spanned much of western South America from the 13th to the 16th
            century, is often cited as a cultural context in which early forms of dice-based bluffing games could have
            flourished.
          </Callout>
          <Paragraph>
            Beyond Bolivia and Peru, the game has deep roots in <Bold>Chile</Bold>, <Bold>Ecuador</Bold>, and{" "}
            <Bold>Colombia</Bold>. Across all of them, the core mechanic remained the same: players concealed their dice, made
            claims about the total dice on the table, and challenged each other when they suspected a bluff.
          </Paragraph>
          <Paragraph>
            The game&apos;s survival across so many centuries and borders speaks to the elegance of its design — needing only
            a handful of dice and a cup per player made it portable and accessible.
          </Paragraph>
        </Section>

        <Section title='The Name "Dudo"'>
          <Paragraph>
            In much of the Spanish-speaking world, the game is called <Bold>Dudo</Bold> — a word that comes directly from the
            Spanish verb <Italic>dudar</Italic>, meaning &quot;to doubt.&quot; When you believe another player is lying, you
            declare <Italic>&quot;Dudo!&quot;</Italic> — &quot;I doubt it.&quot;
          </Paragraph>
          <Quote>
            &quot;Dudo&quot; — &quot;I doubt.&quot; One word that turns the entire table on its head. The boldest claims mean
            nothing when someone has the nerve to call your bluff.
          </Quote>
          <Paragraph>
            The game goes by many names depending on the region. In <Bold>Chile</Bold>, it is commonly called{" "}
            <Italic>Cacho</Italic> or <Italic>Cachito</Italic>. In <Bold>Peru</Bold> and <Bold>Bolivia</Bold>,{" "}
            <Italic>Dudo</Italic> is the dominant term. In English-speaking countries, the game is most widely known as{" "}
            <Bold>Liar&apos;s Dice</Bold>.
          </Paragraph>
          <Paragraph>
            Want to learn the specific rules for <InlineLink href="/dudo-perudo-rules">Dudo, Cacho, and other regional
            variations</InlineLink>? We cover every major rule set in detail.
          </Paragraph>
        </Section>

        <Section title="Spread to Europe and the World">
          <Paragraph>
            When Spanish and Portuguese colonists arrived in South America in the 16th century, they encountered a continent
            rich with gaming traditions. Returning colonists carried the games back to the Iberian Peninsula, and from there
            the game spread across Europe, evolving as it traveled.
          </Paragraph>
          <Paragraph>
            By the 18th and 19th centuries, variations of the game had appeared in England, France, Germany, and beyond. The
            German version, often called <Italic>Bluff</Italic> or <Italic>Schummeln</Italic>, became a popular parlor game.
            In England, the game became known as Liar&apos;s Dice and was a fixture in pubs and gambling dens.
          </Paragraph>
          <Callout>
            The game&apos;s journey mirrors the broader history of cultural exchange between the Americas and Europe.
            Liar&apos;s Dice was not merely imported — it was adapted, refined, and made local by each culture that adopted it.
          </Callout>
        </Section>

        <Section title="The Pirate Connection">
          <Paragraph>
            For most of its history, Liar&apos;s Dice was known primarily to players in Latin America. That changed
            dramatically in 2006 with the release of <Italic>Pirates of the Caribbean: Dead Man&apos;s Chest</Italic>, in
            which the game takes center stage aboard the <Italic>Flying Dutchman</Italic>.
          </Paragraph>
          <Quote>
            Aboard the ghostly Flying Dutchman, Will Turner sits down to a game of Liar&apos;s Dice against the
            tentacle-faced captain Davy Jones and his own father, &quot;Bootstrap&quot; Bill Turner. The stakes? Nothing less
            than an eternity of servitude.
          </Quote>
          <Paragraph>
            The film was a massive commercial success, and the Liar&apos;s Dice scene became iconic. Search interest in the
            game spiked immediately after the film&apos;s release, and sales of physical Liar&apos;s Dice sets surged.
          </Paragraph>
          <Paragraph>
            While the historical link between pirates and dice games has some basis in fact, the specific connection to
            Liar&apos;s Dice is largely a product of Hollywood — but it stuck.
          </Paragraph>
        </Section>

        <Section title="Liar's Bar and the Modern Revival">
          <Paragraph>
            Nearly two decades after Pirates of the Caribbean, Liar&apos;s Dice experienced another surge of interest — this
            time from video games. In 2024, the online multiplayer game <Italic>Liar&apos;s Bar</Italic> took the gaming
            world by storm.
          </Paragraph>
          <Callout>
            <Italic>Liar&apos;s Bar</Italic> translated the core mechanics of Liar&apos;s Dice into a stylized digital format
            with voice chat, animated characters, and dramatic consequences for losing rounds. The game went viral on Steam,
            peaking at approximately <Bold>113,000 concurrent players</Bold>.
          </Callout>
          <Paragraph>
            The Liar&apos;s Bar phenomenon demonstrated something remarkable: the fundamental appeal of Liar&apos;s Dice
            translates perfectly into the digital age. New players who discovered it through the video game sought out the{" "}
            <InlineLink href="/rules">complete rules of the original game</InlineLink> and introduced it to friends and
            families.
          </Paragraph>
        </Section>

        <Section title="The Game's Cultural Impact">
          <Paragraph>
            Beyond Pirates of the Caribbean and Liar&apos;s Bar, Liar&apos;s Dice has appeared across popular culture in
            television shows, novels, and countless films. It remains a cornerstone of social life, particularly in Latin
            America.
          </Paragraph>
          <Paragraph>
            Organized tournaments take place at gaming conventions, in pubs, and online, attracting serious players who have
            honed their skills in probability assessment and bluff timing.
          </Paragraph>
          <Quote>
            Few games can claim to have been played in Incan courtyards, pirate ships, Hollywood sound stages, and Steam
            servers. Liar&apos;s Dice has done all of that and more.
          </Quote>
        </Section>

        <Section title="Related Games and Bluffing Traditions">
          <Paragraph>
            Liar&apos;s Dice belongs to a broad family of bluffing games that share a common thread: players must decide
            whether to trust or challenge the claims of their opponents.
          </Paragraph>
          <BulletList
            items={[
              <>
                <Bold>Poker</Bold> — shares the emphasis on hidden information, risk assessment, and reading opponents.
              </>,
              <>
                <Bold>BS (Cheat / I Doubt It)</Bold> — a card game using the same &quot;claim and challenge&quot; mechanic.
              </>,
              <>
                <Bold>Bluff (Schummeln)</Bold> — the German board game version, which won the Spiel des Jahres award in 1993.
              </>,
              <>
                <Bold>Mia (Meiern / Mexiko)</Bold> — a two-dice bluffing game popular in Scandinavia and Germany.
              </>,
              <>
                <Bold>Common Hand Liar&apos;s Dice</Bold> — a variation where each player has only one die.
              </>,
            ]}
          />
          <Paragraph>
            You can <InlineLink href="/compare">compare Liar&apos;s Dice variants side by side</InlineLink> to see how rules
            differ across regions and traditions.
          </Paragraph>
        </Section>

        <Section title="The Digital Era">
          <Paragraph>
            The transition of Liar&apos;s Dice to digital platforms has opened the game to an enormous new audience. Online
            versions allow players from different continents to sit at the same virtual table.
          </Paragraph>
          <Paragraph>
            Modern AI opponents use probability calculations, opponent modeling, and adaptive strategies that provide a
            genuine challenge — an excellent way to <InlineLink href="/how-to-play">learn how to play Liar&apos;s Dice</InlineLink>{" "}
            before taking on human opponents.
          </Paragraph>
          <Callout>
            The digital era has also helped preserve the game&apos;s many regional variations, offering every rule set in one
            place and enriching the global Liar&apos;s Dice community.
          </Callout>
        </Section>

        <Section title="From Ancient Tables to Your Screen">
          <Paragraph>
            The history of Liar&apos;s Dice is a story of a game so well designed that it has survived centuries, crossed
            oceans, and adapted to every medium from leather cups to touchscreens.
          </Paragraph>
          <Paragraph>
            The best way to appreciate the game&apos;s history is to play it. Feel the tension of a rising bid, the thrill of
            a well-timed bluff, and the satisfaction of calling out a liar. The dice are waiting.
          </Paragraph>
        </Section>

        <View style={{ alignItems: "center", marginTop: spacing.lg, gap: spacing.sm }}>
          <View className="flex-row flex-wrap justify-center" style={{ gap: spacing.sm }}>
            <Link href="/play" asChild>
              <Button label="Play Liar's Dice Now" />
            </Link>
            <Link href="/how-to-play" asChild>
              <Button label="Learn How to Play" variant="ghost" />
            </Link>
          </View>
        </View>
      </ContentLayout>
    </>
  );
}
