import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { createServerSupabaseClient } from "@/lib/supabase-server";
import { UserPrivacySettings, ItemsVisibility } from "@/types";

const DEFAULTS: Omit<UserPrivacySettings, "id" | "user_id" | "created_at" | "updated_at"> = {
  public_profile: true,
  allow_contact: false,
  items_visibility: "friends",
};

const VISIBILITY_VALUES: ItemsVisibility[] = ["everyone", "friends", "only_me"];

// Admin client para operações que requerem service role (ex: deleteUser)
function getAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );
}

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

    const body = await req.json() as Record<string, unknown>;

    // Validar e sanitizar campos permitidos
    const sanitized: Partial<UserPrivacySettings> = {};
    if ("public_profile" in body && typeof body.public_profile === "boolean") {
      sanitized.public_profile = body.public_profile;
    }
    if ("allow_contact" in body && typeof body.allow_contact === "boolean") {
      sanitized.allow_contact = body.allow_contact;
    }
    if ("items_visibility" in body && VISIBILITY_VALUES.includes(body.items_visibility as ItemsVisibility)) {
      sanitized.items_visibility = body.items_visibility as ItemsVisibility;
    }

    if (Object.keys(sanitized).length === 0) {
      return NextResponse.json({ error: "Nenhum campo válido para actualizar" }, { status: 400 });
    }

    const { data, error } = await supabase
      .from("user_privacy_settings")
      .upsert(
        { ...sanitized, user_id: session.user.id, updated_at: new Date().toISOString() },
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

    const userId = session.user.id;

    // Apagar dados do utilizador (a cascata ON DELETE CASCADE trata o resto)
    await supabase.from("user_notification_preferences").delete().eq("user_id", userId);
    await supabase.from("user_privacy_settings").delete().eq("user_id", userId);
    await supabase.from("users").delete().eq("id", userId);

    // Apagar conta de auth via service role
    const adminClient = getAdminClient();
    const { error: authError } = await adminClient.auth.admin.deleteUser(userId);
    if (authError) throw authError;

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting account:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
