import { Link } from "expo-router";
import React, { useState } from "react";
import { ActivityIndicator, Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import SocialSignInButtons from "../../src/components/SocialSignInButtons";
import { useAuth } from "../../src/context/AuthContext";
import { COLORS, SPACING } from "../../src/theme";

export default function SignInScreen() {
  const { signIn } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (submitting) return;
    setError(null);
    setSubmitting(true);
    try {
      const { error: sign_in_error } = await signIn(email.trim(), password);
      if (sign_in_error) setError(sign_in_error);
      // On success, session state updates and the (auth) layout redirects to /home.
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Sign in</Text>

      {error ? <Text style={styles.error}>{error}</Text> : null}

      <TextInput
        style={styles.input}
        placeholder="Email"
        placeholderTextColor={COLORS.textSecondary}
        autoCapitalize="none"
        autoComplete="email"
        keyboardType="email-address"
        value={email}
        onChangeText={setEmail}
      />
      <TextInput
        style={styles.input}
        placeholder="Password"
        placeholderTextColor={COLORS.textSecondary}
        secureTextEntry
        autoComplete="password"
        value={password}
        onChangeText={setPassword}
      />

      <Pressable
        style={[styles.button, styles.primaryButton, submitting ? styles.buttonDisabled : null]}
        onPress={() => void handleSubmit()}
        disabled={submitting}
      >
        {submitting ? <ActivityIndicator color={COLORS.primaryText} /> : <Text style={styles.primaryButtonText}>Sign in</Text>}
      </Pressable>

      <Link href="/forgot-password" style={styles.link}>
        Forgot password?
      </Link>

      <View style={styles.divider}>
        <View style={styles.dividerLine} />
        <Text style={styles.dividerText}>or</Text>
        <View style={styles.dividerLine} />
      </View>

      <SocialSignInButtons onError={setError} />

      <View style={styles.footer}>
        <Text style={styles.footerText}>Don't have an account?</Text>
        <Link href="/sign-up" style={styles.link}>
          Create one
        </Link>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background, padding: SPACING.lg, justifyContent: "center", gap: SPACING.sm },
  title: { fontSize: 28, fontWeight: "700", color: COLORS.textPrimary, marginBottom: SPACING.md },
  error: { color: COLORS.danger, marginBottom: SPACING.sm },
  input: {
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 10,
    padding: SPACING.md,
    fontSize: 16,
    color: COLORS.textPrimary,
    backgroundColor: COLORS.surface,
  },
  button: { paddingVertical: SPACING.md, borderRadius: 10, alignItems: "center", marginTop: SPACING.sm },
  buttonDisabled: { opacity: 0.6 },
  primaryButton: { backgroundColor: COLORS.primary },
  primaryButtonText: { fontSize: 16, fontWeight: "600", color: COLORS.primaryText },
  link: { color: COLORS.primary, fontSize: 14, marginTop: SPACING.sm },
  divider: { flexDirection: "row", alignItems: "center", gap: SPACING.sm, marginVertical: SPACING.md },
  dividerLine: { flex: 1, height: 1, backgroundColor: COLORS.border },
  dividerText: { color: COLORS.textSecondary, fontSize: 13 },
  footer: { flexDirection: "row", justifyContent: "center", gap: SPACING.xs, marginTop: SPACING.lg },
  footerText: { color: COLORS.textSecondary, fontSize: 14 },
});
