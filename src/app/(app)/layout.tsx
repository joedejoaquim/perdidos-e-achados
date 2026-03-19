import { redirect } from "next/navigation";

import { AuthProvider } from "@/components/auth/AuthProvider";
import { AppShell } from "@/components/layout/AppShell";
import { ensureUserProfile } from "@/lib/auth-profile";
import { createServerSupabaseClient } from "@/lib/supabase-server";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login");
  }

  const profile = await ensureUserProfile(user);

  return (
    <AuthProvider initialUser={profile}>
      <AppShell initialUser={profile}>{children}</AppShell>
    </AuthProvider>
  );
}
