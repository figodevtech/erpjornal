import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function proxy(req) {
    const token = req.nextauth.token;
    const path = req.nextUrl.pathname;

    const isStaff = ["admin", "editor", "reporter", "juridico"].includes(token?.role as string);
    const isERPRoute = path.startsWith("/erp");

    // Bloquear assinantes do ERP
    if (isERPRoute && !isStaff) {
      return NextResponse.rewrite(new URL("/403", req.url));
    }

    // Rotas estritas de admin
    if (path.startsWith("/erp/admin") && token?.role !== "admin") {
      return NextResponse.rewrite(new URL("/403", req.url));
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
