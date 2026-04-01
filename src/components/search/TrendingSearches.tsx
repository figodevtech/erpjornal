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
      .then((data) => setTrending(data.articles || []))
      .catch(() => setTrending([]))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="py-5 px-4 border-t border-gray-100 dark:border-gray-800">
        <div className="flex items-center gap-2 mb-3">
          <TrendingUp className="w-3 h-3 text-gray-400" />
          <span className="text-[11px] font-black uppercase tracking-widest text-gray-400">Em Alta Agora</span>
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
        <h3 className="text-[11px] font-black uppercase tracking-widest text-gray-500 dark:text-gray-400 flex items-center gap-2">
          <TrendingUp className="w-3 h-3 text-red-700" />
          Em Alta Agora
        </h3>
      </div>
      <div className="flex flex-col gap-0.5 px-2">
        {trending.map((article) => (
          <Link
            key={article.slug}
            href={`/noticia/${article.slug}`}
            onClick={() => onSelect(article.titulo)}
            className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors group"
          >
            <TrendingUp className="w-3.5 h-3.5 text-red-700 flex-shrink-0" />
            <span className="text-[13px] font-bold text-gray-700 dark:text-gray-300 group-hover:text-red-700 transition-colors line-clamp-1 flex-1">
              {article.titulo}
            </span>
            <span className="flex items-center gap-1 text-[10px] text-gray-400 font-bold flex-shrink-0">
              <Eye className="w-3 h-3" />
              {article.visualizacoes.toLocaleString("pt-BR")}
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
}
