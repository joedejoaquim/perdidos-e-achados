import { NextRequest, NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase-server";
import { UserNotificationPreferences } from "@/types";

export async function GET() {
  try {
    const supabase = await createServerSupabaseClient();
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { data, error } = await supabase
      .from("user_notification_preferences")
      .select("*")
      .eq("user_id", session.user.id)
      .single();

    if (error && error.code === "PGRST116") {
      // Não existe ainda — retorna defaults
      const defaults: Omit<UserNotificationPreferences, "id" | "created_at" | "updated_at"> = {
        user_id: session.user.id,
        push_enabled: true,
        email_enabled: true,
        nearby_enabled: true,
        weekly_summary: false,
        sound_enabled: true,
        vibration_enabled: true,
      };
      return NextResponse.json({ success: true, data: defaults });
    }

    if (error) throw error;
    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error("Error fetching notification preferences:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient();
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await req.json();
    const userId = session.user.id;

    const { data, error } = await supabase
      .from("user_notification_preferences")
      .upsert({ ...body, user_id: userId, updated_at: new Date().toISOString() }, { onConflict: "user_id" })
      .select()
      .single();

    if (error) throw error;
    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error("Error updating notification preferences:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
