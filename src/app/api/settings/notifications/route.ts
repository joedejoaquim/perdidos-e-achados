import { NextRequest, NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase-server";
import { UserNotificationPreferences } from "@/types";

const ALLOWED_KEYS: Array<keyof Omit<UserNotificationPreferences, "id" | "user_id" | "created_at" | "updated_at">> = [
  "push_enabled", "email_enabled", "nearby_enabled",
  "weekly_summary", "sound_enabled", "vibration_enabled",
];

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

    const body = await req.json() as Record<string, unknown>;

    // Só permite campos válidos
    const sanitized: Record<string, unknown> = {};
    for (const key of ALLOWED_KEYS) {
      if (key in body && typeof body[key] === "boolean") {
        sanitized[key] = body[key];
      }
    }

    if (Object.keys(sanitized).length === 0) {
      return NextResponse.json({ error: "Nenhum campo válido para actualizar" }, { status: 400 });
    }

    const { data, error } = await supabase
      .from("user_notification_preferences")
      .upsert(
        { ...sanitized, user_id: session.user.id, updated_at: new Date().toISOString() },
        { onConflict: "user_id" }
      )
      .select()
      .single();

    if (error) throw error;
    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error("Error updating notification preferences:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
