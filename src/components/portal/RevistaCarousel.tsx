"use client";

import { ArrowRight, ChevronLeft, ChevronRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";

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

const CARD_WIDTH = 216;

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
  const [activePage, setActivePage] = useState(0);
  const [pageCount, setPageCount] = useState(1);

  const getScrollStep = useCallback((scroller: HTMLDivElement) => {
    const firstCard = scroller.firstElementChild as HTMLElement | null;
    const gap = Number.parseFloat(window.getComputedStyle(scroller).columnGap || "0");
    return firstCard ? firstCard.getBoundingClientRect().width + gap : CARD_WIDTH;
  }, []);

  const updateButtons = useCallback(() => {
    const scroller = scrollerRef.current;
    if (!scroller) return;

    setCanGoBack(scroller.scrollLeft > 4);
    setCanGoForward(scroller.scrollLeft + scroller.clientWidth < scroller.scrollWidth - 4);
    const scrollStep = getScrollStep(scroller);
    const scrollableWidth = Math.max(scroller.scrollWidth - scroller.clientWidth, 0);
    const pages = Math.max(1, Math.ceil(scrollableWidth / scrollStep) + 1);
    setPageCount(pages);
    setActivePage(Math.min(pages - 1, Math.round(scroller.scrollLeft / scrollStep)));
  }, [getScrollStep]);

  useEffect(() => {
    updateButtons();
  }, [revista.artigos.length, updateButtons]);

  const scrollToPage = useCallback((page: number) => {
    const scroller = scrollerRef.current;
    if (!scroller) return;

    const targetPage = Math.min(Math.max(page, 0), pageCount - 1);
    const scrollStep = getScrollStep(scroller);
    const scrollableWidth = Math.max(scroller.scrollWidth - scroller.clientWidth, 0);
    setActivePage(targetPage);
    scroller.scrollTo({
      left: Math.min(scrollStep * targetPage, scrollableWidth),
      behavior: "smooth",
    });
  }, [getScrollStep, pageCount]);

  function scrollArticles(direction: "left" | "right") {
    const nextPage = direction === "left" ? activePage - 1 : activePage + 1;
    scrollToPage(nextPage);
  }

  return (
    <section className="relative left-1/2 right-1/2 mb-10 w-[calc(100vw-40px)] -translate-x-1/2 overflow-hidden rounded-xl bg-gray-950 px-5 py-4 text-white shadow-sm">
      <div className="mx-auto w-full max-w-360">
      <div className="mb-3 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          <p className="text-[11px] font-black uppercase tracking-[0.28em] text-red-400">Revista Gestão</p>
          <div className="mt-1 flex flex-wrap items-baseline gap-x-3 gap-y-1">
            <h2 className="text-2xl font-black leading-none tracking-tight md:text-2xl">
              Edição {revista.edicao}
            </h2>
            <span className="text-base font-medium text-gray-300">({formatDate(revista.dataPublicacao)})</span>
          </div>
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          <Link
            href="/edicoes-anteriores"
            className="inline-flex items-center gap-2 rounded-full border border-white/10 px-4 py-2 text-xs font-black uppercase tracking-widest text-gray-100 transition hover:border-red-500 hover:text-white"
          >
            Edições anteriores
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
            aria-label="Próximos artigos"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div className="grid gap-5 lg:grid-cols-[205px_minmax(0,1fr)] xl:grid-cols-[220px_minmax(0,1fr)]">
        <Link
          href={`/revistas/${revista.id}`}
          className="group relative mx-auto block w-full max-w-55 overflow-hidden bg-gray-900 shadow-xl"
          aria-label={`Abrir edição ${revista.edicao}`}
        >
          <div className="relative aspect-3/4 w-full">
            {revista.capaUrl ? (
              <Image
                src={revista.capaUrl}
                alt={revista.titulo}
                fill
                sizes="(max-width: 1024px) 220px, 220px"
                className="object-cover transition duration-500 group-hover:scale-105"
                priority
              />
            ) : (
              <div className="flex h-full items-center justify-center px-6 text-center text-2xl font-black text-gray-600">
                Revista Gestão
              </div>
            )}
          </div>
        </Link>

        <div
          ref={scrollerRef}
          onScroll={updateButtons}
          className="flex snap-x snap-mandatory pt-2 gap-4 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        >
          {revista.artigos.map((artigo) => (
            <Link
              key={artigo.id}
              href={`/noticia/${artigo.slug}`}
              className="group flex min-h-55 min-w-48 max-w-48 snap-start flex-col overflow-hidden rounded-md border border-white/10 bg-slate-800 shadow-lg shadow-black/20 transition hover:-translate-y-0.5 hover:border-red-500/70 hover:bg-slate-750 sm:min-w-52 sm:max-w-52 xl:min-w-54 xl:max-w-54"
            >
              <div className="relative aspect-[2.1/1] bg-gray-900">
                {artigo.urlImagemOg ? (
                  <Image
                    src={artigo.urlImagemOg}
                    alt={artigo.titulo}
                    fill
                    sizes="(max-width: 640px) 238px, 276px"
                    className="object-cover transition duration-500"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center text-sm font-black uppercase tracking-widest text-gray-600">
                    Revista
                  </div>
                )}
                <div className="absolute inset-x-0 bottom-0 h-0.5 bg-red-700" />
              </div>

              <div className="flex flex-1 flex-col px-3 pb-2.5 pt-2.5">
                <p className="mb-1 text-[9px] font-black uppercase tracking-widest text-red-300">
                  {artigo.categoria ?? "Revista"}
                </p>
                <h3 className="line-clamp-3 text-sm font-black leading-tight tracking-tight transition group-hover:text-red-200">
                  {artigo.titulo}
                </h3>
                <p className="mt-auto pt-2 text-[9px] font-black uppercase tracking-widest text-gray-200">
                  {artigo.autor ?? "Redação"}
                </p>
              </div>
            </Link>
          ))}
        </div>

      </div>

      {pageCount > 1 && (
        <div className="mt-3 flex justify-center gap-2">
          {Array.from({ length: pageCount }).map((_, index) => (
            <button
              key={index}
              type="button"
              onClick={() => scrollToPage(index)}
              className={`h-2 rounded-full transition-all ${
                activePage === index ? "w-6 bg-red-500" : "w-2 bg-white/30 hover:bg-white/50"
              }`}
              aria-label={`Ir para pagina ${index + 1} do carrossel`}
            />
          ))}
        </div>
      )}
      </div>
    </section>
  );
}

