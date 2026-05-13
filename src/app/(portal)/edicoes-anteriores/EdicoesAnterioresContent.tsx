"use client";

import PortalEmptyState from "@/components/portal/PortalEmptyState";
import PortalSectionHeader from "@/components/portal/PortalSectionHeader";
import { BookOpen } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

type ArtigoEdicao = {
  id: string;
  titulo: string;
  slug: string;
  urlImagemOg: string | null;
  autorNome: string | null;
  categoriaNome: string | null;
};

export type RevistaEdicao = {
  id: string;
  titulo: string;
  edicao: string;
  dataPublicacao: string | null;
  capaUrl: string | null;
  totalArtigos: number;
  artigos: ArtigoEdicao[];
};

type EdicoesAnterioresContentProps = {
  revistas: RevistaEdicao[];
};

function formatDate(value: string | null) {
  return value ? new Date(value).toLocaleDateString("pt-BR") : "Sem data de publicação";
}

export default function EdicoesAnterioresContent({ revistas }: EdicoesAnterioresContentProps) {
  return (
    <div className="portal-page min-h-[70vh] w-full pb-20">
      <PortalSectionHeader
        eyebrow="Revista Gestão"
        title="Edições anteriores"
        description="Acesse as edições publicadas e os artigos vinculados a cada revista."
      />

      <section className="mx-auto w-full max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        {revistas.length === 0 ? (
          <PortalEmptyState
            icon={BookOpen}
            title="Nenhuma edição encontrada."
            description="Volte em breve para consultar as últimas edições publicadas."
            className="py-20"
          />
        ) : (
          <div className="space-y-14">
            {revistas.map((revista) => (
              <article key={revista.id} className="border-b border-gray-200 pb-12 last:border-b-0 dark:border-gray-800">
                <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-end">
                  <Link
                    href={`/revistas/${revista.id}`}
                    className="w-fit rounded-full border border-red-700 bg-red-700 px-4 py-2 text-xs font-black uppercase tracking-widest text-white transition hover:border-red-800 hover:bg-red-800 dark:border-red-500 dark:bg-red-600 dark:hover:border-red-400 dark:hover:bg-red-500"
                  >
                    Ver edição
                  </Link>
                </div>

                <div className="grid gap-12 xl:grid-cols-[300px_minmax(0,1fr)] 2xl:gap-16">
                  <Link href={`/revistas/${revista.id}`} className="group block w-full max-w-[300px]">
                    <div className="relative aspect-[3/4] overflow-hidden rounded-lg border border-gray-200 bg-gray-100 shadow-sm transition group-hover:border-red-700 dark:border-gray-800 dark:bg-gray-900">
                      {revista.capaUrl ? (
                        <Image
                          src={revista.capaUrl}
                          alt={revista.titulo}
                          fill
                          sizes="300px"
                          className="object-cover transition duration-700 group-hover:scale-105"
                        />
                      ) : (
                        <div className="flex h-full items-center justify-center px-4 text-center text-lg font-black text-gray-500">
                          Revista Gestão
                        </div>
                      )}
                    </div>
                    <div className="mt-3">
                      <h2 className="portal-section-title text-2xl font-black tracking-tight">Edição {revista.edicao}</h2>
                      <p className="portal-card-meta mt-1 text-sm font-bold">{formatDate(revista.dataPublicacao)}</p>
                      <p className="portal-card-meta mt-2 text-xs font-black uppercase tracking-widest">
                        {revista.totalArtigos} artigos
                      </p>
                    </div>
                  </Link>

                  <div className="grid content-start gap-5 sm:grid-cols-[repeat(auto-fill,minmax(190px,215px))]">
                    {revista.artigos.map((artigo) => (
                      <Link
                        key={artigo.id}
                        href={`/noticia/${artigo.slug}`}
                        className="group flex min-h-[300px] flex-col overflow-hidden rounded-lg border border-gray-200 bg-white transition hover:border-red-700"
                      >
                        <div className="relative aspect-[4/3] w-full shrink-0 bg-gray-100">
                          {artigo.urlImagemOg ? (
                            <Image
                              src={artigo.urlImagemOg}
                              alt={artigo.titulo}
                              fill
                              sizes="215px"
                              className="object-cover transition duration-700 group-hover:scale-105"
                            />
                          ) : (
                            <div className="flex h-full items-center justify-center px-3 text-center text-[10px] font-black uppercase tracking-widest text-gray-400">
                              Revista Gestão
                            </div>
                          )}
                        </div>

                        <div className="flex min-w-0 flex-col justify-between bg-white p-3">
                          <div>
                            {artigo.categoriaNome && (
                              <span className="mb-2 block text-[9px] font-black uppercase tracking-widest text-red-700">
                                {artigo.categoriaNome}
                              </span>
                            )}
                            <h3 className="line-clamp-4 text-base font-black leading-tight text-black transition-colors group-hover:text-red-700">
                              {artigo.titulo}
                            </h3>
                          </div>
                          <p className="mt-3 text-[9px] font-black uppercase tracking-widest text-gray-700">
                            {artigo.autorNome || "Redação"}
                          </p>
                        </div>
                      </Link>
                    ))}

                    {revista.artigos.length === 0 && (
                      <div className="portal-muted-surface border border-dashed px-6 py-10 text-sm font-bold">
                        Nenhum artigo publicado nesta edição.
                      </div>
                    )}
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
