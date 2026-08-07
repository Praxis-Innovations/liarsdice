// AsyncStorage has no native module under Jest — use the official mock globally.
jest.mock("@react-native-async-storage/async-storage", () =>
  require("@react-native-async-storage/async-storage/jest/async-storage-mock"),
);

// Reanimated needs the package mock for any component using AnimatedPressable/moti.
jest.mock("react-native-reanimated", () => require("react-native-reanimated/mock"));

// Vector icons pull expo-font → expo-asset; stub for UI tests (no RN imports here —
// jest.mock factories cannot touch out-of-scope NativeWind/RN bindings).
jest.mock("@expo/vector-icons", () => {
  const MockIcon = () => null;
  return {
    Ionicons: MockIcon,
    MaterialIcons: MockIcon,
    MaterialCommunityIcons: MockIcon,
    FontAwesome: MockIcon,
    Feather: MockIcon,
  };
});
