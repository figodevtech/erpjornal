import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token;
    const path = req.nextUrl.pathname;

    // Rotas estritas de admin
    if (path.startsWith("/erp/admin") && token?.role !== "admin") {
      return NextResponse.rewrite(new URL("/403", req.url)); // Sem permissão
    }

    // Rotas de publicação (Editor e Admin apenas)
    if (path.startsWith("/api/publish") && token?.role !== "admin" && token?.role !== "editor") {
      return new NextResponse("Unauthorized", { status: 403 });
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token,
    },
  }
);

export const config = { 
  matcher: ["/erp/:path*", "/api/protected/:path*"] 
};
