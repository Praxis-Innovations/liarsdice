import { clientPublicEnv } from "../config/env";
import type { Profile, UpdateProfileRequest } from "../shared/types";

async function apiFetch<T>(path: string, accessToken: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${clientPublicEnv.apiUrl}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`,
      ...(init?.headers || {}),
    },
  });
  if (!response.ok) {
    const body = await response.json().catch(() => null);
    throw new Error(body?.error || `Request failed with status ${response.status}`);
  }
  return response.json() as Promise<T>;
}

export function fetchMe(accessToken: string): Promise<Profile> {
  return apiFetch<Profile>("/me", accessToken);
}

export function updateMe(accessToken: string, updates: UpdateProfileRequest): Promise<Profile> {
  return apiFetch<Profile>("/me", accessToken, {
    method: "PATCH",
    body: JSON.stringify(updates),
  });
}
