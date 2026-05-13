import PortalEmptyState from "@/components/portal/PortalEmptyState";
import PortalSectionHeader from "@/components/portal/PortalSectionHeader";
import { prisma } from "@/lib/prisma";
import { ArticleStatus } from "@/lib/types/article-status";
import { Prisma } from "@prisma/client";
import { Newspaper } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { Metadata } from "next";
import { notFound } from "next/navigation";

export const revalidate = 60;

interface PageProps {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ esfera?: string }>;
}

export async function generateMetadata(props: PageProps): Promise<Metadata> {
  const params = await props.params;
  const { slug } = params;
  const category = await prisma.categoria.findUnique({ where: { slug } });

  if (!category) return { title: "Categoria nao encontrada" };

  return {
    title: `${category.nome} | Noticias - Revista Gestao`,
    description: `Acompanhe as ultimas publicacoes arquivadas na secao ${category.nome} da Revista Gestao.`,
  };
}

export default async function CategoriaPage(props: PageProps) {
  const params = await props.params;
  const { slug } = params;

  const category = await prisma.categoria.findUnique({
    where: { slug },
  });

  if (!category) {
    notFound();
  }

  const publicationCutoff = new Date();
  publicationCutoff.setMinutes(publicationCutoff.getMinutes() + 1);

  const whereClause: Prisma.ArtigoWhereInput = {
    categoriaId: category.id,
    status: ArticleStatus.publicado,
    OR: [
      { dataPublicacao: { lte: publicationCutoff } },
      { dataPublicacao: null },
    ],
  };

  const artigosBrutos = await prisma.artigo.findMany({
    where: whereClause,
    orderBy: { criadoEm: "desc" },
    select: {
      id: true,
      titulo: true,
      slug: true,
      resumo: true,
      urlImagemOg: true,
      dataPublicacao: true,
      criadoEm: true,
      autor: { select: { nome: true } },
    },
  });

  const artigos = artigosBrutos
    .map((art) => ({
      ...art,
      dataExibicao: art.dataPublicacao ?? art.criadoEm,
    }))
    .sort((a, b) => b.dataExibicao.getTime() - a.dataExibicao.getTime());

  return (
    <div className="portal-page min-h-[70vh] w-full transition-colors duration-300">
      <PortalSectionHeader
        eyebrow="Editoria"
        title={category.nome}
        description={`Acompanhe as ultimas informacoes e apuracoes exclusivas sobre ${category.nome}.`}
        accentColor={category.cor || "#C4170C"}
      />

      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        {artigos.length === 0 ? (
          <PortalEmptyState
            icon={Newspaper}
            title={`Nenhum artigo publicado em ${category.nome}.`}
            description={`Estamos preparando novas publicacoes para a editoria de ${category.nome}. Volte em breve para acompanhar as proximas pautas.`}
            className="max-w-3xl py-20"
          />
        ) : (
          <div className="grid grid-cols-1 gap-10 gap-y-12 md:grid-cols-2 lg:grid-cols-3">
            {artigos.map((art) => (
              <Link key={art.id} href={`/noticia/${art.slug}`} className="group flex h-full flex-col items-start">
                <div className="relative mb-4 aspect-[4/3] w-full overflow-hidden border border-gray-200 bg-gray-100 transition-colors duration-300 group-hover:border-red-700 dark:border-gray-800 dark:bg-gray-900">
                  <div className="absolute inset-0 z-10 bg-gradient-to-t from-gray-900/10 to-transparent" />
                  {art.urlImagemOg ? (
                    <Image
                      src={art.urlImagemOg}
                      alt={art.titulo}
                      fill
                      sizes="(max-width: 768px) 100vw, 400px"
                      className="object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center text-gray-300 transition-transform duration-500 group-hover:scale-105 dark:text-gray-700">
                      <svg className="h-12 w-12" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2v12a2 2 0 002 2z" />
                      </svg>
                    </div>
                  )}
                </div>

                <div className="mb-4 flex items-center gap-2">
                  <span className="rounded-sm border border-red-900 bg-red-800 px-3 py-1 text-[11px] font-black uppercase tracking-widest text-white dark:border-red-900/30 dark:bg-red-700/80">
                    {category.nome}
                  </span>
                </div>

                <h2 className="card-headline mb-3 line-clamp-3 text-[22px] font-black leading-[1.2] transition-colors duration-500">
                  {art.titulo}
                </h2>

                {art.resumo && (
                  <p className="portal-summary mb-4 flex-grow line-clamp-3 text-[16px] font-normal leading-snug">
                    {art.resumo}
                  </p>
                )}

                <div className="portal-card-meta mt-auto flex w-full items-center gap-3 pt-2 text-[11px] font-black uppercase tracking-widest">
                  <time>
                    {art.dataExibicao.toLocaleDateString("pt-BR", {
                      day: "2-digit",
                      month: "short",
                      year: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </time>
                  <span className="hidden h-1 w-1 bg-gray-300 sm:block" />
                  <span className="hidden truncate sm:inline-block">{art.autor?.nome || "Redacao"}</span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
