import { NextResponse } from "next/server";

import { filtroArtigoNoAr } from "@/lib/data/artigos";
import { prisma } from "@/lib/prisma";

export async function GET(_request: Request, { params }: { params: Promise<{ slug: string }> }) {
  try {
    const { slug } = await params;

    if (!slug) {
      return NextResponse.json({ error: "Slug da matéria não fornecido" }, { status: 400 });
    }

    // Só matérias publicadas e já no ar.
    const artigo = await prisma.artigo.findFirst({
      where: { slug, ...filtroArtigoNoAr() },
      select: {
        id: true,
        titulo: true,
        resumo: true,
        corpoTexto: true,
        ehPremium: true,
        slug: true,
        dataPublicacao: true,
        visualizacoes: true,
        urlImagemOg: true,
        categoria: {
          select: {
            nome: true,
            slug: true,
            cor: true,
          },
        },
        autor: {
          select: {
            nome: true,
          },
        },
      },
    });

    if (!artigo) {
      return NextResponse.json({ error: "Matéria não encontrada ou indisponível" }, { status: 404 });
    }

    // Paywall: a API pública não entrega o corpo de matérias premium
    // (antes devolvia o texto completo, contornando o bloqueio da página).
    const { corpoTexto, ehPremium, ...resto } = artigo;
    return NextResponse.json(
      ehPremium ? { ...resto, premium: true, corpoTexto: null } : { ...resto, premium: false, corpoTexto }
    );
  } catch (error) {
    console.error("GET /api/articles/[slug] error:", error);
    return NextResponse.json({ error: "Erro interno no servidor ao consumir a matéria" }, { status: 500 });
  }
}
