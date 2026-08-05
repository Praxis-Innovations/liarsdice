// Legacy compatibility shim. The (app)/ authenticated screens (home, profile)
// were out of scope for the design refresh and still import COLORS/SPACING
// from here — don't delete this without migrating those screens to
// `src/theme/` too. All new code should import from `src/theme/` directly.
import { SPACING as NEW_SPACING, lightColors } from "./theme/tokens";

export const COLORS = {
  background: lightColors.background,
  surface: lightColors.surface,
  border: lightColors.border,
  textPrimary: lightColors.textPrimary,
  textSecondary: lightColors.textSecondary,
  primary: lightColors.primary,
  primaryText: lightColors.primaryText,
  danger: lightColors.danger,
};

export const SPACING = NEW_SPACING;
