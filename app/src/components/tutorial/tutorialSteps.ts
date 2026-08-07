export type TooltipPosition = "above" | "below" | "auto";

export type TutorialStepAction =
  | "tap-continue"
  | "wait-for-bid"
  | "wait-for-ai"
  | "wait-for-round-result"
  | "celebrate";

export interface TutorialStep {
  id: string;
  targetRef: string | null;
  title: string;
  body: string;
  position: TooltipPosition;
  action: TutorialStepAction;
  allowInteraction: boolean;
}

export const TUTORIAL_STEPS: TutorialStep[] = [
  {
    id: "welcome",
    targetRef: null,
    title: "Welcome to Liar's Dice!",
    body: "Let's walk through a round together. You'll learn how to bid, bluff, and call your opponent's bluff.",
    position: "auto",
    action: "tap-continue",
    allowInteraction: false,
  },
  {
    id: "your-dice",
    targetRef: "humanPanel",
    title: "Your Dice",
    body: "These are your dice — only you can see them. Your opponent's dice are hidden under their cup.",
    position: "above",
    action: "tap-continue",
    allowInteraction: false,
  },
  {
    id: "opponents",
    targetRef: "opponentPanels",
    title: "Your Opponent",
    body: "Each player has hidden dice. The number on the right shows how many dice they have left.",
    position: "below",
    action: "tap-continue",
    allowInteraction: false,
  },
  {
    id: "game-status",
    targetRef: "gameStatus",
    title: "Game Info",
    body: "This bar shows the round number, how many dice are in play, and the current bid. No bid yet — you go first!",
    position: "below",
    action: "tap-continue",
    allowInteraction: false,
  },
  {
    id: "make-bid",
    targetRef: "bidPanel",
    title: "Make Your Bid",
    body: "A bid is a guess about ALL the dice on the table — yours and your opponent's combined. Pick a quantity and face value, then tap the Bid button. Try it now!",
    position: "above",
    action: "wait-for-bid",
    allowInteraction: true,
  },
  {
    id: "ai-turn",
    targetRef: "gameStatus",
    title: "Opponent's Turn",
    body: "Your opponent is thinking... They'll either raise the bid higher or call your bluff.",
    position: "below",
    action: "wait-for-ai",
    allowInteraction: false,
  },
  {
    id: "opponent-bid",
    targetRef: "bidHistory",
    title: "What They Bid",
    body: "Your opponent raised the bid! The bid history shows every bid this round. Now you decide — raise higher or call their bluff.",
    position: "above",
    action: "tap-continue",
    allowInteraction: false,
  },
  {
    id: "call-or-raise",
    targetRef: "actionControls",
    title: "Call or Raise",
    body: "Now you can raise the bid even higher, or call \"Liar!\" if you think the current bid is too high. Try calling Liar!",
    position: "above",
    action: "wait-for-round-result",
    allowInteraction: true,
  },
  {
    id: "round-result",
    targetRef: null,
    title: "Round Over!",
    body: "All dice are revealed! The actual count is compared to the bid. Whoever was wrong loses a die. Lose all your dice and you're out!",
    position: "auto",
    action: "tap-continue",
    allowInteraction: false,
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
