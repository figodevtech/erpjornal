import { NextResponse, type NextRequest } from "next/server";
import { atualizarSessaoSupabase } from "@/lib/supabase/proxy";

export async function proxy(request: NextRequest) {
  const { response, user } = await atualizarSessaoSupabase(request);
  const path = request.nextUrl.pathname;

  if ((path.startsWith("/erp") || path.startsWith("/api/protected")) && !user) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("callbackUrl", path);
    return NextResponse.redirect(loginUrl);
  }

  return response;
}

export const config = {
  matcher: ["/erp/:path*", "/api/protected/:path*"],
};
