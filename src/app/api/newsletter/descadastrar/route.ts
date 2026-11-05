import { NextResponse, type NextRequest } from "next/server";

import { descadastrarPorToken } from "@/lib/newsletter/inscricao";
import { absoluteUrl } from "@/lib/site-url";

const SEM_CACHE = { "Cache-Control": "private, no-store" };

/**
 * Descadastro de um clique (RFC 8058): o Gmail/Outlook faz POST aqui quando a
 * pessoa clica em "Cancelar inscrição" (cabeçalho List-Unsubscribe-Post).
 */
export async function POST(request: NextRequest) {
  const ok = await descadastrarPorToken(request.nextUrl.searchParams.get("token"));
  return new NextResponse(ok ? "Inscrição cancelada." : "Inscrição não encontrada.", {
    status: ok ? 200 : 404,
    headers: { ...SEM_CACHE, "Content-Type": "text/plain; charset=utf-8" },
  });
}

/** Abrir o link (GET) não descadastra: mostra a página com o botão de confirmação. */
export async function GET(request: NextRequest) {
  const token = request.nextUrl.searchParams.get("token") ?? "";
  return NextResponse.redirect(absoluteUrl(`/newsletter/descadastrar?token=${encodeURIComponent(token)}`), {
    status: 303,
    headers: SEM_CACHE,
  });
}
