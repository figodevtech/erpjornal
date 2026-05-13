"use client";

import { TrendingUp, Eye } from "lucide-react";
import { useEffect, useState } from "react";
import Link from "next/link";

interface TrendingArticle {
  slug: string;
  titulo: string;
  visualizacoes: number;
  categoria?: string;
}

interface TrendingSearchesProps {
  onSelect: (query: string) => void;
}

export default function TrendingSearches({ onSelect }: TrendingSearchesProps) {
  const [trending, setTrending] = useState<TrendingArticle[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/articles/trending")
      .then((r) => r.json())
      .then((data) => setTrending(data.artigos || []))
      .catch(() => setTrending([]))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="py-5 px-4 border-t border-gray-100 dark:border-gray-800">
        <div className="flex items-center gap-2 mb-3">
          <TrendingUp className="h-3 w-3 text-red-700 dark:text-red-300" />
          <span className="text-[11px] font-black uppercase tracking-widest text-gray-900 dark:text-gray-100">Em Alta Agora</span>
        </div>
        <div className="flex flex-wrap gap-2">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-7 w-28 bg-gray-100 dark:bg-gray-800 rounded-full animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  if (trending.length === 0) return null;

  return (
    <div className="py-4 border-t border-gray-100 dark:border-gray-800">
      <div className="flex items-center justify-between mb-3 px-4">
        <h3 className="flex items-center gap-2 text-[11px] font-black uppercase tracking-widest text-gray-900 dark:text-gray-100">
          <TrendingUp className="w-3 h-3 text-red-700 dark:text-red-300" />
          Em Alta Agora
        </h3>
      </div>
      <div className="flex flex-col gap-0.5 px-2">
        {trending.map((artigo) => (
          <Link
            key={artigo.slug}
            href={`/noticia/${artigo.slug}`}
            onClick={() => onSelect(artigo.titulo)}
            className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors group"
          >
            <TrendingUp className="w-3.5 h-3.5 text-red-700 flex-shrink-0" />
            <span className="line-clamp-1 flex-1 text-[13px] font-bold text-gray-900 transition-colors group-hover:text-red-700 dark:text-gray-100 dark:group-hover:text-red-300">
              {artigo.titulo}
            </span>
            <span className="flex flex-shrink-0 items-center gap-1 text-[10px] font-bold text-gray-700 dark:text-gray-300">
              <Eye className="w-3 h-3" />
              {artigo.visualizacoes.toLocaleString("pt-BR")}
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
}
