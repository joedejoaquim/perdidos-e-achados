import { redirect } from "next/navigation";

import { AuthProvider } from "@/components/auth/AuthProvider";
import { AppShell } from "@/components/layout/AppShell";
import { createServerSupabaseClient } from "@/lib/supabase-server";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createServerSupabaseClient();
  const {
    data: { user: authUser },
  } = await supabase.auth.getUser();

  if (!authUser) {
    redirect("/auth/login");
  }

  // Fetch the profile from the database (read-only, no upsert)
  // ensureUserProfile was removed here because it ran on EVERY page load,
  // adding 1-2 extra DB queries. Profile sync now only happens at login/register/callback.
  const { data: profile } = await supabase
    .from("users")
    .select("*")
    .eq("id", authUser.id)
    .single();

  // Build a lightweight user object from auth data if profile doesn't exist yet
  const userForContext = profile ?? {
    id: authUser.id,
    email: authUser.email || "",
    name:
      authUser.user_metadata?.name ||
      authUser.user_metadata?.full_name ||
      authUser.email?.split("@")[0] ||
      "Usuario",
    phone: authUser.user_metadata?.phone || "",
    xp: 0,
    level: "bronze",
    rating: 0,
    rank_position: 0,
    kyc_status: "not_started",
    verified: Boolean(authUser.email_confirmed_at),
    avatar_url:
      authUser.user_metadata?.avatar_url || authUser.user_metadata?.picture || null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  return (
    <AuthProvider initialUser={userForContext}>
      <AppShell initialUser={userForContext}>{children}</AppShell>
    </AuthProvider>
  );
}
