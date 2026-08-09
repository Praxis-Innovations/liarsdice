/** Truncate a player label for tight bid / result chrome. */
export function shortName(full: string, max = 14): string {
  if (full.length <= max) return full;
  return `${full.slice(0, Math.max(1, max - 1))}…`;
}
