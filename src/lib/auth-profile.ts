import "server-only";

import type { User as AuthUser } from "@supabase/supabase-js";

import { supabaseAdmin } from "@/lib/supabase";

type ProfileOverrides = {
  name?: string;
  phone?: string;
  avatar_url?: string | null;
};

function isMissingTableError(message?: string | null) {
  return Boolean(
    message &&
      (message.includes("schema cache") ||
        message.includes("Could not find the table 'public."))
  );
}

function normalizeEmail(email?: string | null) {
  return email?.trim().toLowerCase() ?? "";
}

function buildProfilePayload(authUser: AuthUser, overrides: ProfileOverrides = {}) {
  const email = normalizeEmail(authUser.email);
  const metadata = authUser.user_metadata ?? {};
  const now = new Date().toISOString();

  return {
    id: authUser.id,
    email,
    name:
      overrides.name?.trim() ||
      metadata.name ||
      metadata.full_name ||
      metadata.user_name ||
      email.split("@")[0] ||
      "Usuario",
    phone: overrides.phone?.trim() || metadata.phone || "",
    avatar_url:
      overrides.avatar_url ?? metadata.avatar_url ?? metadata.picture ?? null,
    xp: 0,
    level: "bronze",
    rating: 0,
    rank_position: 0,
    kyc_status: "not_started",
    verified: Boolean(authUser.email_confirmed_at || metadata.email_verified),
    created_at: now,
    updated_at: now,
  };
}

export async function ensureUserProfile(
  authUser: AuthUser,
  overrides: ProfileOverrides = {}
) {
  if (!supabaseAdmin) {
    throw new Error("Supabase admin client is not available.");
  }

  const { data: existingProfile, error: existingError } = await supabaseAdmin
    .from("users")
    .select("*")
    .eq("id", authUser.id)
    .maybeSingle();

  if (existingError) {
    if (isMissingTableError(existingError.message)) {
      return buildProfilePayload(authUser, overrides);
    }

    throw new Error(`Failed to fetch user profile: ${existingError.message}`);
  }

  const payload = buildProfilePayload(authUser, overrides);

  if (!existingProfile) {
    const { data, error } = await supabaseAdmin
      .from("users")
      .insert([payload])
      .select("*")
      .single();

    if (error) {
      if (isMissingTableError(error.message)) {
        return payload;
      }

      throw new Error(`Failed to create user profile: ${error.message}`);
    }

    return data;
  }

  const updates: Record<string, unknown> = {};

  if (!existingProfile.email && payload.email) {
    updates.email = payload.email;
  }
  if ((!existingProfile.name || existingProfile.name === "Usuario") && payload.name) {
    updates.name = payload.name;
  }
  if (!existingProfile.phone && payload.phone) {
    updates.phone = payload.phone;
  }
  if (!existingProfile.avatar_url && payload.avatar_url) {
    updates.avatar_url = payload.avatar_url;
  }
  if (!existingProfile.verified && payload.verified) {
    updates.verified = true;
  }
  if (Object.keys(overrides).length > 0) {
    if (overrides.name) updates.name = overrides.name.trim();
    if (overrides.phone !== undefined) updates.phone = overrides.phone.trim();
    if (overrides.avatar_url !== undefined) updates.avatar_url = overrides.avatar_url;
  }

  if (Object.keys(updates).length === 0) {
    return existingProfile;
  }

  updates.updated_at = new Date().toISOString();

  const { data, error } = await supabaseAdmin
    .from("users")
    .update(updates)
    .eq("id", authUser.id)
    .select("*")
    .single();

  if (error) {
    if (isMissingTableError(error.message)) {
      return { ...existingProfile, ...updates };
    }

    throw new Error(`Failed to update user profile: ${error.message}`);
  }

  return data;
}
