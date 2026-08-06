import { Redirect, Stack } from "expo-router";
import { ActivityIndicator, View } from "react-native";
import { useAuth } from "../../src/context/AuthContext";
import { useTheme } from "../../src/theme/ThemeProvider";

export default function AuthLayout() {
  const { colors } = useTheme();
  const { session, loading, isRecoveryFlow } = useAuth();

  if (loading) {
    return (
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: colors.background }}>
        <ActivityIndicator color={colors.primary} />
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
