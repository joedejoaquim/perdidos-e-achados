import { NextResponse } from "next/server";
import { ensureUserProfile } from "@/lib/auth-profile";
import { createServerSupabaseClient } from "@/lib/supabase-server";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  // Se redirecionamento for nulo, volta para a rota padrão do dashboard
  const next = searchParams.get("next") || "/dashboard/owner";

<<<<<<< HEAD
  if (!code) {
    console.error("DEBUG: Missing OAuth code in callback");
    return NextResponse.redirect(new URL("/auth/login?error=missing_code", origin));
  }

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
      // Sincroniza o perfil do usuário (Google -> Tabela public.users)
      await ensureUserProfile(user);
    } catch (profileError) {
      console.error("DEBUG: Profile sync error (non-blocking):", profileError);
    }
  }

  // Melhora na lógica de redirecionamento para evitar LOOPS no localhost
  // Se estivermos em produção atrás de um proxy, garantimos que o origin seja respeitado
  const forwardedHost = request.headers.get("x-forwarded-host");
  const isProd = process.env.NODE_ENV !== "development";
  
  if (isProd && forwardedHost) {
    const protocol = request.headers.get("x-forwarded-proto") || "https";
    return NextResponse.redirect(`${protocol}://${forwardedHost}${next}`);
  }

  // No localhost, usamos o origin detectado da requisição
  return NextResponse.redirect(new URL(next, origin));
=======
  if (code) {
    const supabase = createRouteHandlerClient({ cookies });

    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (error) {
      console.error("Erro ao trocar code por sessão:", error);
      return NextResponse.redirect(new URL("/auth/login", request.url));
    }
  }

  return NextResponse.redirect(new URL("/dashboard", request.url));
>>>>>>> origin/main
}
