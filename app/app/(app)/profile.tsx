import React, { useCallback, useEffect, useState } from "react";
import { ActivityIndicator, Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import { useAuth } from "../../src/context/AuthContext";
import { fetchMe, updateMe } from "../../src/lib/api";
import type { Profile } from "../../src/shared/types";
import { COLORS, SPACING } from "../../src/theme";

export default function ProfileScreen() {
  const { user, accessToken, signOut } = useAuth();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [displayName, setDisplayName] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadProfile = useCallback(async () => {
    if (!accessToken) return;
    setLoading(true);
    setError(null);
    try {
      const data = await fetchMe(accessToken);
      setProfile(data);
      setDisplayName(data.displayName);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load profile");
    } finally {
      setLoading(false);
    }
  }, [accessToken]);

  useEffect(() => {
    void loadProfile();
  }, [loadProfile]);

  const handleSave = async () => {
    if (!accessToken || saving) return;
    setSaving(true);
    setError(null);
    try {
      const data = await updateMe(accessToken, { displayName });
      setProfile(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save profile");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Email</Text>
      <Text style={styles.value}>{user?.email}</Text>

      <Text style={styles.label}>Display name</Text>
      <TextInput
        style={styles.input}
        value={displayName}
        onChangeText={setDisplayName}
        placeholder="Display name"
        placeholderTextColor={COLORS.textSecondary}
      />

      {error ? <Text style={styles.error}>{error}</Text> : null}

      <Pressable
        style={[styles.button, styles.primaryButton, saving || displayName === profile?.displayName ? styles.buttonDisabled : null]}
        onPress={() => void handleSave()}
        disabled={saving || displayName === profile?.displayName}
      >
        {saving ? <ActivityIndicator color={COLORS.primaryText} /> : <Text style={styles.primaryButtonText}>Save changes</Text>}
      </Pressable>

      <Pressable style={[styles.button, styles.dangerButton]} onPress={() => void signOut()}>
        <Text style={styles.dangerButtonText}>Sign out</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  loading: { flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: COLORS.background },
  container: { flex: 1, backgroundColor: COLORS.background, padding: SPACING.lg, gap: SPACING.xs },
  label: { fontSize: 13, color: COLORS.textSecondary, marginTop: SPACING.md },
  value: { fontSize: 16, color: COLORS.textPrimary },
  input: {
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 10,
    padding: SPACING.md,
    fontSize: 16,
    color: COLORS.textPrimary,
    backgroundColor: COLORS.surface,
  },
  error: { color: COLORS.danger, marginTop: SPACING.sm },
  button: { paddingVertical: SPACING.md, borderRadius: 10, alignItems: "center", marginTop: SPACING.lg },
  buttonDisabled: { opacity: 0.5 },
  primaryButton: { backgroundColor: COLORS.primary },
  primaryButtonText: { fontSize: 16, fontWeight: "600", color: COLORS.primaryText },
  dangerButton: { borderWidth: 1, borderColor: COLORS.danger, marginTop: SPACING.sm },
  dangerButtonText: { fontSize: 16, fontWeight: "600", color: COLORS.danger },
});
