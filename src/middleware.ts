import { createMiddlewareClient } from "@supabase/auth-helpers-nextjs";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function middleware(req: NextRequest) {
  const res = NextResponse.next();
  const supabase = createMiddlewareClient({ req, res });

  const {
    data: { session },
  } = await supabase.auth.getSession();

  const pathname = req.nextUrl.pathname;

  // Protected routes
  const isProtectedRoute = pathname.startsWith("/dashboard") || 
                           pathname.startsWith("/profile") || 
                           pathname.startsWith("/claim");
  
  // Auth routes
  const isAuthRoute = pathname.startsWith("/auth/login") || 
                      pathname.startsWith("/auth/register");

  if (isProtectedRoute && !session) {
    return NextResponse.redirect(new URL("/auth/login", req.url));
  }

  if (isAuthRoute && session) {
    return NextResponse.redirect(new URL("/dashboard", req.url));
  }

  return res;
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
