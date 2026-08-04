import { Link } from "expo-router";
import React, { useState } from "react";
import { ActivityIndicator, Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import { useAuth } from "../../src/context/AuthContext";
import { COLORS, SPACING } from "../../src/theme";

export default function ForgotPasswordScreen() {
  const { resetPasswordForEmail } = useAuth();
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (submitting) return;
    setError(null);
    setSubmitting(true);
    try {
      const { error: reset_error } = await resetPasswordForEmail(email.trim());
      if (reset_error) setError(reset_error);
      else setSent(true);
    } finally {
      setSubmitting(false);
    }
  };

  if (sent) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>Check your email</Text>
        <Text style={styles.body}>We sent a password reset link to {email.trim()}.</Text>
        <Link href="/sign-in" style={styles.link}>
          Back to sign in
        </Link>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Reset password</Text>
      <Text style={styles.body}>Enter your email and we'll send you a reset link.</Text>

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

      <Pressable
        style={[styles.button, styles.primaryButton, submitting ? styles.buttonDisabled : null]}
        onPress={() => void handleSubmit()}
        disabled={submitting}
      >
        {submitting ? <ActivityIndicator color={COLORS.primaryText} /> : <Text style={styles.primaryButtonText}>Send reset link</Text>}
      </Pressable>

      <Link href="/sign-in" style={styles.link}>
        Back to sign in
      </Link>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background, padding: SPACING.lg, justifyContent: "center", gap: SPACING.sm },
  title: { fontSize: 28, fontWeight: "700", color: COLORS.textPrimary, marginBottom: SPACING.sm },
  body: { fontSize: 15, color: COLORS.textSecondary, marginBottom: SPACING.md },
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
  link: { color: COLORS.primary, fontSize: 14, marginTop: SPACING.md },
});
