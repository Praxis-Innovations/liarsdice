import { Redirect, Stack } from "expo-router";
import { ActivityIndicator, StyleSheet, View } from "react-native";
import { useAuth } from "../../src/context/AuthContext";
import { COLORS } from "../../src/theme";

export default function AuthLayout() {
  const { session, loading, isRecoveryFlow } = useAuth();

  if (loading) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator />
      </View>
    );
  }

  // A password-recovery link also establishes a session, but the user should land on
  // reset-password rather than be bounced straight into the app.
  if (session && !isRecoveryFlow) {
    return <Redirect href="/home" />;
  }

  return <Stack screenOptions={{ headerShown: false }} />;
}

const styles = StyleSheet.create({
  loading: { flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: COLORS.background },
});
