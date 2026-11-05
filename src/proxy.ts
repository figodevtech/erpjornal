import { NextResponse, type NextRequest } from "next/server";
import { atualizarSessaoSupabase } from "@/lib/supabase/proxy";

export async function proxy(request: NextRequest) {
  const { response, user } = await atualizarSessaoSupabase(request);
  const path = request.nextUrl.pathname;

  // Server actions conferem sessão e permissão dentro de cada uma (todas as do ERP
  // fazem isso) e respondem no formato que o cliente entende. Redirecionar aqui
  // transformaria, por exemplo, o salvamento automático com sessão expirada num
  // erro genérico no navegador. Esta checagem é só a barreira otimista das páginas.
  const ehServerAction = request.method === "POST" && request.headers.has("next-action");

  if ((path.startsWith("/erp") || path.startsWith("/api/protected")) && !user && !ehServerAction) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("callbackUrl", path);
    return NextResponse.redirect(loginUrl);
  }

  return response;
}

export const config = {
  matcher: ["/erp/:path*", "/api/protected/:path*"],
};
