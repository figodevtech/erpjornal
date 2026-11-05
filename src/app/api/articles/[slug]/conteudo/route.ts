import { NextResponse } from "next/server";

import { obterSessao } from "@/lib/auth";
import { buscarArtigoPublicado } from "@/lib/data/artigos";
import { sanitizarHtmlArtigo } from "@/lib/html/sanitize";

const SEM_CACHE = { "Cache-Control": "private, no-store" };

/**
 * Corpo completo de uma matéria para leitores logados.
 *
 * A página da notícia é estática (ISR) e, em matérias exclusivas, mostra só o
 * trecho inicial; o componente CorpoPremium busca o restante aqui, depois de
 * confirmar a sessão no navegador. A sessão é conferida de novo no servidor.
 */
export async function GET(_request: Request, { params }: { params: Promise<{ slug: string }> }) {
  const sessao = await obterSessao();
  if (!sessao || sessao.user.status !== "ativo") {
    return NextResponse.json({ error: "Faça login para ler esta matéria." }, { status: 401, headers: SEM_CACHE });
  }

  const { slug } = await params;
  const artigo = await buscarArtigoPublicado(slug);
  if (!artigo) {
    return NextResponse.json({ error: "Matéria não encontrada." }, { status: 404, headers: SEM_CACHE });
  }

  return NextResponse.json({ corpoTexto: sanitizarHtmlArtigo(artigo.corpoTexto) }, { headers: SEM_CACHE });
}
