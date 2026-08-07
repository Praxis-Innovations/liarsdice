import type { AIDifficulty } from "../../engine/types";

/**
 * Locked visual contract for the New Game (/play setup) screen.
 * UI tests assert these values — change deliberately, then update tests.
 * Sizes are ~25% larger than the original compact form for readability at 100% zoom.
 */
export const GAME_SETUP_LAYOUT = {
  /** Form column max width by density tier (0/1 vs 2). */
  maxWidth: {
    comfortable: 475,
    dense: 400,
  },
  /** Compact name field — stays right-aligned, not full-bleed. */
  nameInput: {
    width: { default: 175, dense: 155 },
    maxWidth: "48%",
  },
  /** Name + Players rows are horizontal label/control strips. */
  rowDirection: "row" as const,
  /** Difficulty chips always sit in one horizontal row. */
  difficultyDirection: "row" as const,
  /** CTA order: Tutorial left, Start Game right. */
  actionsOrder: ["Tutorial", "Start Game"] as const,
  /** Title sizes by density (0 / 1 / 2). */
  titleSize: {
    comfortable: 35,
    medium: 33,
    dense: 25,
  },
  labelSize: { default: 16, dense: 14 },
  bodySize: { default: 17, dense: 15 },
  captionSize: { default: 14, dense: 13 },
  chipLabelSize: { default: 17, dense: 15 },
  playerCountSize: { default: 25, dense: 22 },
} as const;

export const GAME_SETUP_DIFFICULTIES: ReadonlyArray<{
  value: AIDifficulty;
  label: string;
  desc: string;
}> = [
  { value: "easy", label: "Easy", desc: "Predictable bids, challenges too late." },
  {
    value: "medium",
    label: "Medium",
    desc: "Good probability math with occasional bluffs.",
  },
  { value: "hard", label: "Hard", desc: "Strategic bluffing and near-optimal play." },
];

export const GAME_SETUP_TEST_IDS = {
  root: "game-setup-root",
  nameRow: "game-setup-name-row",
  nameInput: "game-setup-name-input",
  playersRow: "game-setup-players-row",
  difficultySection: "game-setup-difficulty",
  difficultyRow: "game-setup-difficulty-row",
  difficultyDesc: "game-setup-difficulty-desc",
  rulesSection: "game-setup-rules",
  actionsRow: "game-setup-actions",
} as const;
