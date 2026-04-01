"use client";

import { SearchResult } from "@/lib/services/search-service";
import Link from "next/link";
import { User, FileText, Briefcase, Video, Mic, Tag } from "lucide-react";

interface SearchSuggestionsProps {
  results: SearchResult[];
  isLoading: boolean;
  onSelect: () => void;
  query: string;
}

export default function SearchSuggestions({ results, isLoading, onSelect, query }: SearchSuggestionsProps) {
  if (isLoading) {
    return (
      <div className="p-10 flex flex-col items-center justify-center space-y-4 animate-pulse">
        <div className="w-8 h-8 rounded-full border-2 border-red-700 border-t-transparent animate-spin" />
        <p className="text-xs font-bold text-gray-500 uppercase tracking-widest">Buscando pautas...</p>
      </div>
    );
  }

  const safeResults = results || [];

  if (safeResults.length === 0 && query.length >= 2) {
    return (
      <div className="p-10 text-center">
        <p className="text-sm font-bold text-gray-900 dark:text-gray-100 mb-2">Nenhum resultado para "{query}"</p>
        <p className="text-xs text-gray-500 dark:text-gray-400">Tente termos mais genéricos ou verifique a ortografia.</p>
      </div>
    );
  }

  // Agrupamento por tipo
  const grouped = safeResults.reduce((acc, res) => {
    if (!acc[res.type]) acc[res.type] = [];
    acc[res.type].push(res);
    return acc;
  }, {} as Record<string, SearchResult[]>);

  const typeLabels: Record<string, { label: string; icon: any }> = {
    noticia: { label: "Notícias", icon: FileText },
    autor: { label: "Articulistas & Autores", icon: User },
    categoria: { label: "Editorias", icon: Tag },
    politico: { label: "Políticos", icon: Briefcase },
    podcast: { label: "Podcasts", icon: Mic },
    video: { label: "Vídeos", icon: Video },
  };

  const highlight = (text: string) => {
    if (!query) return text;
    const parts = text.split(new RegExp(`(${query})`, "gi"));
    return (
      <>
        {parts.map((part, i) => (
          part.toLowerCase() === query.toLowerCase() ? (
            <mark key={i} className="bg-red-100 dark:bg-red-900/40 text-red-900 dark:text-red-100 rounded-px px-0.5 font-black">
              {part}
            </mark>
          ) : part
        ))}
      </>
    );
  };

  return (
    <div className="max-h-[70vh] overflow-y-auto overflow-x-hidden divide-y divide-gray-100 dark:divide-gray-800">
      {Object.entries(grouped).map(([type, typeResults]) => {
        const { label, icon: Icon } = typeLabels[type] || { label: type, icon: FileText };
        return (
          <section key={type} className="py-2">
            <header className="px-4 py-2 flex items-center justify-between sticky top-0 bg-white dark:bg-gray-950 z-10">
              <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-red-700 flex items-center gap-2">
                <Icon className="w-3 h-3" />
                {label}
              </h4>
              <span className="text-[10px] font-bold text-gray-400">{typeResults.length}</span>
            </header>
            <div className="px-2">
              {typeResults.map((res) => (
                <Link
                  key={res.id}
                  href={res.type === "noticia" ? `/noticia/${res.slug}` : res.type === "categoria" ? `/categoria/${res.slug}` : `/busca?q=${res.title}`}
                  onClick={onSelect}
                  className="group flex items-start gap-4 p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors focus:ring-2 focus:ring-inset focus:ring-red-600 outline-none"
                >
                  {res.image ? (
                    <div className="w-12 h-12 flex-shrink-0 bg-gray-100 dark:bg-gray-800 rounded overflow-hidden">
                      <img src={res.image} alt="" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                    </div>
                  ) : (
                    <div className="w-12 h-12 flex-shrink-0 bg-gray-100 dark:bg-gray-800 rounded flex items-center justify-center text-gray-400">
                      <Icon className="w-5 h-5" />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <h5 className="text-[14px] font-black text-gray-900 dark:text-gray-100 truncate leading-tight group-hover:text-red-700 transition-colors">
                      {highlight(res.title)}
                    </h5>
                    {res.subtitle && (
                      <p className="text-[12px] text-gray-500 dark:text-gray-400 line-clamp-1 mt-0.5 font-medium leading-snug">
                        {res.subtitle}
                      </p>
                    )}
                    <div className="flex items-center gap-2 mt-1">
                       {res.metadata?.categoria && (
                         <span className="text-[9px] font-bold uppercase tracking-wider text-red-700 dark:text-red-500">{res.metadata.categoria}</span>
                       )}
                       {res.date && (
                         <span className="text-[9px] font-bold text-gray-400 uppercase">{new Date(res.date).toLocaleDateString("pt-BR")}</span>
                       )}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        );
      })}
      
      {/* Footer: Ver todos os resultados */}
      {query.length >= 2 && (
        <div className="p-3">
          <Link
            href={`/busca?q=${encodeURIComponent(query)}`}
            onClick={onSelect}
            className="flex items-center justify-center w-full py-2.5 bg-red-700 hover:bg-red-800 text-white text-[12px] font-black uppercase tracking-widest rounded-lg shadow-lg hover:shadow-red-700/20 transition-all active:scale-95 outline-none focus:ring-2 focus:ring-red-600 focus:ring-offset-2 dark:focus:ring-offset-gray-950"
          >
            Ver todos os resultados
          </Link>
        </div>
      )}
    </div>
  );
}
