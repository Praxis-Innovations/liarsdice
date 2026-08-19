import React, { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  Text,
  View,
} from "react-native";
import { useAuth } from "../../src/context/AuthContext";
import { nakamaClient } from "../../src/lib/nakama";
import { headingProps } from "../../src/lib/heading";
import { useTheme } from "../../src/theme/ThemeProvider";

// ─── Types ───────────────────────────────────────────────────────────────────

interface WalletBalance {
  coins: number;
  gems: number;
}

// ─── Coin card ───────────────────────────────────────────────────────────────

function CurrencyCard({
  emoji,
  label,
  amount,
  description,
}: {
  emoji: string;
  label: string;
  amount: number;
  description: string;
}) {
  const { colors, spacing, typography } = useTheme();
  return (
    <View
      style={{
        backgroundColor: colors.surface,
        borderRadius: 16,
        padding: spacing.md,
        gap: spacing.xs,
        flex: 1,
      }}
    >
      <Text style={{ fontSize: 32 }}>{emoji}</Text>
      <Text
        style={{
          fontFamily: typography.h3.fontFamily,
          fontSize: typography.h3.fontSize,
          color: colors.textPrimary,
        }}
      >
        {amount.toLocaleString()}
      </Text>
      <Text
        style={{
          fontFamily: typography.bodyMedium.fontFamily,
          fontSize: 13,
          color: colors.textSecondary,
        }}
      >
        {label}
      </Text>
      <Text
        style={{
          fontFamily: typography.caption.fontFamily,
          fontSize: 11,
          color: colors.textSecondary,
          marginTop: 2,
        }}
      >
        {description}
      </Text>
    </View>
  );
}

// ─── How to earn section ─────────────────────────────────────────────────────

function EarnRow({ icon, label, reward }: { icon: string; label: string; reward: string }) {
  const { colors, spacing, typography } = useTheme();
  return (
    <View
      style={{
        flexDirection: "row",
        alignItems: "center",
        gap: spacing.sm,
        paddingVertical: spacing.xs,
      }}
    >
      <Text style={{ fontSize: 20, width: 28, textAlign: "center" }}>{icon}</Text>
      <Text
        style={{
          flex: 1,
          fontFamily: typography.body.fontFamily,
          fontSize: 14,
          color: colors.textPrimary,
        }}
      >
        {label}
      </Text>
      <Text
        style={{
          fontFamily: typography.bodyMedium.fontFamily,
          fontSize: 14,
          color: colors.primary,
        }}
      >
        {reward}
      </Text>
    </View>
  );
}

// ─── Screen ──────────────────────────────────────────────────────────────────

export default function WalletScreen() {
  const { colors, spacing, typography } = useTheme();
  const { session } = useAuth();

  const [balance, setBalance] = useState<WalletBalance>({ coins: 0, gems: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadBalance = useCallback(async () => {
    if (!session) return;
    setLoading(true);
    setError(null);
    try {
      const account = await nakamaClient.getAccount(session);
      const raw = account.wallet ? (JSON.parse(account.wallet) as Record<string, number>) : {};
      setBalance({
        coins: raw.coins ?? 0,
        gems: raw.gems ?? 0,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load wallet");
    } finally {
      setLoading(false);
    }
  }, [session]);

  useEffect(() => {
    void loadBalance();
  }, [loadBalance]);

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      {/* Header */}
      <View
        style={{
          padding: spacing.md,
          backgroundColor: colors.surfaceRaised,
          borderBottomWidth: 1,
          borderBottomColor: colors.border,
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <View>
          <Text
            {...headingProps(1)}
            style={{
              fontFamily: typography.h3.fontFamily,
              fontSize: typography.h3.fontSize,
              color: colors.textPrimary,
            }}
          >
            Wallet
          </Text>
          <Text
            style={{
              fontFamily: typography.caption.fontFamily,
              fontSize: 12,
              color: colors.textSecondary,
              marginTop: 2,
            }}
          >
            Earn coins by playing multiplayer
          </Text>
        </View>
        <Pressable onPress={() => void loadBalance()}>
          <Text
            style={{
              fontFamily: typography.body.fontFamily,
              fontSize: 13,
              color: colors.primary,
            }}
          >
            Refresh
          </Text>
        </Pressable>
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
        <View style={{ padding: spacing.md, gap: spacing.md }}>
          {/* Balances */}
          <View style={{ flexDirection: "row", gap: spacing.sm }}>
            <CurrencyCard
              emoji="🪙"
              label="Coins"
              amount={balance.coins}
              description="Earned from multiplayer matches"
            />
            <CurrencyCard
              emoji="💎"
              label="Gems"
              amount={balance.gems}
              description="Premium currency (coming soon)"
            />
          </View>

          {/* How to earn */}
          <View
            style={{
              backgroundColor: colors.surface,
              borderRadius: 16,
              padding: spacing.md,
              gap: spacing.xs,
            }}
          >
            <Text
              style={{
                fontFamily: typography.bodyMedium.fontFamily,
                fontSize: 13,
                color: colors.textSecondary,
                textTransform: "uppercase",
                letterSpacing: 1,
                marginBottom: spacing.xs,
              }}
            >
              How to earn coins
            </Text>
            <EarnRow icon="🏆" label="Win a multiplayer match" reward="+100 coins" />
            <EarnRow icon="🎲" label="Play a multiplayer match" reward="+10 coins" />
            <EarnRow icon="🎯" label="Land a Spot On! call" reward="coming soon" />
            <EarnRow icon="🃏" label="Win without losing a die" reward="coming soon" />
          </View>

          {/* Future cosmetics teaser */}
          <View
            style={{
              backgroundColor: colors.surface,
              borderRadius: 16,
              padding: spacing.md,
              alignItems: "center",
              gap: spacing.xs,
            }}
          >
            <Text style={{ fontSize: 28 }}>🛒</Text>
            <Text
              style={{
                fontFamily: typography.bodyMedium.fontFamily,
                fontSize: 15,
                color: colors.textPrimary,
              }}
            >
              Shop coming soon
            </Text>
            <Text
              style={{
                fontFamily: typography.caption.fontFamily,
                fontSize: 12,
                color: colors.textSecondary,
                textAlign: "center",
              }}
            >
              Spend coins on dice skins, table themes, and custom emoji reactions
            </Text>
          </View>
        </View>
      )}
    </View>
  );
}
