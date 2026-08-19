import React, { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Text,
  TextInput,
  View,
} from "react-native";
import { Button } from "../../src/components/ui/Button";
import { useAuth } from "../../src/context/AuthContext";
import { nakamaClient } from "../../src/lib/nakama";
import { headingProps } from "../../src/lib/heading";
import { useTheme } from "../../src/theme/ThemeProvider";

// ─── Types ────────────────────────────────────────────────────────────────────

// Nakama friend state enum: 0=mutual, 1=sent invite, 2=received invite, 3=blocked
const FriendState = { MUTUAL: 0, SENT: 1, RECEIVED: 2, BLOCKED: 3 } as const;

interface FriendEntry {
  userId: string;
  username: string;
  displayName: string;
  state: number; // Nakama friend state
  online: boolean;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function stateLabel(state: number): string {
  switch (state) {
    case FriendState.MUTUAL: return "Friend";
    case FriendState.SENT: return "Request sent";
    case FriendState.RECEIVED: return "Wants to be friends";
    default: return "";
  }
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function FriendRow({
  entry,
  onAccept,
  onRemove,
}: {
  entry: FriendEntry;
  onAccept?: () => void;
  onRemove?: () => void;
}) {
  const { colors, spacing, typography } = useTheme();
  return (
    <View
      style={{
        flexDirection: "row",
        alignItems: "center",
        gap: spacing.sm,
        paddingVertical: spacing.sm,
        borderBottomWidth: 1,
        borderBottomColor: colors.border,
      }}
    >
      {/* Online indicator */}
      <View
        style={{
          width: 10,
          height: 10,
          borderRadius: 5,
          backgroundColor: entry.online ? "#22C55E" : colors.border,
        }}
      />
      <View style={{ flex: 1 }}>
        <Text
          style={{
            fontFamily: typography.bodyMedium.fontFamily,
            fontSize: 15,
            color: colors.textPrimary,
          }}
        >
          {entry.displayName || entry.username}
        </Text>
        <Text
          style={{
            fontFamily: typography.caption.fontFamily,
            fontSize: 12,
            color: colors.textSecondary,
          }}
        >
          @{entry.username} · {stateLabel(entry.state)}
        </Text>
      </View>
      {entry.state === FriendState.RECEIVED && onAccept ? (
        <Button label="Accept" compact onPress={onAccept} style={{ paddingHorizontal: 10 }} />
      ) : null}
      {onRemove ? (
        <Button label="Remove" compact variant="ghost" onPress={onRemove} />
      ) : null}
    </View>
  );
}

// ─── Screen ───────────────────────────────────────────────────────────────────

export default function FriendsScreen() {
  const { colors, spacing, typography } = useTheme();
  const { session } = useAuth();

  const [friends, setFriends] = useState<FriendEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [addUsername, setAddUsername] = useState("");
  const [adding, setAdding] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadFriends = useCallback(async () => {
    if (!session) return;
    setLoading(true);
    setError(null);
    try {
      const result = await nakamaClient.listFriends(session, undefined, 100, undefined);
      const entries: FriendEntry[] = (result.friends ?? []).map((f) => ({
        userId: f.user?.id ?? "",
        username: f.user?.username ?? "",
        displayName: f.user?.display_name ?? f.user?.username ?? "",
        state: f.state ?? FriendState.MUTUAL,
        online: f.user?.online ?? false,
      }));
      setFriends(entries);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load friends");
    } finally {
      setLoading(false);
    }
  }, [session]);

  useEffect(() => {
    void loadFriends();
  }, [loadFriends]);

  const handleAdd = async () => {
    if (!session || !addUsername.trim()) return;
    setAdding(true);
    setError(null);
    try {
      await nakamaClient.addFriends(session, [], [addUsername.trim()]);
      setAddUsername("");
      await loadFriends();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to send friend request");
    } finally {
      setAdding(false);
    }
  };

  const handleAccept = async (entry: FriendEntry) => {
    if (!session) return;
    try {
      await nakamaClient.addFriends(session, [entry.userId]);
      await loadFriends();
    } catch (err) {
      Alert.alert("Error", err instanceof Error ? err.message : "Failed to accept request");
    }
  };

  const handleRemove = async (entry: FriendEntry) => {
    if (!session) return;
    Alert.alert(
      "Remove friend",
      `Remove ${entry.displayName || entry.username}?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Remove",
          style: "destructive",
          onPress: async () => {
            try {
              await nakamaClient.deleteFriends(session, [entry.userId]);
              await loadFriends();
            } catch (err) {
              Alert.alert("Error", err instanceof Error ? err.message : "Failed to remove friend");
            }
          },
        },
      ],
    );
  };

  const mutualFriends = friends.filter((f) => f.state === FriendState.MUTUAL);
  const pendingIncoming = friends.filter((f) => f.state === FriendState.RECEIVED);
  const pendingOutgoing = friends.filter((f) => f.state === FriendState.SENT);

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      {/* Add friend input */}
      <View
        style={{
          padding: spacing.md,
          gap: spacing.sm,
          backgroundColor: colors.surfaceRaised,
          borderBottomWidth: 1,
          borderBottomColor: colors.border,
        }}
      >
        <Text
          {...headingProps(2)}
          style={{
            fontFamily: typography.bodyMedium.fontFamily,
            fontSize: 13,
            color: colors.textSecondary,
            textTransform: "uppercase",
            letterSpacing: 1,
          }}
        >
          Add by username
        </Text>
        <View style={{ flexDirection: "row", gap: spacing.sm, alignItems: "center" }}>
          <TextInput
            value={addUsername}
            onChangeText={setAddUsername}
            placeholder="@username"
            autoCapitalize="none"
            autoCorrect={false}
            returnKeyType="send"
            onSubmitEditing={() => void handleAdd()}
            style={{
              flex: 1,
              fontFamily: typography.body.fontFamily,
              fontSize: typography.body.fontSize,
              color: colors.textPrimary,
              backgroundColor: colors.surface,
              borderRadius: 10,
              padding: spacing.sm,
            }}
            placeholderTextColor={colors.textSecondary}
          />
          <Button
            label="Add"
            loading={adding}
            disabled={!addUsername.trim() || adding}
            onPress={() => void handleAdd()}
          />
        </View>
        {error ? (
          <Text style={{ color: colors.danger, fontFamily: typography.body.fontFamily, fontSize: 13 }}>
            {error}
          </Text>
        ) : null}
      </View>

      {loading ? (
        <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
          <ActivityIndicator color={colors.primary} />
        </View>
      ) : (
        <FlatList
          data={[
            ...pendingIncoming,
            ...pendingOutgoing,
            ...mutualFriends,
          ]}
          keyExtractor={(item) => item.userId}
          contentContainerStyle={{ padding: spacing.md }}
          ListEmptyComponent={
            <Text
              style={{
                fontFamily: typography.body.fontFamily,
                fontSize: typography.body.fontSize,
                color: colors.textSecondary,
                textAlign: "center",
                marginTop: spacing.xl,
              }}
            >
              No friends yet. Add one by username above!
            </Text>
          }
          renderItem={({ item }) => (
            <FriendRow
              entry={item}
              onAccept={
                item.state === FriendState.RECEIVED ? () => void handleAccept(item) : undefined
              }
              onRemove={
                item.state === FriendState.MUTUAL ? () => void handleRemove(item) : undefined
              }
            />
          )}
        />
      )}
    </View>
  );
}
