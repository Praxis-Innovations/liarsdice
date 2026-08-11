import { Stack } from "expo-router";

export default function ContentLayout() {
  // The root NavigationThemeProvider paints the transition surface with the
  // active app theme. Keeping individual screens transparent avoids stale
  // native-stack contentStyle values after a theme change.
  return <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: "transparent" } }} />;
}
