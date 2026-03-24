import { NextResponse } from "next/server";
import { ensureUserProfile } from "@/lib/auth-profile";
import { createServerSupabaseClient } from "@/lib/supabase-server";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  // Se redirecionamento for nulo, volta para a rota padrão do dashboard
  const next = searchParams.get("next") || "/dashboard/owner";

  if (code) {
    const supabase = await createServerSupabaseClient();
    const { data, error } = await supabase.auth.exchangeCodeForSession(code);

    if (error) {
      console.error(`[AUTH CALLBACK] ERROR exchanging code for session: ${error.message} (${error.status})`);
      const errorUrl = new URL("/auth/login", origin);
      errorUrl.searchParams.set("error", "oauth_callback");
      errorUrl.searchParams.set("msg", error.message);
      return NextResponse.redirect(errorUrl);
    }

    const user = data.user;

    if (user) {
      try {
        await ensureUserProfile(user);
      } catch (profileError) {
        console.error("DEBUG: Profile sync error (non-blocking):", profileError);
      }
    }
  }

  // Redireciona corretamente pra raiz ou URL pretendida baseada no domínio real da requisição original
  return NextResponse.redirect(new URL(next, origin));
}
