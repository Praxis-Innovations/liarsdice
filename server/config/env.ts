function readString(value: string | null | undefined): string {
  return String(value || "").trim();
}

export interface ServerRuntimeEnv {
  port: number;
  nodeEnv: string;
  corsOrigins: string;
}

export interface SupabaseServerEnv {
  url: string;
  serviceRoleKey: string;
  jwtSecret: string;
}

export function getServerRuntimeEnv(env: NodeJS.ProcessEnv = process.env): ServerRuntimeEnv {
  const parsed_port = Number(env.PORT);
  return {
    port: Number.isFinite(parsed_port) && parsed_port > 0 ? Math.trunc(parsed_port) : 3001,
    nodeEnv: readString(env.NODE_ENV) || "development",
    corsOrigins: readString(env.CORS_ORIGINS),
  };
}

export function getSupabaseServerEnv(env: NodeJS.ProcessEnv = process.env): SupabaseServerEnv {
  return {
    url: readString(env.SUPABASE_URL),
    serviceRoleKey: readString(env.SUPABASE_SERVICE_ROLE_KEY),
    jwtSecret: readString(env.SUPABASE_JWT_SECRET),
  };
}
