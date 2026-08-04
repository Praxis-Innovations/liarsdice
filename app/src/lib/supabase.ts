import { createClient } from "@supabase/supabase-js";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Platform } from "react-native";
import { clientPublicEnv } from "../config/env";

const url = clientPublicEnv.supabaseUrl;
const anonKey = clientPublicEnv.supabaseAnonKey;

if (!url || !anonKey) {
  console.warn("Supabase env missing (EXPO_PUBLIC_SUPABASE_URL, EXPO_PUBLIC_SUPABASE_ANON_KEY). Auth disabled.");
}

export const supabase =
  url && anonKey
    ? createClient(url, anonKey, {
        auth: {
          storage: AsyncStorage,
          autoRefreshToken: true,
          persistSession: true,
          // On web, read the session/recovery token out of the URL hash after an OAuth redirect.
          detectSessionInUrl: Platform.OS === "web",
        },
      })
    : null;
