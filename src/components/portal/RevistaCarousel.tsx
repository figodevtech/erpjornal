"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRef, useState } from "react";

export type RevistaCarouselItem = {
  id: string;
  titulo: string;
  descricao: string | null;
  edicao: string;
  dataPublicacao: string | null;
  capaUrl: string | null;
  totalArtigos: number;
};

type RevistaCarouselProps = {
  revistas: RevistaCarouselItem[];
};

export default function RevistaCarousel({ revistas }: RevistaCarouselProps) {
  const itemRefs = useRef<Array<HTMLAnchorElement | null>>([]);
  const [activePage, setActivePage] = useState(0);
  const pageSize = 4;
  const totalPages = Math.ceil(revistas.length / pageSize);

  if (revistas.length === 0) return null;

  function scrollToPage(page: number) {
    const nextPage = Math.max(0, Math.min(page, totalPages - 1));
    const targetIndex = nextPage * pageSize;
    setActivePage(nextPage);
    itemRefs.current[targetIndex]?.scrollIntoView({
      behavior: "smooth",
      block: "nearest",
      inline: "start",
    });
  }

  function scroll(direction: "left" | "right") {
    scrollToPage(direction === "left" ? activePage - 1 : activePage + 1);
  }

  return (
    <section className="mb-14 rounded-2xl bg-gray-950 px-4 py-8 text-white shadow-sm sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="mb-6 flex items-end justify-between gap-4">
          <div>
            <p className="text-[11px] font-black uppercase tracking-[0.28em] text-red-400">Revista Gestão</p>
            <h2 className="mt-1 text-2xl font-black tracking-tight md:text-3xl">Edições</h2>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => scroll("left")}
              disabled={activePage === 0}
              className="rounded-full border border-white/10 p-2 text-gray-300 transition hover:border-red-500 hover:text-white disabled:cursor-not-allowed disabled:opacity-40"
              aria-label="Revistas anteriores"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={() => scroll("right")}
              disabled={activePage === totalPages - 1}
              className="rounded-full border border-white/10 p-2 text-gray-300 transition hover:border-red-500 hover:text-white disabled:cursor-not-allowed disabled:opacity-40"
              aria-label="Próximas revistas"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>

        <div className="flex snap-x snap-mandatory gap-5 overflow-x-auto pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {revistas.map((revista, index) => (
            <Link
              key={revista.id}
              ref={(node) => {
                itemRefs.current[index] = node;
              }}
              href={`/revistas/${revista.id}`}
              onFocus={() => setActivePage(Math.floor(index / pageSize))}
              className="group relative min-w-[calc((100%-60px)/4)] max-w-[calc((100%-60px)/4)] snap-start overflow-hidden rounded-md border border-white/10 bg-gray-900 shadow-lg transition hover:-translate-y-0.5 hover:border-red-500/70 max-lg:min-w-[210px] max-lg:max-w-[210px] max-sm:min-w-[170px] max-sm:max-w-[170px]"
            >
              <div className="relative aspect-[3/4] bg-gray-900">
                {revista.capaUrl ? (
                  <Image
                    src={revista.capaUrl}
                    alt={revista.titulo}
                    fill
                    sizes="(max-width: 640px) 170px, (max-width: 1024px) 210px, 230px"
                    className="object-cover transition duration-500 group-hover:scale-105"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center px-4 text-center text-lg font-black text-gray-600">
                    Revista Gestão
                  </div>
                )}
              </div>
              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black via-black/70 to-transparent p-3">
                <p className="text-[10px] font-black uppercase tracking-widest text-red-300">Edição {revista.edicao}</p>
                <p className="mt-1 line-clamp-2 text-sm font-black leading-tight text-white">{revista.titulo}</p>
              </div>
            </Link>
          ))}
        </div>

        {totalPages > 1 && (
          <div className="mt-5 flex justify-center gap-2">
            {Array.from({ length: totalPages }).map((_, page) => (
              <button
                key={page}
                type="button"
                onClick={() => scrollToPage(page)}
                className={`h-2 rounded-full transition-all ${
                  page === activePage ? "w-6 bg-red-500" : "w-2 bg-gray-600 hover:bg-gray-400"
                }`}
                aria-label={`Ir para grupo ${page + 1} de revistas`}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
