import { NextResponse } from "next/server";

import { registrarVisualizacao } from "@/lib/analytics/visualizacoes";
import { filtroArtigoNoAr } from "@/lib/data/artigos";
import { prisma } from "@/lib/prisma";
import { getIP, viewRateLimit } from "@/lib/ratelimit";

const SLUG_VALIDO = /^[a-z0-9-]{1,200}$/;

/**
 * Registra uma visualização da matéria.
 * Conta no máximo uma por IP e matéria a cada 30 minutos (com Upstash configurado).
 */
export async function POST(request: Request, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  if (!SLUG_VALIDO.test(slug)) {
    return NextResponse.json({ error: "Slug inválido" }, { status: 400 });
  }

  const { success } = await viewRateLimit.limit(`${getIP(request)}:${slug}`);
  if (!success) {
    // Não é erro para o leitor: a visualização só não é contada de novo.
    return NextResponse.json({ contada: false });
  }

  const artigo = await prisma.artigo.findFirst({
    where: { slug, ...filtroArtigoNoAr() },
    select: { id: true },
  });
  if (!artigo) {
    return NextResponse.json({ error: "Matéria não encontrada" }, { status: 404 });
  }

  await registrarVisualizacao(artigo.id);
  return NextResponse.json({ contada: true });
}
