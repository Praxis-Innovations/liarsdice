/**
 * Supabase client with the service-role key (bypasses RLS). Server-side only — never ship
 * SUPABASE_SERVICE_ROLE_KEY to a client. Requires SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY.
 */
import { createClient, SupabaseClient } from "@supabase/supabase-js";
import { getSupabaseServerEnv } from "./config/env";

const { url, serviceRoleKey: service_role_key } = getSupabaseServerEnv();

if (!url || !service_role_key) {
  console.warn(
    "Supabase env missing (SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY). DB access will be disabled."
  );
}

export const supabase: SupabaseClient | null =
  url && service_role_key ? createClient(url, service_role_key) : null;
