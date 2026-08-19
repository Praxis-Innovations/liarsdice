function readString(value: string | undefined, fallback = ""): string {
  return String(value || fallback).trim();
}

export const clientPublicEnv = {
  nakamaHost: readString(process.env.EXPO_PUBLIC_NAKAMA_HOST, "localhost"),
  nakamaPort: readString(process.env.EXPO_PUBLIC_NAKAMA_PORT, "7350"),
  nakamaServerKey: readString(process.env.EXPO_PUBLIC_NAKAMA_SERVER_KEY, "defaultkey"),
  nakamaUseSSL: process.env.EXPO_PUBLIC_NAKAMA_USE_SSL === "true",
  googleWebClientId: readString(process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID),
  googleIosClientId: readString(process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID),
};
