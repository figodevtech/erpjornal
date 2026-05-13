/* eslint-disable @next/next/no-img-element */

import { prisma } from "@/lib/prisma";
import { getAdSize, type AdPageType, type AdPosition } from "@/lib/ads";

type AdSlotProps = {
  pagina: AdPageType;
  posicao: AdPosition;
  className?: string;
  limit?: number;
};

const sizeClassName: Record<string, string> = {
  banner_horizontal: "max-w-7xl",
  banner_largo: "max-w-6xl",
  retangulo: "max-w-[336px]",
  quadrado: "max-w-[300px]",
  vertical: "max-w-[300px]",
};

const imageFitClassName: Record<string, string> = {
  banner_horizontal: "object-cover",
  banner_largo: "object-cover",
  retangulo: "object-cover",
  quadrado: "object-cover",
  vertical: "object-cover",
};

function activeAdsWhere(pagina: AdPageType, posicao: AdPosition, now = new Date()) {
  return {
    ativo: true,
    paginas: { has: pagina },
    posicoes: { has: posicao },
    AND: [
      { OR: [{ dataInicio: null }, { dataInicio: { lte: now } }] },
      { OR: [{ dataFim: null }, { dataFim: { gte: now } }] },
    ],
  };
}

export async function hasActiveAds(pagina: AdPageType, posicao: AdPosition) {
  const count = await prisma.anuncio.count({
    where: activeAdsWhere(pagina, posicao),
  });

  return count > 0;
}

export default async function AdSlot({ pagina, posicao, className = "", limit = 3 }: AdSlotProps) {
  const now = new Date();
  const anuncios = await prisma.anuncio.findMany({
    where: activeAdsWhere(pagina, posicao, now),
    orderBy: [{ prioridade: "desc" }, { criadoEm: "desc" }],
    take: Math.max(1, limit),
  });

  if (anuncios.length === 0) return null;

  return (
    <aside className={`w-full space-y-5 ${className}`} aria-label="Publicidade">
      {anuncios.map((anuncio) => {
        const size = getAdSize(anuncio.tamanho);

        return (
          <div key={anuncio.id} className={`mx-auto w-full ${sizeClassName[anuncio.tamanho] ?? "max-w-7xl"}`}>
            <div className="mb-1 text-[10px] font-black uppercase tracking-[0.24em] text-gray-400 dark:text-gray-600">
              Publicidade
            </div>
            <a
              href={anuncio.linkUrl}
              target="_blank"
              rel="noopener noreferrer sponsored"
              className={`relative block w-full overflow-hidden rounded-xl border border-gray-200 bg-gray-100 transition-opacity hover:opacity-90 dark:border-gray-800 dark:bg-gray-900 ${size.ratio}`}
            >
              <img
                src={anuncio.imagemUrl}
                alt={anuncio.altText || anuncio.titulo}
                className={`h-full w-full ${imageFitClassName[anuncio.tamanho] ?? "object-cover"}`}
                loading="lazy"
              />
            </a>
          </div>
        );
      })}
    </aside>
  );
}
