import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

import { prisma } from "@/lib/prisma";
import { ArticleStatus } from "@/lib/types/article-status";

export const revalidate = 300;

type RevistaPageProps = {
  params: Promise<{ id: string }>;
};

export default async function RevistaPage({ params }: RevistaPageProps) {
  const { id } = await params;

  const revista = await prisma.revista.findUnique({
    where: { id },
    include: {
      artigos: {
        where: { status: ArticleStatus.publicado },
        orderBy: [{ ordemNaRevista: "asc" }, { criadoEm: "asc" }],
        include: {
          autor: { select: { nome: true } },
          categoria: { select: { nome: true } },
        },
      },
    },
  });

  if (!revista) {
    notFound();
  }

  return (
    <div className="portal-page w-full pb-20 transition-colors duration-300">
      <section className="w-full border-b border-gray-200 bg-gray-950 text-white dark:border-gray-800">
        <div className="mx-auto grid max-w-7xl gap-8 px-4 py-10 sm:px-6 lg:grid-cols-[280px_minmax(0,1fr)] lg:px-8">
          <div className="relative aspect-[3/4] w-full max-w-[260px] overflow-hidden rounded-md bg-gray-900 shadow-2xl">
            {revista.capaUrl ? (
              <Image src={revista.capaUrl} alt={revista.titulo} fill sizes="280px" className="object-cover" priority />
            ) : (
              <div className="flex h-full items-center justify-center px-6 text-center text-2xl font-black text-gray-600">
                Revista Gestão
              </div>
            )}
          </div>

          <div className="flex flex-col justify-end">
            <Link href="/" className="mb-8 inline-flex w-fit items-center gap-2 text-sm font-bold text-gray-400 transition hover:text-white">
              <ArrowLeft className="h-4 w-4" />
              Voltar para notícias
            </Link>
            <p className="text-[11px] font-black uppercase tracking-[0.28em] text-red-400">Revista Gestão</p>
            <div className="mt-2 flex flex-wrap items-center gap-3">
              <span className="rounded-full bg-red-700 px-3 py-1 text-xs font-black uppercase tracking-widest text-white">
                Edição {revista.edicao}
              </span>
              <span className="text-sm font-bold text-gray-400">
                {revista.dataPublicacao ? revista.dataPublicacao.toLocaleDateString("pt-BR") : "Sem data"}
              </span>
            </div>
            <h1 className="mt-5 max-w-4xl text-4xl font-black leading-none tracking-tight md:text-6xl">{revista.titulo}</h1>
            {revista.descricao && <p className="mt-5 max-w-3xl text-lg font-medium leading-7 text-gray-300">{revista.descricao}</p>}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="portal-muted-surface mb-8 flex items-center justify-between border-l-[6px] border-red-700 px-5 py-3">
          <h2 className="portal-section-title text-xl font-black uppercase tracking-wide">Artigos da edição</h2>
          <span className="portal-card-meta text-xs font-black uppercase tracking-widest">{revista.artigos.length} artigos</span>
        </div>

        {revista.artigos.length === 0 ? (
          <div className="rounded-lg border border-dashed border-gray-300 bg-gray-50 py-20 text-center dark:border-gray-800 dark:bg-gray-900/40">
            <p className="font-bold text-gray-500">Nenhum artigo publicado nesta edição.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
            {revista.artigos.map((artigo) => (
              <Link
                key={artigo.id}
                href={`/noticia/${artigo.slug}`}
                className="group flex h-full flex-col rounded-xl p-1 transition-colors"
              >
                <div className="relative mb-4 aspect-[4/3] overflow-hidden border border-gray-200 bg-gray-100 transition group-hover:border-red-700 dark:border-gray-800 dark:bg-gray-900">
                  {artigo.urlImagemOg ? (
                    <Image
                      src={artigo.urlImagemOg}
                      alt={artigo.titulo}
                      fill
                      sizes="(max-width: 768px) 100vw, 360px"
                      className="object-cover transition duration-700 group-hover:scale-105"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center text-sm font-black text-gray-400">Revista Gestão</div>
                  )}
                </div>
                {artigo.categoria && (
                  <span className="mb-3 w-fit rounded-sm bg-red-800 px-3 py-1 text-[11px] font-black uppercase tracking-widest text-white">
                    {artigo.categoria.nome}
                  </span>
                )}
                <h3 className="portal-card-title text-2xl font-black leading-tight transition">
                  {artigo.titulo}
                </h3>
                {artigo.resumo && <p className="portal-card-summary mt-3 line-clamp-3 text-base font-normal leading-6">{artigo.resumo}</p>}
                <div className="portal-card-meta mt-auto pt-5 text-[11px] font-black uppercase tracking-widest">
                  Por {artigo.autor?.nome || "Redação"}
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
