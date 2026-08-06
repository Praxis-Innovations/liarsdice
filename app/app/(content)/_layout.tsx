import { Stack } from "expo-router";

export default function ContentLayout() {
  // Transparent (not colors.background): React Navigation's native-stack applies
  // contentStyle imperatively outside React's normal reconciliation, so a
  // theme-dependent value here can go stale after the initial render on some
  // routes/viewports. Transparent never needs to update — each screen's own
  // ScrollView paints the real theme background underneath.
  return <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: "transparent" } }} />;
}
