import { NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase-server";

export async function GET() {
  try {
    const supabase = await createServerSupabaseClient();
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const userId = session.user.id;

    const [userRes, itemsRes, claimsRes, activitiesRes] = await Promise.all([
      supabase.from("users").select("id,email,name,phone,bio,xp,level,rating,kyc_status,verified,created_at").eq("id", userId).single(),
      supabase.from("found_items").select("*").eq("finder_id", userId),
      supabase.from("claims").select("*").or(`owner_id.eq.${userId},finder_id.eq.${userId}`),
      supabase.from("activities").select("*").eq("user_id", userId),
    ]);

    const exportData = {
      exported_at: new Date().toISOString(),
      user: userRes.data,
      found_items: itemsRes.data ?? [],
      claims: claimsRes.data ?? [],
      activities: activitiesRes.data ?? [],
    };

    return new NextResponse(JSON.stringify(exportData, null, 2), {
      headers: {
        "Content-Type": "application/json",
        "Content-Disposition": `attachment; filename="achados-dados-${userId}.json"`,
      },
    });
  } catch (error) {
    console.error("Error exporting data:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
