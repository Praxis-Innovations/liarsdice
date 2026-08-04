import { Router } from "express";
import { supabase } from "../db";
import { requireAuth } from "../middleware/auth";
import type { AuthenticatedRequest } from "../types";
import type { Profile, UpdateProfileRequest } from "../shared/types";

export const meRouter = Router();

interface ProfileRow {
  id: string;
  display_name: string;
  avatar_url: string | null;
  created_at: string;
  updated_at: string;
}

function toProfile(row: ProfileRow): Profile {
  return {
    id: row.id,
    displayName: row.display_name,
    avatarUrl: row.avatar_url,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

meRouter.get("/me", requireAuth, async (req: AuthenticatedRequest, res) => {
  if (!supabase) {
    res.status(503).json({ error: "Database not configured" });
    return;
  }
  const { data, error } = await supabase
    .from("profiles")
    .select("id, display_name, avatar_url, created_at, updated_at")
    .eq("id", req.userId)
    .single<ProfileRow>();

  if (error || !data) {
    res.status(404).json({ error: "Profile not found" });
    return;
  }
  res.json(toProfile(data));
});

meRouter.patch("/me", requireAuth, async (req: AuthenticatedRequest, res) => {
  if (!supabase) {
    res.status(503).json({ error: "Database not configured" });
    return;
  }
  const body = req.body as UpdateProfileRequest;
  const updates: Partial<ProfileRow> = {};
  if (typeof body.displayName === "string") {
    const trimmed = body.displayName.trim();
    if (!trimmed) {
      res.status(400).json({ error: "displayName cannot be empty" });
      return;
    }
    updates.display_name = trimmed.slice(0, 60);
  }
  if (body.avatarUrl !== undefined) {
    updates.avatar_url = body.avatarUrl;
  }
  if (Object.keys(updates).length === 0) {
    res.status(400).json({ error: "No fields to update" });
    return;
  }

  const { data, error } = await supabase
    .from("profiles")
    .update(updates)
    .eq("id", req.userId)
    .select("id, display_name, avatar_url, created_at, updated_at")
    .single<ProfileRow>();

  if (error || !data) {
    res.status(400).json({ error: error?.message ?? "Failed to update profile" });
    return;
  }
  res.json(toProfile(data));
});
