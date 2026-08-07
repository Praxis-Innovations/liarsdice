import React, { useCallback, useEffect, useState } from "react";
import { ActivityIndicator, Text, View } from "react-native";
import { Button } from "../../src/components/ui/Button";
import { TextField } from "../../src/components/ui/TextField";
import { useAuth } from "../../src/context/AuthContext";
import { fetchMe, updateMe } from "../../src/lib/api";
import type { Profile } from "../../src/shared/types";
import { useTheme } from "../../src/theme/ThemeProvider";

export default function ProfileScreen() {
  const { colors, spacing, typography } = useTheme();
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
      <Text style={{ fontSize: typography.body.fontSize, color: colors.textPrimary, fontFamily: typography.body.fontFamily }}>{user?.email}</Text>

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
        disabled={displayName === profile?.displayName}
        onPress={() => void handleSave()}
        fullWidth
        style={{ marginTop: spacing.lg }}
      />

      <Button label="Sign out" variant="danger" onPress={() => void signOut()} fullWidth style={{ marginTop: spacing.sm }} />
    </View>
  );
}
