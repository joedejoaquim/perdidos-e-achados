import { NextRequest, NextResponse } from "next/server";
export const dynamic = 'force-dynamic';

import { supabase } from "@/lib/supabase";
import { ItemService } from "@/services/item.service";
import { GamificationService } from "@/services/gamification.service";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const finderId = searchParams.get("finder_id");
    const category = searchParams.get("category");
    const city = searchParams.get("city");

    const filters: any = {};
    if (category) filters.category = category;
    if (city) filters.city = city;
    if (finderId) filters.finder_id = finderId;

    let query = supabase.from("found_items").select("*");

    if (filters.category) query = query.eq("category", filters.category);
    if (filters.city) query = query.eq("city", filters.city);
    if (filters.finder_id) query = query.eq("finder_id", filters.finder_id);

    const { data, error } = await query.order("created_at", { ascending: false });

    if (error) throw error;

    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error("Error fetching items:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const {
      data: { user: authUser },
    } = await supabase.auth.getUser();

    if (!authUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();

    const item = await ItemService.createItem(authUser.id, body);

    // Add XP reward for registering item
    await GamificationService.rewardItemRegistration(authUser.id);

    return NextResponse.json(
      { success: true, data: item },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("Error creating item:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
