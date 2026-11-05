import { NextResponse } from "next/server";

import { obterSessao } from "@/lib/auth";

// Dados da sessão nunca podem ser guardados por CDN ou cache compartilhado.
const SEM_CACHE = { "Cache-Control": "private, no-store" };

export async function GET() {
  const sessao = await obterSessao();

  if (!sessao) {
    return NextResponse.json({ sessao: null }, { status: 401, headers: SEM_CACHE });
  }

  return NextResponse.json({ sessao }, { headers: SEM_CACHE });
}
