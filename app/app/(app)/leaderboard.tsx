import React, { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Text,
  View,
} from "react-native";
import { useAuth } from "../../src/context/AuthContext";
import { nakamaClient } from "../../src/lib/nakama";
import { headingProps } from "../../src/lib/heading";
import { useTheme } from "../../src/theme/ThemeProvider";

const LEADERBOARD_ID = "liarsdice_wins";
const PAGE_SIZE = 20;

interface LeaderboardRow {
  rank: number;
  userId: string;
  username: string;
  displayName: string;
  score: number;
  isMe: boolean;
}

function RankBadge({ rank }: { rank: number }) {
  const { colors, typography } = useTheme();
  const medals: Record<number, string> = { 1: "🥇", 2: "🥈", 3: "🥉" };
  if (medals[rank]) {
    return (
      <Text style={{ fontSize: 20, width: 32, textAlign: "center" }}>{medals[rank]}</Text>
    );
  }
  return (
    <Text
      style={{
        fontFamily: typography.caption.fontFamily,
        fontSize: 13,
        color: colors.textSecondary,
        width: 32,
        textAlign: "center",
      }}
    >
      {rank}
    </Text>
  );
}

function LeaderRow({ row }: { row: LeaderboardRow }) {
  const { colors, spacing, typography } = useTheme();
  return (
    <View
      style={{
        flexDirection: "row",
        alignItems: "center",
        gap: spacing.sm,
        paddingVertical: spacing.sm,
        paddingHorizontal: spacing.md,
        backgroundColor: row.isMe ? colors.surface : "transparent",
        borderRadius: row.isMe ? 10 : 0,
        marginBottom: 2,
      }}
    >
      <RankBadge rank={row.rank} />
      <View style={{ flex: 1 }}>
        <Text
          style={{
            fontFamily: row.isMe ? typography.bodyMedium.fontFamily : typography.body.fontFamily,
            fontSize: 15,
            color: row.isMe ? colors.primary : colors.textPrimary,
          }}
          numberOfLines={1}
        >
          {row.displayName || row.username}
          {row.isMe ? " (you)" : ""}
        </Text>
        <Text
          style={{
            fontFamily: typography.caption.fontFamily,
            fontSize: 12,
            color: colors.textSecondary,
          }}
        >
          @{row.username}
        </Text>
      </View>
      <Text
        style={{
          fontFamily: typography.bodyMedium.fontFamily,
          fontSize: 16,
          color: colors.textPrimary,
        }}
      >
        {row.score}
      </Text>
      <Text
        style={{
          fontFamily: typography.caption.fontFamily,
          fontSize: 11,
          color: colors.textSecondary,
          width: 30,
        }}
      >
        wins
      </Text>
    </View>
  );
}

export default function LeaderboardScreen() {
  const { colors, spacing, typography } = useTheme();
  const { session } = useAuth();

  const [records, setRecords] = useState<LeaderboardRow[]>([]);
  const [myRecord, setMyRecord] = useState<LeaderboardRow | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadLeaderboard = useCallback(async () => {
    if (!session) return;
    setLoading(true);
    setError(null);
    try {
      const myId = session.user_id ?? "";
      const result = await nakamaClient.listLeaderboardRecords(
        session,
        LEADERBOARD_ID,
        myId ? [myId] : [],
        PAGE_SIZE,
        undefined,
        undefined,
      );

      const rows: LeaderboardRow[] = (result.records ?? []).map((r, idx) => ({
        rank: r.rank ?? idx + 1,
        userId: r.owner_id ?? "",
        username: r.username ?? "",
        displayName: r.username ?? "",
        score: r.score ?? 0,
        isMe: (r.owner_id ?? "") === myId,
      }));

      setRecords(rows);

      // Show the current user's record even if outside top N.
      const ownRecord = result.owner_records?.find((r) => r.owner_id === myId);
      if (ownRecord && !rows.some((r) => r.isMe)) {
        setMyRecord({
          rank: ownRecord.rank ?? 0,
          userId: myId,
          username: ownRecord.username ?? "",
          displayName: ownRecord.username ?? "",
          score: ownRecord.score ?? 0,
          isMe: true,
        });
      } else {
        setMyRecord(null);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load leaderboard");
    } finally {
      setLoading(false);
    }
  }, [session]);

  useEffect(() => {
    void loadLeaderboard();
  }, [loadLeaderboard]);

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <View
        style={{
          padding: spacing.md,
          backgroundColor: colors.surfaceRaised,
          borderBottomWidth: 1,
          borderBottomColor: colors.border,
        }}
      >
        <Text
          {...headingProps(1)}
          style={{
            fontFamily: typography.h3.fontFamily,
            fontSize: typography.h3.fontSize,
            color: colors.textPrimary,
          }}
        >
          Leaderboard
        </Text>
        <Text
          style={{
            fontFamily: typography.caption.fontFamily,
            fontSize: 12,
            color: colors.textSecondary,
            marginTop: 2,
          }}
        >
          Top players by total wins
        </Text>
      </View>

      {loading ? (
        <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
          <ActivityIndicator color={colors.primary} />
        </View>
      ) : error ? (
        <View style={{ flex: 1, alignItems: "center", justifyContent: "center", padding: spacing.lg }}>
          <Text style={{ color: colors.danger, fontFamily: typography.body.fontFamily, textAlign: "center" }}>
            {error}
          </Text>
        </View>
      ) : (
        <FlatList
          data={records}
          keyExtractor={(item) => item.userId}
          contentContainerStyle={{ paddingVertical: spacing.sm }}
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
              No records yet — play some multiplayer games to appear here!
            </Text>
          }
          ListFooterComponent={
            myRecord ? (
              <View
                style={{
                  borderTopWidth: 1,
                  borderTopColor: colors.border,
                  marginTop: spacing.sm,
                }}
              >
                <Text
                  style={{
                    fontFamily: typography.caption.fontFamily,
                    fontSize: 11,
                    color: colors.textSecondary,
                    textTransform: "uppercase",
                    letterSpacing: 1,
                    padding: spacing.sm,
                    paddingHorizontal: spacing.md,
                  }}
                >
                  Your rank
                </Text>
                <LeaderRow row={myRecord} />
              </View>
            ) : null
          }
          renderItem={({ item }) => <LeaderRow row={item} />}
        />
      )}
    </View>
  );
}
