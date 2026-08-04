// Source of truth for types shared between app/ and server/. Copy-synced (not imported) into
// both apps by scripts/sync-shared.js — edit only this file, then run `npm run sync:shared`.

export interface Profile {
  id: string;
  displayName: string;
  avatarUrl: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface UpdateProfileRequest {
  displayName?: string;
  avatarUrl?: string | null;
}

export interface ApiErrorResponse {
  error: string;
}
