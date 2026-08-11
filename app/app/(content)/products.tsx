import Head from "expo-router/head";
import React from "react";
import { Linking, Platform, Pressable, Text, View } from "react-native";
import { ContentLayout } from "../../src/components/content/ContentLayout";
import { Paragraph, Section } from "../../src/components/content/Prose";
import { useTheme } from "../../src/theme/ThemeProvider";

const PRODUCTS = [
  {
    title: "EvenX",
    category: "Mobile App",
    description:
      "An intuitive expense splitting app that makes sharing costs with friends, roommates, and groups effortless. Available on iOS and Android.",
    url: "https://evenx.io/",
  },
  {
    title: "PlaySequence",
    category: "Multiplayer Game",
    description:
      "A cross-platform Sequence card game with real-time multiplayer, private rooms, bot practice, leaderboards, and coin rewards. Play online from any device.",
    url: "https://playsequence.app/",
  },
  {
    title: "Praxis Innovations",
    category: "Software Studio",
    description:
      "The team behind all our products. We build mobile apps and online games that are simple, polished, and fun to use.",
    url: "https://praxisinnovations.ca/",
  },
] as const;

function ProductCard({ title, category, description, url }: (typeof PRODUCTS)[number]) {
  const { colors, spacing, typography, radii } = useTheme();

  const handlePress = () => {
    if (Platform.OS === "web") {
      window.open(url, "_blank", "noopener,noreferrer");
    } else {
      Linking.openURL(url);
    }
  };

  return (
    <Pressable
      onPress={handlePress}
      style={({ pressed }) => ({
        backgroundColor: colors.surface,
        borderWidth: 1,
        borderColor: colors.border,
        borderRadius: radii.lg,
        padding: spacing.lg,
        gap: spacing.sm,
        opacity: pressed ? 0.85 : 1,
      })}
    >
      <Text
        style={{
          fontFamily: typography.caption.fontFamily,
          fontSize: typography.caption.fontSize,
          color: colors.accent,
          textTransform: "uppercase",
          letterSpacing: 1,
        }}
      >
        {category}
      </Text>
      <Text
        style={{
          fontFamily: typography.h3.fontFamily,
          fontSize: typography.h3.fontSize,
          color: colors.textPrimary,
        }}
      >
        {title}
      </Text>
      <Text
        style={{
          fontFamily: typography.body.fontFamily,
          fontSize: typography.body.fontSize,
          lineHeight: typography.body.lineHeight,
          color: colors.textSecondary,
        }}
      >
        {description}
      </Text>
      <Text
        style={{
          fontFamily: typography.bodySemibold.fontFamily,
          fontSize: typography.body.fontSize,
          color: colors.primary,
          marginTop: spacing.xs,
        }}
      >
        Visit {title} &rarr;
      </Text>
    </Pressable>
  );
}

export default function ProductsPage() {
  const { spacing } = useTheme();

  return (
    <>
      <Head>
        <title>Our Products — Apps & Games by Praxis Innovations</title>
        <meta
          name="description"
          content="Explore the apps and games built by Praxis Innovations — from expense splitting with EvenX to classic board and dice games online."
        />
      </Head>
      <ContentLayout title="Our Products" breadcrumb={[{ label: "Products" }]}>
        <Paragraph>
          Liar&apos;s Dice is one of several products built by Praxis Innovations. From splitting
          expenses to playing classic board games online, here&apos;s what we&apos;ve been building.
        </Paragraph>

        <Section title="Apps & Games">
          <View style={{ gap: spacing.md }}>
            {PRODUCTS.map((product) => (
              <ProductCard key={product.title} {...product} />
            ))}
          </View>
        </Section>
      </ContentLayout>
    </>
  );
}
