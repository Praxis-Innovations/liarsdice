import React, { useCallback, useEffect, useState } from "react";
import { ActivityIndicator, Text, View } from "react-native";
import { Button } from "../../src/components/ui/Button";
import { TextField } from "../../src/components/ui/TextField";
import { useAuth } from "../../src/context/AuthContext";
import { nakamaClient } from "../../src/lib/nakama";
import { useTheme } from "../../src/theme/ThemeProvider";

export default function ProfileScreen() {
  const { colors, spacing, typography } = useTheme();
  const { session, user, signOut } = useAuth();
  const [displayName, setDisplayName] = useState("");
  const [savedDisplayName, setSavedDisplayName] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadProfile = useCallback(async () => {
    if (!session) return;
    setLoading(true);
    setError(null);
    try {
      const account = await nakamaClient.getAccount(session);
      const name = account.user?.display_name ?? account.user?.username ?? "Player";
      setDisplayName(name);
      setSavedDisplayName(name);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load profile");
    } finally {
      setLoading(false);
    }
  }, [session]);

  useEffect(() => {
    void loadProfile();
  }, [loadProfile]);

  const handleSave = async () => {
    if (!session || saving) return;
    const trimmed = displayName.trim();
    if (!trimmed) return;
    setSaving(true);
    setError(null);
    try {
      await nakamaClient.updateAccount(session, { display_name: trimmed });
      setSavedDisplayName(trimmed);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save profile");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: colors.background }}>
        <ActivityIndicator color={colors.primary} />
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: colors.background, padding: spacing.lg, gap: spacing.xs }}>
      <Text style={{ fontSize: typography.caption.fontSize, color: colors.textSecondary, marginTop: spacing.md, fontFamily: typography.caption.fontFamily }}>
        Email
      </Text>
      <Text style={{ fontSize: typography.body.fontSize, color: colors.textPrimary, fontFamily: typography.body.fontFamily }}>
        {user?.email ?? "—"}
      </Text>

      <Text style={{ fontSize: typography.caption.fontSize, color: colors.textSecondary, marginTop: spacing.md, fontFamily: typography.caption.fontFamily }}>
        Display name
      </Text>
      <TextField value={displayName} onChangeText={setDisplayName} placeholder="Display name" />

      {error ? (
        <Text style={{ color: colors.danger, marginTop: spacing.sm, fontFamily: typography.bodyMedium.fontFamily }}>{error}</Text>
      ) : null}

      <Button
        label="Save changes"
        loading={saving}
        disabled={displayName.trim() === savedDisplayName || !displayName.trim()}
        onPress={() => void handleSave()}
        fullWidth
        style={{ marginTop: spacing.lg }}
      />

      <Button label="Sign out" variant="danger" onPress={() => void signOut()} fullWidth style={{ marginTop: spacing.sm }} />
    </View>
  );
}
