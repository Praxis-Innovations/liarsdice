// Landing screen for the link in the password-reset email. Supabase establishes a temporary
// session on arrival (PASSWORD_RECOVERY event, see AuthContext) which lets updateUser() set a
// new password without asking for the old one.
import { router } from "expo-router";
import React, { useState } from "react";
import { ActivityIndicator, Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import { supabase } from "../../src/lib/supabase";
import { COLORS, SPACING } from "../../src/theme";

export default function ResetPasswordScreen() {
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (submitting || !supabase) return;
    if (password.length < 8) {
      setError("Password must be at least 8 characters");
      return;
    }
    setError(null);
    setSubmitting(true);
    try {
      const { error: update_error } = await supabase.auth.updateUser({ password });
      if (update_error) setError(update_error.message);
      else setDone(true);
    } finally {
      setSubmitting(false);
    }
  };

  if (done) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>Password updated</Text>
        <Pressable style={[styles.button, styles.primaryButton]} onPress={() => router.replace("/home")}>
          <Text style={styles.primaryButtonText}>Continue</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Set a new password</Text>

      {error ? <Text style={styles.error}>{error}</Text> : null}

      <TextInput
        style={styles.input}
        placeholder="New password"
        placeholderTextColor={COLORS.textSecondary}
        secureTextEntry
        value={password}
        onChangeText={setPassword}
      />

      <Pressable
        style={[styles.button, styles.primaryButton, submitting ? styles.buttonDisabled : null]}
        onPress={() => void handleSubmit()}
        disabled={submitting}
      >
        {submitting ? <ActivityIndicator color={COLORS.primaryText} /> : <Text style={styles.primaryButtonText}>Update password</Text>}
      </Pressable>
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
});
