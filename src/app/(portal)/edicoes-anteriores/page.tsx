import { prisma } from "@/lib/prisma";
import { ArticleStatus } from "@/lib/types/article-status";
import type { Metadata } from "next";

import EdicoesAnterioresContent, { type RevistaEdicao } from "./EdicoesAnterioresContent";

export const revalidate = 300;

export const metadata: Metadata = {
  title: "Edições anteriores | Revista Gestão",
  description: "Consulte as edições anteriores da Revista Gestão e leia os artigos publicados em cada edição.",
};

export default async function EdicoesAnterioresPage() {
  const revistasBrutas = await prisma.revista.findMany({
    orderBy: [{ dataPublicacao: "desc" }, { createdAt: "desc" }],
    take: 60,
    include: {
      artigos: {
        where: { status: ArticleStatus.publicado },
        orderBy: [{ ordemNaRevista: "asc" }, { criadoEm: "asc" }],
        include: {
          autor: { select: { nome: true } },
          categoria: { select: { nome: true } },
        },
      },
      _count: {
        select: { artigos: true },
      },
    },
  });

  const revistas: RevistaEdicao[] = revistasBrutas.map((revista) => ({
    id: revista.id,
    titulo: revista.titulo,
    edicao: revista.edicao,
    dataPublicacao: revista.dataPublicacao?.toISOString() ?? null,
    capaUrl: revista.capaUrl,
    totalArtigos: revista._count.artigos,
    artigos: revista.artigos.map((artigo) => ({
      id: artigo.id,
      titulo: artigo.titulo,
      slug: artigo.slug,
      urlImagemOg: artigo.urlImagemOg,
      autorNome: artigo.autor?.nome ?? null,
      categoriaNome: artigo.categoria?.nome ?? null,
    })),
  }));

  return <EdicoesAnterioresContent revistas={revistas} />;
}
