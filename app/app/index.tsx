// Public marketing/landing route ("/"). Statically rendered for web (see app.json's
// web.output: "static"), so this is what a search crawler or a link-preview bot sees —
// unlike the (auth) and (app) routes, which gate on client-side auth state.
import Head from "expo-router/head";
import React from "react";
import { ScrollView } from "react-native";
import { CTABanner } from "../src/components/landing/CTABanner";
import { Hero } from "../src/components/landing/Hero";
import { HowToPlay } from "../src/components/landing/HowToPlay";
import { Footer } from "../src/components/shared/Footer";
import { useTheme } from "../src/theme/ThemeProvider";

export default function LandingScreen() {
  const { colors } = useTheme();

  return (
    <>
      <Head>
        <title>Liar&apos;s Dice — Bluff Your Way to Victory</title>
        <meta
          name="description"
          content="Play Liar's Dice online with friends: bid boldly, call bluffs, and outwit the table in this classic dice game — free, in the browser, no download."
        />
      </Head>
      <ScrollView style={{ flex: 1, backgroundColor: colors.background }} contentContainerStyle={{ flexGrow: 1 }}>
        <Hero />
        <HowToPlay />
        <CTABanner />
        <Footer />
      </ScrollView>
    </>
  );
}
