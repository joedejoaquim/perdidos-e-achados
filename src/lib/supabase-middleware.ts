import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

import { hasSupabaseConfig, supabaseAnonKey, supabaseUrl } from "@/lib/supabase";

const protectedRoutes = ["/dashboard", "/profile", "/claim"];
const authRoutes = ["/auth/login", "/auth/register"];

function matchesRoute(pathname: string, routes: string[]) {
  return routes.some((route) => pathname === route || pathname.startsWith(`${route}/`));
}

function getSafeRedirectPath(next: string | null) {
  if (!next || !next.startsWith("/")) return "/dashboard/owner";
  return next;
}

export async function updateSession(request: NextRequest) {
  if (!hasSupabaseConfig) {
    return NextResponse.next({ request });
  }

  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) =>
          request.cookies.set(name, value)
        );
        response = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) =>
          response.cookies.set(name, value, options)
        );
      },
    },
  });

  const { pathname, search } = request.nextUrl;
  const isProtectedRoute = matchesRoute(pathname, protectedRoutes);
  const isAuthRoute = matchesRoute(pathname, authRoutes);

  // Optimização Crítica de Navegação:
  // getSession() apenas valida o JWT localmente (instantâneo ~1ms). 
  // getUser() faz uma request externa ao Supabase (~200-500ms) a cada navegação de tela!
  // Como o middleware server apenas para roteamento visual, getSession() é a escolha ideal de performance.
  const { data: { session } } = await supabase.auth.getSession();
  const user = session?.user;

  if (isProtectedRoute && !user) {
    const loginUrl = new URL("/auth/login", request.url);
    loginUrl.searchParams.set("next", `${pathname}${search}`);
    return NextResponse.redirect(loginUrl);
  }

  if (isAuthRoute && user) {
    const nextPath = getSafeRedirectPath(request.nextUrl.searchParams.get("next"));
    return NextResponse.redirect(new URL(nextPath, request.url));
  }

  return response;
}
