import { NextRequest, NextResponse } from "next/server";

import { supabase } from "@/lib/supabase";
import { createServerSupabaseClient } from "@/lib/supabase-server";
import { GamificationService } from "@/services/gamification.service";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const finderId = searchParams.get("finder_id");
    const category = searchParams.get("category");
    const city = searchParams.get("city");
    const state = searchParams.get("state");
    const status = searchParams.get("status");
    const q = searchParams.get("q")?.trim();

    const filters: Record<string, string> = {};
    if (category) filters.category = category;
    if (city) filters.city = city;
    if (finderId) filters.finder_id = finderId;
    if (state) filters.state = state;
    if (status) filters.status = status;

    let query = supabase.from("found_items").select("*");

    if (filters.category) query = query.eq("category", filters.category);
    if (filters.city) query = query.eq("city", filters.city);
    if (filters.finder_id) query = query.eq("finder_id", filters.finder_id);
    if (filters.state) query = query.eq("state", filters.state);
    if (filters.status) query = query.eq("status", filters.status);
    if (q) {
      const safeQuery = q.replace(/[,%]/g, " ");
      query = query.or(
        `title.ilike.%${safeQuery}%,description.ilike.%${safeQuery}%,city.ilike.%${safeQuery}%,state.ilike.%${safeQuery}%`
      );
    }

    const { data, error } = await query.order("created_at", { ascending: false });

    if (error) {
      throw error;
    }

    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error("Error fetching items:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const authSupabase = await createServerSupabaseClient();
    const {
      data: { user: authUser },
    } = await authSupabase.auth.getUser();

    if (!authUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const {
      title,
      description,
      category,
      city,
      state,
      reward_value,
      photo_url,
      location_lat,
      location_lng,
    } = body ?? {};

    if (!title || !category || !city || !state) {
      return NextResponse.json(
        { error: "Campos obrigatorios: title, category, city e state." },
        { status: 400 }
      );
    }

    const { data: item, error } = await authSupabase
      .from("found_items")
      .insert([
        {
          title,
          description: description?.trim() || null,
          category,
          city: city.trim(),
          state: state.trim().toUpperCase(),
          reward_value: Number(reward_value ?? 0),
          photo_url: photo_url ?? null,
          location_lat: location_lat ?? null,
          location_lng: location_lng ?? null,
          finder_id: authUser.id,
          status: "available",
        },
      ])
      .select("*")
      .single();

    if (error || !item) {
      throw error ?? new Error("Falha ao criar item");
    }

    try {
      await GamificationService.rewardItemRegistration(authUser.id);
    } catch (rewardError) {
      console.error("Error rewarding item registration:", rewardError);
    }

    return NextResponse.json({ success: true, data: item }, { status: 201 });
  } catch (error: unknown) {
    console.error("Error creating item:", error);
    return NextResponse.json({ error: error instanceof Error ? error.message : "Erro desconhecido" }, { status: 500 });
  }
}
