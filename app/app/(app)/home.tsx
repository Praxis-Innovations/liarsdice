import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { useAuth } from "../../src/context/AuthContext";
import { COLORS, SPACING } from "../../src/theme";

export default function HomeScreen() {
  const { user } = useAuth();
  const display_name = (user?.user_metadata?.display_name as string | undefined) || user?.email || "there";

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Welcome, {display_name}</Text>
      <Text style={styles.body}>This is the Home tab — replace with your app's actual content.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background, padding: SPACING.lg, gap: SPACING.sm },
  title: { fontSize: 22, fontWeight: "700", color: COLORS.textPrimary },
  body: { fontSize: 15, color: COLORS.textSecondary },
});
