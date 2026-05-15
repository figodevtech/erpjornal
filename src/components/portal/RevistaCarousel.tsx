"use client";

import { ArrowRight, ChevronLeft, ChevronRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";

type RevistaArticle = {
  id: string;
  titulo: string;
  resumo: string | null;
  slug: string;
  urlImagemOg: string | null;
  dataPublicacao: string;
  categoria: string | null;
  autor: string | null;
};

export type RevistaCarouselItem = {
  id: string;
  titulo: string;
  descricao: string | null;
  edicao: string;
  dataPublicacao: string | null;
  capaUrl: string | null;
  totalArtigos: number;
  artigos: RevistaArticle[];
};

type RevistaCarouselProps = {
  revista: RevistaCarouselItem;
};

const CARD_WIDTH = 276;

function formatDate(date: string | null) {
  if (!date) return "Sem data";
  return new Date(date).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

export default function RevistaCarousel({ revista }: RevistaCarouselProps) {
  const scrollerRef = useRef<HTMLDivElement | null>(null);
  const [canGoBack, setCanGoBack] = useState(false);
  const [canGoForward, setCanGoForward] = useState(revista.artigos.length > 3);

  function updateButtons() {
    const scroller = scrollerRef.current;
    if (!scroller) return;

    setCanGoBack(scroller.scrollLeft > 4);
    setCanGoForward(scroller.scrollLeft + scroller.clientWidth < scroller.scrollWidth - 4);
  }

  function scrollArticles(direction: "left" | "right") {
    const scroller = scrollerRef.current;
    if (!scroller) return;

    scroller.scrollBy({
      left: direction === "left" ? -CARD_WIDTH : CARD_WIDTH,
      behavior: "smooth",
    });
  }

  useEffect(() => {
    updateButtons();
  }, [revista.artigos.length]);

  return (
    <section className="mb-10 overflow-hidden rounded-xl bg-gray-950 px-5 py-4 text-white shadow-sm sm:px-7 lg:px-8">
      <div className="mb-3 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          <p className="text-[11px] font-black uppercase tracking-[0.28em] text-red-400">Revista Gestao</p>
          <div className="mt-1 flex flex-wrap items-baseline gap-x-3 gap-y-1">
            <h2 className="text-2xl font-black leading-none tracking-tight md:text-3xl">
              Edicao {revista.edicao}
            </h2>
            <span className="text-base font-medium text-gray-300">/ {formatDate(revista.dataPublicacao)}</span>
          </div>
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          <Link
            href="/edicoes-anteriores"
            className="inline-flex items-center gap-2 rounded-full border border-white/10 px-4 py-2 text-xs font-black uppercase tracking-widest text-gray-100 transition hover:border-red-500 hover:text-white"
          >
            Edicoes anteriores
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
          <button
            type="button"
            onClick={() => scrollArticles("left")}
            disabled={!canGoBack}
            className="rounded-full border border-white/10 p-2 text-gray-300 transition hover:border-red-500 hover:text-white disabled:cursor-not-allowed disabled:opacity-35"
            aria-label="Artigos anteriores"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={() => scrollArticles("right")}
            disabled={!canGoForward}
            className="rounded-full border border-white/10 p-2 text-gray-300 transition hover:border-red-500 hover:text-white disabled:cursor-not-allowed disabled:opacity-35"
            aria-label="Proximos artigos"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div className="grid gap-5 lg:grid-cols-[230px_minmax(0,1fr)] xl:grid-cols-[250px_minmax(0,1fr)]">
        <Link
          href={`/revistas/${revista.id}`}
          className="group relative mx-auto block w-full max-w-[250px] overflow-hidden bg-gray-900 shadow-xl"
          aria-label={`Abrir edicao ${revista.edicao}`}
        >
          <div className="relative aspect-[3/4] w-full">
            {revista.capaUrl ? (
              <Image
                src={revista.capaUrl}
                alt={revista.titulo}
                fill
                sizes="(max-width: 1024px) 250px, 250px"
                className="object-cover transition duration-500 group-hover:scale-105"
                priority
              />
            ) : (
              <div className="flex h-full items-center justify-center px-6 text-center text-2xl font-black text-gray-600">
                Revista Gestao
              </div>
            )}
          </div>
        </Link>

        <div
          ref={scrollerRef}
          onScroll={updateButtons}
          className="flex snap-x snap-mandatory gap-4 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        >
          {revista.artigos.map((artigo) => (
            <Link
              key={artigo.id}
              href={`/noticia/${artigo.slug}`}
              className="group flex min-h-[286px] min-w-[218px] max-w-[218px] snap-start flex-col overflow-hidden rounded-md bg-gray-850 ring-1 ring-white/5 transition hover:-translate-y-0.5 hover:ring-red-500/60 sm:min-w-[236px] sm:max-w-[236px] xl:min-w-[248px] xl:max-w-[248px]"
            >
              <div className="relative aspect-[1.9/1] bg-gray-900">
                {artigo.urlImagemOg ? (
                  <Image
                    src={artigo.urlImagemOg}
                    alt={artigo.titulo}
                    fill
                    sizes="(max-width: 640px) 238px, 276px"
                    className="object-cover transition duration-500 group-hover:scale-105"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center text-sm font-black uppercase tracking-widest text-gray-600">
                    Revista
                  </div>
                )}
                <div className="absolute inset-x-0 bottom-0 h-0.5 bg-red-700" />
              </div>

              <div className="flex flex-1 flex-col px-4 pb-3 pt-4">
                <p className="mb-1.5 text-[10px] font-black uppercase tracking-widest text-red-300">
                  {artigo.categoria ?? "Revista"}
                </p>
                <h3 className="line-clamp-3 text-lg font-black leading-tight tracking-tight transition group-hover:text-red-200">
                  {artigo.titulo}
                </h3>
                <p className="mt-auto pt-4 text-[10px] font-black uppercase tracking-widest text-gray-200">
                  {artigo.autor ?? "Redacao"}
                </p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
