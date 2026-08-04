function readString(value: string | undefined): string {
  return String(value || "").trim();
}

export const clientPublicEnv = {
  supabaseUrl: readString(process.env.EXPO_PUBLIC_SUPABASE_URL),
  supabaseAnonKey: readString(process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY),
  apiUrl: readString(process.env.EXPO_PUBLIC_API_URL) || "http://localhost:3001",
  googleWebClientId: readString(process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID),
  googleIosClientId: readString(process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID),
};
