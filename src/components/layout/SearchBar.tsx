"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Search, X, Command } from "lucide-react";
import { SearchResult } from "@/lib/services/search-service";
import SearchSuggestions from "../search/SearchSuggestions";
import RecentSearches from "../search/RecentSearches";
import TrendingSearches from "../search/TrendingSearches";
import { AnimatePresence, motion } from "framer-motion";

export default function SearchBar() {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const abortControllerRef = useRef<AbortController | null>(null);
  const searchCache = useRef<Record<string, SearchResult[]>>({});

  // Fecha ao clicar fora
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Debounce e Busca
  useEffect(() => {
    const performSearch = async () => {
      if (query.trim().length < 3) {
        setResults([]);
        return;
      }

      // 1. Verificar Cache
      if (searchCache.current[query.trim()]) {
        setResults(searchCache.current[query.trim()]);
        return;
      }
 
      // 2. Cancela request anterior
      if (abortControllerRef.current) abortControllerRef.current.abort();
      abortControllerRef.current = new AbortController();
 
      setIsLoading(true);
      try {
        const response = await fetch(`/api/search?q=${encodeURIComponent(query.trim())}&limit=8`, {
          signal: abortControllerRef.current.signal,
        });
        
        if (!response.ok) throw new Error("Search API failed");
        
        const data = await response.json();
        const searchResults = data.results || [];
        
        // 3. Salvar no Cache
        searchCache.current[query.trim()] = searchResults;
        setResults(searchResults);
      } catch (err: any) {
        if (err.name !== "AbortError") console.error("Search fetch error:", err);
      } finally {
        setIsLoading(false);
      }
    };
 
    const timer = setTimeout(performSearch, 300);
    return () => {
      clearTimeout(timer);
      if (abortControllerRef.current) abortControllerRef.current.abort();
    };
  }, [query]);

  const handleSearch = (e?: React.FormEvent, customQuery?: string) => {
    if (e) e.preventDefault();
    const finalQuery = customQuery || query;
    if (finalQuery.trim()) {
      // Salva no histórico local
      const recent = JSON.parse(sessionStorage.getItem("recent_searches") || "[]");
      const updated = [finalQuery.trim(), ...recent.filter((i: string) => i !== finalQuery.trim())].slice(0, 5);
      sessionStorage.setItem("recent_searches", JSON.stringify(updated));

      router.push(`/busca?q=${encodeURIComponent(finalQuery.trim())}`);
      setIsOpen(false);
      setQuery("");
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") setIsOpen(false);
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIndex(prev => (prev < results.length - 1 ? prev + 1 : prev));
    }
    if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIndex(prev => (prev > -1 ? prev - 1 : prev));
    }
    if (e.key === "Enter" && activeIndex >= 0) {
      e.preventDefault();
      const res = results[activeIndex];
      const target = res.type === "noticia" ? `/noticia/${res.slug}` : `/busca?q=${res.title}`;
      router.push(target);
      setIsOpen(false);
    }
  };

  const clearQuery = () => {
    setQuery("");
    inputRef.current?.focus();
  };

  return (
    <div className="relative" ref={containerRef} role="search">
      <button 
        onClick={() => { setIsOpen(!isOpen); setTimeout(() => inputRef.current?.focus(), 100); }}
        className="flex items-center gap-2 text-gray-900 dark:text-gray-100 hover:text-red-700 transition-all p-2 focus-visible:ring-2 focus-visible:ring-red-700 rounded-full outline-none group bg-gray-50 dark:bg-gray-900/50 hover:bg-white dark:hover:bg-gray-800 border border-transparent hover:border-gray-200 dark:hover:border-gray-700 sm:pr-4 sm:pl-3" 
        aria-label="Abrir pesquisa"
        aria-expanded={isOpen}
      >
        <Search className="w-5 h-5 group-hover:scale-110 transition-transform" strokeWidth={2.5} />
        <span className="hidden sm:inline text-[13px] font-bold text-gray-400 group-hover:text-red-700">Buscar...</span>
      </button>

      <AnimatePresence>
        {isOpen && (
          <>
            {/* Overlay Mobile */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-white/95 dark:bg-gray-950/98 z-[100] md:hidden"
            />

            {/* Dropdown Container */}
            <motion.div 
              initial={{ opacity: 0, y: 10, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.98 }}
              className="absolute top-0 right-0 sm:top-full mt-0 sm:mt-4 w-screen h-[100vh] sm:h-auto sm:w-[500px] bg-white dark:bg-gray-950 shadow-2xl sm:border border-gray-200 dark:border-gray-800 sm:rounded-2xl overflow-hidden z-[110] flex flex-col"
            >
              <div className="p-4 bg-gray-50/50 dark:bg-gray-900/30 border-b border-gray-200 dark:border-gray-800 flex items-center gap-3">
                <div className="flex-1 bg-white dark:bg-gray-900 rounded-xl border-2 border-gray-200 dark:border-gray-800 focus-within:border-red-700 transition-all flex items-center px-4 relative shadow-sm">
                  <Search className="w-4 h-4 text-gray-400" strokeWidth={3} />
                  <input 
                    ref={inputRef}
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Buscar notícias, temas ou autores..."
                    className="flex-1 bg-transparent border-none py-3 px-3 text-[14px] font-bold text-gray-900 dark:text-gray-100 placeholder:text-gray-400 focus:ring-0 outline-none"
                    autoFocus
                  />
                  {query && (
                    <button onClick={clearQuery} className="p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors">
                      <X className="w-4 h-4 text-gray-400" />
                    </button>
                  )}
                  <div className="hidden sm:flex items-center gap-1 border border-gray-200 dark:border-gray-700 px-1.5 py-0.5 rounded text-[10px] text-gray-400 font-bold ml-2">
                    <Command className="w-2.5 h-2.5" /> K
                  </div>
                </div>
                <button 
                  onClick={() => setIsOpen(false)}
                  className="sm:hidden text-[12px] font-black uppercase text-gray-500"
                >
                  Fechar
                </button>
              </div>

              <div className="flex-1 overflow-y-auto">
                {query.length < 2 ? (
                  <div className="fade-in">
                    <RecentSearches onSelect={(q) => { setQuery(q); handleSearch(undefined, q); }} />
                    <TrendingSearches onSelect={(q) => { setQuery(q); handleSearch(undefined, q); }} />
                  </div>
                ) : (
                  <SearchSuggestions 
                    results={results} 
                    isLoading={isLoading} 
                    query={query}
                    onSelect={() => setIsOpen(false)}
                  />
                )}
              </div>

              <div className="hidden sm:flex bg-gray-50 dark:bg-gray-900/50 p-2.5 px-4 border-t border-gray-200 dark:border-gray-800 items-center justify-between">
                <div className="flex gap-4">
                  <div className="flex items-center gap-1.5 text-[10px] text-gray-500 font-bold uppercase tracking-widest">
                    <span className="p-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded flex items-center justify-center">↓</span>
                    <span className="p-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded flex items-center justify-center">↑</span>
                    Navegar
                  </div>
                  <div className="flex items-center gap-1.5 text-[10px] text-gray-500 font-bold uppercase tracking-widest">
                    <span className="p-1 px-1.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded">Enter</span>
                    Selecionar
                  </div>
                </div>
                <div className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">
                   RG Search v2.0
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
