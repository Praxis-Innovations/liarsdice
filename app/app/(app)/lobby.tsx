import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  Text,
  TextInput,
  View,
} from "react-native";
import { useRouter } from "expo-router";
import { Button } from "../../src/components/ui/Button";
import { useAuth } from "../../src/context/AuthContext";
import { useMultiplayerStore } from "../../src/store/multiplayerStore";
import { headingProps } from "../../src/lib/heading";
import { useTheme } from "../../src/theme/ThemeProvider";

type LobbyView = "menu" | "waiting" | "joining";

export default function LobbyScreen() {
  const { colors, spacing, typography } = useTheme();
  const { session } = useAuth();
  const router = useRouter();
  const store = useMultiplayerStore();

  const [view, setView] = useState<LobbyView>("menu");
  const [joinCode, setJoinCode] = useState("");
  const [connecting, setConnecting] = useState(false);
  const [ownMatchId, setOwnMatchId] = useState<string | null>(null);

  // Connect socket when the screen mounts (idempotent).
  useEffect(() => {
    if (!session) return;
    void store.connect(session);
  }, [session, store]);

  // Navigate to multiplayer game when match starts.
  useEffect(() => {
    if (store.phase === "playing") {
      router.replace("/play?mode=multiplayer");
    }
  }, [store.phase, router]);

  const handlePlayOnline = async () => {
    setConnecting(true);
    try {
      const matchId = await store.findMatch({ maxPlayers: 2 });
      await store.joinMatch(matchId);
      store.sendReady();
      setView("waiting");
    } catch (err) {
      Alert.alert("Error", err instanceof Error ? err.message : "Failed to find a match");
    } finally {
      setConnecting(false);
    }
  };

  const handleCreatePrivate = async () => {
    setConnecting(true);
    try {
      const matchId = await store.createMatch({ maxPlayers: 2 });
      await store.joinMatch(matchId);
      setOwnMatchId(matchId);
      setView("waiting");
    } catch (err) {
      Alert.alert("Error", err instanceof Error ? err.message : "Failed to create match");
    } finally {
      setConnecting(false);
    }
  };

  const handleJoinCode = async () => {
    const code = joinCode.trim();
    if (!code) return;
    setConnecting(true);
    try {
      await store.joinMatch(code);
      store.sendReady();
    } catch (err) {
      Alert.alert("Error", err instanceof Error ? err.message : "Invalid match code");
    } finally {
      setConnecting(false);
    }
  };

  const handleReadyUp = () => {
    store.sendReady();
  };

  const handleCancel = () => {
    store.leaveMatch();
    setOwnMatchId(null);
    setView("menu");
  };

  const handleSoloPlay = () => {
    router.push("/play");
  };

  // ── Waiting room ────────────────────────────────────────────────────────────
  if (view === "waiting") {
    return (
      <View
        style={{
          flex: 1,
          backgroundColor: colors.background,
          padding: spacing.lg,
          alignItems: "center",
          justifyContent: "center",
          gap: spacing.md,
        }}
      >
        <ActivityIndicator size="large" color={colors.primary} />
        <Text
          style={{
            fontFamily: typography.h3.fontFamily,
            fontSize: typography.h3.fontSize,
            color: colors.textPrimary,
            textAlign: "center",
          }}
        >
          Waiting for opponent…
        </Text>

        {ownMatchId ? (
          <View style={{ alignItems: "center", gap: spacing.xs }}>
            <Text
              style={{
                fontFamily: typography.caption.fontFamily,
                fontSize: typography.caption.fontSize,
                color: colors.textSecondary,
              }}
            >
              Share this code with a friend
            </Text>
            <Text
              style={{
                fontFamily: typography.bodyMedium.fontFamily,
                fontSize: 18,
                color: colors.textPrimary,
                letterSpacing: 2,
                padding: spacing.sm,
                backgroundColor: colors.surface,
                borderRadius: 8,
              }}
            >
              {ownMatchId}
            </Text>
            <Button label="I'm ready" onPress={handleReadyUp} style={{ marginTop: spacing.sm }} />
          </View>
        ) : null}

        <Button
          label="Cancel"
          variant="ghost"
          onPress={handleCancel}
          style={{ marginTop: spacing.md }}
        />
      </View>
    );
  }

  // ── Join by code ─────────────────────────────────────────────────────────────
  if (view === "joining") {
    return (
      <View
        style={{
          flex: 1,
          backgroundColor: colors.background,
          padding: spacing.lg,
          gap: spacing.md,
          justifyContent: "center",
        }}
      >
        <Text
          {...headingProps(2)}
          style={{
            fontFamily: typography.h3.fontFamily,
            fontSize: typography.h3.fontSize,
            color: colors.textPrimary,
          }}
        >
          Join with code
        </Text>
        <TextInput
          value={joinCode}
          onChangeText={setJoinCode}
          placeholder="Paste match code"
          autoCapitalize="none"
          autoCorrect={false}
          style={{
            fontFamily: typography.body.fontFamily,
            fontSize: typography.body.fontSize,
            color: colors.textPrimary,
            backgroundColor: colors.surface,
            borderRadius: 10,
            padding: spacing.md,
          }}
          placeholderTextColor={colors.textSecondary}
        />
        <Button
          label="Join"
          loading={connecting}
          disabled={!joinCode.trim() || connecting}
          onPress={() => void handleJoinCode()}
          fullWidth
        />
        <Button
          label="Back"
          variant="ghost"
          onPress={() => setView("menu")}
          fullWidth
        />
      </View>
    );
  }

  // ── Main menu ────────────────────────────────────────────────────────────────
  return (
    <ScrollView
      contentContainerStyle={{
        flex: 1,
        backgroundColor: colors.background,
        padding: spacing.lg,
        gap: spacing.sm,
        justifyContent: "center",
      }}
    >
      <Text
        {...headingProps(1)}
        style={{
          fontFamily: typography.h2.fontFamily,
          fontSize: typography.h2.fontSize,
          color: colors.textPrimary,
          marginBottom: spacing.md,
        }}
      >
        Play Liar&apos;s Dice
      </Text>

      <Button
        label="Play online (random)"
        loading={connecting}
        disabled={connecting}
        onPress={() => void handlePlayOnline()}
        fullWidth
        style={{ marginBottom: spacing.xs }}
      />

      <Button
        label="Create private match"
        variant="secondary"
        loading={connecting}
        disabled={connecting}
        onPress={() => void handleCreatePrivate()}
        fullWidth
        style={{ marginBottom: spacing.xs }}
      />

      <Button
        label="Join with code"
        variant="secondary"
        disabled={connecting}
        onPress={() => setView("joining")}
        fullWidth
        style={{ marginBottom: spacing.xs }}
      />

      <View
        style={{
          height: 1,
          backgroundColor: colors.border,
          marginVertical: spacing.md,
        }}
      />

      <Button
        label="Play solo (vs AI)"
        variant="ghost"
        onPress={handleSoloPlay}
        fullWidth
      />

      {store.phase === "error" && store.errorMessage ? (
        <Text
          style={{
            color: colors.danger,
            fontFamily: typography.body.fontFamily,
            marginTop: spacing.sm,
            textAlign: "center",
          }}
        >
          {store.errorMessage}
        </Text>
      ) : null}
    </ScrollView>
  );
}
