import type { GameState } from "../../engine/types";
import type { TutorialTargetRef } from "./tutorialTypes";

export type TooltipPosition = "above" | "below" | "auto";

export type TutorialStepAction =
  | "tap-continue"
  | "wait-for-bid"
  | "wait-for-ai"
  | "wait-for-round-result"
  | "celebrate";

export interface TutorialStep {
  id: string;
  targetRef: TutorialTargetRef | null;
  title: string;
  body: string;
  position: TooltipPosition;
  action: TutorialStepAction;
  allowInteraction: boolean;
}

function playerLabel(state: GameState, id: string): string {
  if (id === "human") return "You";
  return state.players.find((p) => p.id === id)?.name ?? "Someone";
}

/** Dynamic title/body for the post-Liar reveal step. */
export function describeTutorialRoundResult(state: GameState): { title: string; body: string } {
  const result = state.lastRoundResult;
  if (!result) {
    return {
      title: "Round Over!",
      body: "All dice are revealed and compared to the bid. Whoever was wrong loses a die.",
    };
  }

  const challenger = playerLabel(state, result.challenger);
  const bidder = playerLabel(state, result.challengedPlayer);
  const loser = playerLabel(state, result.loser);
  const bid = `${result.currentBid.quantity}×${result.currentBid.faceValue}`;
  const actual = result.actualCount;
  const verb = result.challengeType === "spot-on" ? "Spot On" : "Liar";

  if (result.challengerWins) {
    return {
      title: `${challenger} wins the call!`,
      body:
        result.challengeType === "spot-on"
          ? `${challenger} called Spot On on ${bidder}'s ${bid} — and the count was exactly ${actual}. ${loser} loses a die.`
          : `${challenger} called Liar on ${bidder}'s ${bid}. Only ${actual} matched on the table (bid was ${result.currentBid.quantity}), so ${loser} loses a die.`,
    };
  }

  return {
    title: `${challenger} loses the call!`,
    body:
      result.challengeType === "spot-on"
        ? `${challenger} called Spot On on ${bid}, but the real count was ${actual} — not exact. ${loser} loses a die.`
        : `${challenger} called ${verb} on ${bidder}'s ${bid}, but there were ${actual} on the table — enough to beat the bid. ${loser} loses a die.`,
  };
}

export const TUTORIAL_STEPS: TutorialStep[] = [
  {
    id: "welcome",
    targetRef: null,
    title: "Welcome to Liar's Dice!",
    body: "Let's walk through a round with two opponents. You'll learn how to bid, bluff, and call a bluff.",
    position: "auto",
    action: "tap-continue",
    allowInteraction: false,
  },
  {
    id: "your-dice",
    targetRef: "humanPanel",
    title: "Your Dice",
    body: "These are your dice — only you can see them. Your opponents' dice stay hidden under their cups.",
    position: "above",
    action: "tap-continue",
    allowInteraction: false,
  },
  {
    id: "opponents",
    targetRef: "table",
    title: "The Table",
    body: "Three players sit around the table — you and two AI opponents. Their dice stay hidden until someone calls Liar.",
    position: "below",
    action: "tap-continue",
    allowInteraction: false,
  },
  {
    id: "game-status",
    targetRef: "gameStatus",
    title: "Game Info",
    body: "This bar shows the round, how many dice are left, and whose turn it is. Bids appear under the table on phones.",
    position: "below",
    action: "tap-continue",
    allowInteraction: false,
  },
  {
    id: "make-bid",
    targetRef: "bidPanel",
    title: "Make Your Bid",
    body: "A bid is a guess about ALL the dice on the table — yours and both opponents' combined. Pick a quantity and face, then tap Bid!",
    position: "above",
    action: "wait-for-bid",
    allowInteraction: true,
  },
  {
    id: "ai-turn",
    targetRef: "gameStatus",
    title: "Opponents' Turns",
    body: "Your opponents are bidding… Each one can raise the bid higher. Hang tight — it'll come back to you.",
    position: "below",
    action: "wait-for-ai",
    allowInteraction: false,
  },
  {
    id: "opponent-bid",
    targetRef: "bidChrome",
    title: "The Bid Rose",
    body: "Both opponents raised! The current bid is listed in the bid area (under the table on phones). Now you decide — raise again or call their bluff.",
    position: "above",
    action: "tap-continue",
    allowInteraction: false,
  },
  {
    id: "call-or-raise",
    targetRef: "actionControls",
    title: "Call or Raise",
    body: "Raise if you think the bid is still safe, or tap Liar! if you think it's too high. Try calling Liar!",
    position: "above",
    action: "wait-for-round-result",
    allowInteraction: true,
  },
  {
    id: "round-result",
    targetRef: "roundResult",
    title: "Who Won?",
    body: "Compare the bid to the actual count — the card shows who was right and who loses a die.",
    position: "above",
    action: "tap-continue",
    allowInteraction: true,
  },
  {
    id: "celebration",
    targetRef: null,
    title: "You're Ready!",
    body: "You now know the basics of Liar's Dice. Bluff big, read your opponents, and be the last one standing!",
    position: "auto",
    action: "celebrate",
    allowInteraction: false,
  },
];
