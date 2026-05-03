import type { NextRequest } from "next/server";

import { updateSession } from "@/lib/supabase-middleware";

export async function middleware(request: NextRequest) {
  return updateSession(request);
}

export const config = {
  matcher: [
    /*
     * Corre apenas em rotas de página — exclui:
     * - _next/static (ficheiros estáticos)
     * - _next/image (optimização de imagens)
     * - favicon.ico, robots.txt, sitemap.xml
     * - ficheiros com extensão (imagens, fontes, etc.)
     * - rotas de API (tratadas pelo próprio handler)
     */
    "/((?!api|_next/static|_next/image|favicon\\.ico|robots\\.txt|sitemap\\.xml|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|woff|woff2|ttf|otf|css|js)$).*)",
  ],
};
