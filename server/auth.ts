/**
 * Verify a Supabase-issued JWT and return the user id (sub claim).
 * Tries local HS256 verification against SUPABASE_JWT_SECRET first (fast, no network call),
 * then falls back to asking Supabase directly — this covers JWT signing-key rotations and any
 * token shape local verification doesn't recognize.
 */
import jwt from "jsonwebtoken";
import { getSupabaseServerEnv } from "./config/env";
import { supabase } from "./db";

const { jwtSecret: JWT_SECRET } = getSupabaseServerEnv();

function getRawToken(token: string | undefined): string {
  return typeof token === "string" ? token.replace(/^Bearer\s+/i, "").trim() : "";
}

export async function verifyTokenWithFallback(token: string | undefined): Promise<{ userId: string } | null> {
  const raw = getRawToken(token);
  if (!raw) return null;

  const local_result = verifyTokenLocally(raw, false);
  if (local_result) return local_result;

  if (!supabase) return null;
  try {
    const { data, error } = await supabase.auth.getUser(raw);
    if (error || !data?.user?.id) {
      console.warn("Auth: token rejected by both local verify and Supabase.");
      return null;
    }
    return { userId: data.user.id };
  } catch {
    console.warn("Auth: Supabase token verification failed.");
    return null;
  }
}

function verifyTokenLocally(raw_token: string, log_on_fail: boolean): { userId: string } | null {
  if (!raw_token) return null;
  if (!JWT_SECRET) {
    if (log_on_fail) {
      console.warn("Auth: SUPABASE_JWT_SECRET is not set. Local JWT verification disabled.");
    }
    return null;
  }

  // Supabase JWT secrets are often base64-encoded strings, which must be decoded to a Buffer
  // for jsonwebtoken. Try base64-decoded first, then fall back to the raw string.
  const secrets_to_try = [Buffer.from(JWT_SECRET, "base64"), JWT_SECRET];
  let payload: jwt.JwtPayload | null = null;

  for (const secret of secrets_to_try) {
    try {
      payload = jwt.verify(raw_token, secret, { algorithms: ["HS256"] }) as jwt.JwtPayload;
      break;
    } catch {
      // Try next secret format.
    }
  }

  if (!payload) {
    if (log_on_fail) {
      console.warn(
        "Auth: JWT verification failed. Ensure SUPABASE_JWT_SECRET matches Supabase Dashboard -> Settings -> API -> JWT Settings -> JWT Secret."
      );
    }
    return null;
  }

  const user_id = payload.sub;
  return user_id ? { userId: user_id } : null;
}
