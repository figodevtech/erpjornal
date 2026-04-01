"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Filter, Calendar, User, Tag, ArrowUpDown, X } from "lucide-react";
import { useState, useEffect } from "react";

interface FilterOption {
  id: string;
  nome: string;
  slug?: string;
  count?: number;
}

interface SearchFiltersProps {
  categories: FilterOption[];
  authors: FilterOption[];
}

export default function SearchFilters({ categories, authors }: SearchFiltersProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isOpen, setIsOpen] = useState(false);

  // Estados locais sincronizados com a URL
  const currentQuery = searchParams.get("q") || "";
  const currentCategory = searchParams.get("category") || "";
  const currentAuthor = searchParams.get("author") || "";
  const currentSort = searchParams.get("sortBy") || "relevance";
  const currentDate = searchParams.get("dateRange") || "all";

  const updateFilters = (newFilters: Record<string, string>) => {
    const params = new URLSearchParams(searchParams.toString());
    Object.entries(newFilters).forEach(([key, value]) => {
      if (value) params.set(key, value);
      else params.delete(key);
    });
    router.push(`/busca?${params.toString()}`);
  };

  const clearFilters = () => {
    router.push(`/busca?q=${encodeURIComponent(currentQuery)}`);
  };

  const hasActiveFilters = currentCategory || currentAuthor || currentSort !== "relevance" || currentDate !== "all";

  return (
    <aside className="w-full lg:w-72 flex-shrink-0">
      {/* Mobile Toggle */}
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="lg:hidden flex items-center justify-center gap-2 w-full py-3 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl mb-6 font-black uppercase text-xs tracking-widest text-gray-900 dark:text-gray-100 shadow-sm"
      >
        <Filter className="w-4 h-4 text-red-700" />
        Filtros e Ordenação
      </button>

      <div className={`space-y-8 ${isOpen ? 'block' : 'hidden lg:block'} animate-in fade-in slide-in-from-top-2 lg:animate-none`}>
        
        {/* Ordenação */}
        <section>
          <h3 className="text-[11px] font-black uppercase tracking-[0.2em] text-red-700 mb-4 flex items-center gap-2">
            <ArrowUpDown className="w-3.5 h-3.5" />
            Ordenar por
          </h3>
          <div className="flex flex-col gap-2">
            {[
              { id: "relevance", nome: "Mais Relevantes" },
              { id: "newest", nome: "Mais Recentes" }
            ].map((opt) => (
              <button
                key={opt.id}
                onClick={() => updateFilters({ sortBy: opt.id })}
                className={`text-left px-4 py-2.5 rounded-lg text-sm font-bold transition-all border ${
                  currentSort === opt.id 
                    ? "bg-red-700 text-white border-red-700 shadow-lg shadow-red-700/20" 
                    : "bg-gray-50 dark:bg-gray-900 text-gray-700 dark:text-gray-300 border-transparent hover:border-gray-200 dark:hover:border-gray-800"
                }`}
              >
                {opt.nome}
              </button>
            ))}
          </div>
        </section>

        {/* Período */}
        <section>
          <h3 className="text-[11px] font-black uppercase tracking-[0.2em] text-red-700 mb-4 flex items-center gap-2">
            <Calendar className="w-3.5 h-3.5" />
            Período
          </h3>
          <div className="grid grid-cols-1 gap-2">
            {[
              { id: "all", nome: "Qualquer data" },
              { id: "today", nome: "Hoje" },
              { id: "week", nome: "Última semana" },
              { id: "month", nome: "Último mês" }
            ].map((opt) => (
              <button
                key={opt.id}
                onClick={() => updateFilters({ dateRange: opt.id })}
                className={`text-left px-4 py-2.5 rounded-lg text-sm font-bold transition-all border ${
                  currentDate === opt.id 
                    ? "bg-gray-900 dark:bg-white text-white dark:text-gray-900 border-gray-900 dark:border-white shadow-md" 
                    : "bg-gray-50 dark:bg-gray-900 text-gray-700 dark:text-gray-300 border-transparent hover:border-gray-200 dark:hover:border-gray-800"
                }`}
              >
                {opt.nome}
              </button>
            ))}
          </div>
        </section>

        {/* Editorias */}
        <section>
          <h3 className="text-[11px] font-black uppercase tracking-[0.2em] text-red-700 mb-4 flex items-center gap-2">
            <Tag className="w-3.5 h-3.5" />
            Editorias
          </h3>
          <div className="flex flex-col gap-1 max-h-60 overflow-y-auto pr-2 custom-scrollbar">
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => updateFilters({ category: currentCategory === (cat.slug || "") ? "" : (cat.slug || "") })}
                className={`flex items-center justify-between px-3 py-2 rounded-lg text-[13px] font-bold transition-all ${
                  currentCategory === (cat.slug || "") 
                    ? "text-red-700 bg-red-50 dark:bg-red-900/10" 
                    : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800"
                }`}
              >
                <span>{cat.nome}</span>
                {currentCategory === cat.slug && <X className="w-3 h-3" />}
              </button>
            ))}
          </div>
        </section>

        {/* Autores */}
        <section>
          <h3 className="text-[11px] font-black uppercase tracking-[0.2em] text-red-700 mb-4 flex items-center gap-2">
            <User className="w-3.5 h-3.5" />
            Autores
          </h3>
          <div className="flex flex-col gap-1 max-h-60 overflow-y-auto pr-2 custom-scrollbar">
            {authors.map((auth) => (
              <button
                key={auth.id}
                onClick={() => updateFilters({ author: currentAuthor === auth.id ? "" : auth.id })}
                className={`flex items-center justify-between px-3 py-2 rounded-lg text-[13px] font-bold transition-all ${
                  currentAuthor === auth.id 
                    ? "text-red-700 bg-red-50 dark:bg-red-900/10" 
                    : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800"
                }`}
              >
                <span>{auth.nome}</span>
                {currentAuthor === auth.id && <X className="w-3 h-3" />}
              </button>
            ))}
          </div>
        </section>

        {/* Limpar Filtros */}
        {hasActiveFilters && (
          <button 
            onClick={clearFilters}
            className="w-full py-4 text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 hover:text-red-700 transition-colors border-t border-gray-100 dark:border-gray-800 mt-4"
          >
            Limpar todos os filtros
          </button>
        )}
      </div>
    </aside>
  );
}
