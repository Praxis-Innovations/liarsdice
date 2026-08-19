// Public game route ("/play") — anonymous single-player vs AI, no account required.
// Statically rendered for web (see app.json's web.output: "static"), so keep this
// crawlable rather than moving it behind the (app)/ auth gate.
// When ?mode=multiplayer is set, renders the server-authoritative multiplayer board.
import Head from "expo-router/head";
import { useLocalSearchParams } from "expo-router";
import React from "react";
import { GameBoard } from "../src/components/game/GameBoard";
import { MultiplayerBoard } from "../src/components/game/MultiplayerBoard";

export default function PlayScreen() {
  const { mode } = useLocalSearchParams<{ mode?: string }>();

  if (mode === "multiplayer") {
    return <MultiplayerBoard />;
  }

  return (
    <>
      <Head>
        <title>Play Liar&apos;s Dice Online Free — No Sign-Up Required</title>
        <meta
          name="description"
          content="Play Liar's Dice online right now, free, against AI opponents — no download, no account. Bid, bluff, and call Liar in your browser."
        />
      </Head>
      <GameBoard />
    </>
  );
}
