import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { ArticleStatus } from "@/lib/types/article-status";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ slug: string }> } // Em Next.js 15, os parâmetros da rota dinâmica são consumidos por Promise
) {
  try {
    const resolvedParams = await params;
    const slug = resolvedParams.slug;

    if (!slug) {
      return NextResponse.json({ error: "Slug da matéria não fornecido" }, { status: 400 });
    }

    // Busca detalhada apenas de matéria pública
    const artigo = await prisma.artigo.findFirst({
      where: {
        slug,
        status: ArticleStatus.publicado,
        dataPublicacao: {
          lte: new Date(),
        },
      },
      select: {
        id: true,
        titulo: true,
        resumo: true,
        corpoTexto: true,
        slug: true,
        dataPublicacao: true,
        visualizacoes: true,
        urlImagemOg: true,
        categoria: {
          select: {
            nome: true,
            slug: true,
            cor: true,
          }
        },
        autor: {
          select: {
            nome: true,
          }
        }
      }
    });

    if (!artigo) {
      return NextResponse.json({ error: "Matéria não encontrada ou indisponível" }, { status: 404 });
    }

    // Incrementa contagem de views de forma Background fire-and-forget (não-bloqueante na requisição principal)
    prisma.artigo.update({
      where: { id: artigo.id },
      data: { visualizacoes: { increment: 1 } }
    }).catch(err => console.error("Falha silenciosa ao incrementar view da matéria:", err));

    return NextResponse.json(artigo);

  } catch (error) {
    console.error("GET /api/artigos/[slug] error:", error);
    return NextResponse.json({ error: "Erro interno no servidor ao consumir a matéria" }, { status: 500 });
  }
}
