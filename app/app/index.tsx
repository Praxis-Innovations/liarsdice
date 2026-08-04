// Public marketing/landing route ("/"). Statically rendered for web (see app.json's
// web.output: "static"), so this is what a search crawler or a link-preview bot sees —
// unlike the (auth) and (app) routes, which gate on client-side auth state.
import { Link } from "expo-router";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { COLORS, SPACING } from "../src/theme";

export default function LandingScreen() {
  return (
    <View style={styles.container}>
      <View style={styles.hero}>
        <Text style={styles.title}>App Template</Text>
        <Text style={styles.subtitle}>
          Replace this landing page with your product's marketing copy. See
          docs/RENAME_CHECKLIST.md for everything else to rename when starting a new app.
        </Text>
      </View>
      <View style={styles.actions}>
        <Link href="/sign-up" asChild>
          <Pressable style={[styles.button, styles.primaryButton]}>
            <Text style={styles.primaryButtonText}>Create account</Text>
          </Pressable>
        </Link>
        <Link href="/sign-in" asChild>
          <Pressable style={styles.button}>
            <Text style={styles.buttonText}>Sign in</Text>
          </Pressable>
        </Link>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    alignItems: "center",
    justifyContent: "center",
    padding: SPACING.lg,
    gap: SPACING.xl,
  },
  hero: { alignItems: "center", gap: SPACING.sm, maxWidth: 480 },
  title: { fontSize: 32, fontWeight: "700", color: COLORS.textPrimary, textAlign: "center" },
  subtitle: { fontSize: 15, color: COLORS.textSecondary, textAlign: "center", lineHeight: 22 },
  actions: { width: "100%", maxWidth: 320, gap: SPACING.sm },
  button: {
    paddingVertical: SPACING.md,
    borderRadius: 10,
    alignItems: "center",
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  primaryButton: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  buttonText: { fontSize: 16, fontWeight: "600", color: COLORS.textPrimary },
  primaryButtonText: { fontSize: 16, fontWeight: "600", color: COLORS.primaryText },
});
