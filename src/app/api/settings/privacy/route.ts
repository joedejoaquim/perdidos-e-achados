import { NextRequest, NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase-server";
import { UserPrivacySettings } from "@/types";

const DEFAULTS: Omit<UserPrivacySettings, "id" | "user_id" | "created_at" | "updated_at"> = {
  public_profile: true,
  allow_contact: false,
  items_visibility: "friends",
};

export async function GET() {
  try {
    const supabase = await createServerSupabaseClient();
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { data, error } = await supabase
      .from("user_privacy_settings")
      .select("*")
      .eq("user_id", session.user.id)
      .single();

    if (error && error.code === "PGRST116") {
      return NextResponse.json({ success: true, data: { ...DEFAULTS, user_id: session.user.id } });
    }

    if (error) throw error;
    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error("Error fetching privacy settings:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient();
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await req.json();
    const { data, error } = await supabase
      .from("user_privacy_settings")
      .upsert(
        { ...body, user_id: session.user.id, updated_at: new Date().toISOString() },
        { onConflict: "user_id" }
      )
      .select()
      .single();

    if (error) throw error;
    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error("Error updating privacy settings:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE() {
  try {
    const supabase = await createServerSupabaseClient();
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    // Apagar todos os dados do utilizador e a conta de auth
    const userId = session.user.id;

    // Apagar dados relacionados (cascata já trata a maioria, mas garantimos)
    await supabase.from("user_notification_preferences").delete().eq("user_id", userId);
    await supabase.from("user_privacy_settings").delete().eq("user_id", userId);
    await supabase.from("users").delete().eq("id", userId);

    // Apagar conta de auth (requer service role — feito via admin client)
    const { createClient } = await import("@supabase/supabase-js");
    const adminClient = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      { auth: { autoRefreshToken: false, persistSession: false } }
    );
    await adminClient.auth.admin.deleteUser(userId);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting account:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
