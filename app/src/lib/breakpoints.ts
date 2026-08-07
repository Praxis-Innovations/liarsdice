/**
 * Shared layout breakpoints — aligned with Tailwind defaults used by NativeWind:
 *   md = 768, lg = 1024
 * Use these instead of hard-coded 640/760/900 thresholds.
 */
export const BREAKPOINTS = {
  /** phone → tablet (Tailwind `md`) */
  md: 768,
  /** tablet → desktop/laptop (Tailwind `lg`) */
  lg: 1024,
} as const;

export type Breakpoint = "phone" | "tablet" | "laptop";

export function getBreakpoint(width: number): Breakpoint {
  if (width < BREAKPOINTS.md) return "phone";
  if (width < BREAKPOINTS.lg) return "tablet";
  return "laptop";
}

/** Desktop chrome (horizontal nav, wide footer/CTA). */
export function isDesktopWidth(width: number): boolean {
  return width >= BREAKPOINTS.lg;
}

/** Compact / stacked chrome (hamburger, narrow padding). */
export function isCompactWidth(width: number): boolean {
  return width < BREAKPOINTS.lg;
}
