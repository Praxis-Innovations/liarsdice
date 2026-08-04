// app.config.js — dynamic Expo config layered on top of app.json. Wires up Google/Apple
// sign-in plugins and reads EXPO_PUBLIC_* env vars. See docs/SETUP_GOOGLE_OAUTH.md and
// docs/SETUP_APPLE_SIGNIN.md for what populates these.
const fs = require("fs");
const path = require("path");

const ANDROID_GOOGLE_SERVICES_FILE = "./google-services.json";
const IOS_GOOGLE_SERVICES_FILE = "./GoogleService-Info.plist";

const hasAndroidGoogleServicesFile = fs.existsSync(path.resolve(__dirname, ANDROID_GOOGLE_SERVICES_FILE));
const hasIosGoogleServicesFile = fs.existsSync(path.resolve(__dirname, IOS_GOOGLE_SERVICES_FILE));

module.exports = ({ config }) => ({
  ...config,
  ios: {
    ...config.ios,
    ...(hasIosGoogleServicesFile ? { googleServicesFile: IOS_GOOGLE_SERVICES_FILE } : {}),
    entitlements: {
      ...(config.ios?.entitlements || {}),
      "com.apple.developer.applesignin": ["Default"],
    },
  },
  android: {
    ...config.android,
    ...(hasAndroidGoogleServicesFile ? { googleServicesFile: ANDROID_GOOGLE_SERVICES_FILE } : {}),
  },
  plugins: [
    ...(config.plugins || []),
    "expo-apple-authentication",
    (() => {
      const iosUrlScheme = process.env.EXPO_PUBLIC_GOOGLE_IOS_URL_SCHEME || "";
      // Passing an options object switches the plugin to the non-Firebase config path, which
      // requires a non-empty iosUrlScheme and throws otherwise — only opt in once configured.
      return iosUrlScheme
        ? ["@react-native-google-signin/google-signin", { iosUrlScheme }]
        : "@react-native-google-signin/google-signin";
    })(),
  ],
});
