"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Search, X } from "lucide-react";
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

  // Fechar ao clicar fora
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Atalho global: Ctrl+K ou Cmd+K
  useEffect(() => {
    const handleGlobalKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setIsOpen((prev) => {
          const next = !prev;
          if (next) setTimeout(() => inputRef.current?.focus(), 100);
          return next;
        });
      }
      if (e.key === "Escape") setIsOpen(false);
    };
    document.addEventListener("keydown", handleGlobalKey);
    return () => document.removeEventListener("keydown", handleGlobalKey);
  }, []);

  // Debounce e busca
  useEffect(() => {
    setActiveIndex(-1);

    const performSearch = async () => {
      if (query.trim().length < 2) {
        setResults([]);
        return;
      }

      if (searchCache.current[query.trim()]) {
        setResults(searchCache.current[query.trim()]);
        return;
      }

      if (abortControllerRef.current) abortControllerRef.current.abort();
      abortControllerRef.current = new AbortController();

      setIsLoading(true);
      try {
        const response = await fetch(
          `/api/search?q=${encodeURIComponent(query.trim())}&limit=8`,
          { signal: abortControllerRef.current.signal }
        );
        if (!response.ok) throw new Error("Search failed");
        const data = await response.json();
        const searchResults: SearchResult[] = data.results || [];
        searchCache.current[query.trim()] = searchResults;
        setResults(searchResults);
      } catch (err: unknown) {
        if (err instanceof DOMException && err.name === "AbortError") return;
        console.error("Search error:", err);
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

  const open = useCallback(() => {
    setIsOpen(true);
    setTimeout(() => inputRef.current?.focus(), 100);
  }, []);

  const close = useCallback(() => {
    setIsOpen(false);
    setQuery("");
    setResults([]);
    setActiveIndex(-1);
  }, []);

  const handleSearch = (e?: React.FormEvent, customQuery?: string) => {
    if (e) e.preventDefault();
    const finalQuery = customQuery || query;
    if (!finalQuery.trim()) return;

    const recent = JSON.parse(sessionStorage.getItem("recent_searches") || "[]");
    const updated = [finalQuery.trim(), ...recent.filter((i: string) => i !== finalQuery.trim())].slice(0, 5);
    sessionStorage.setItem("recent_searches", JSON.stringify(updated));

    router.push(`/busca?q=${encodeURIComponent(finalQuery.trim())}`);
    close();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") {
      close();
      return;
    }

    const navigableResults = results;

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIndex((prev) => Math.min(prev + 1, navigableResults.length - 1));
    }
    if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIndex((prev) => Math.max(prev - 1, -1));
    }
    if (e.key === "Enter") {
      e.preventDefault();
      if (activeIndex >= 0 && navigableResults[activeIndex]) {
        const res = navigableResults[activeIndex];
        const target =
          res.type === "noticia"
            ? `/noticia/${res.slug}`
            : res.type === "categoria"
            ? `/categoria/${res.slug}`
            : `/busca?q=${encodeURIComponent(res.title)}`;
        router.push(target);
        close();
      } else {
        handleSearch();
      }
    }
  };

  const clearQuery = () => {
    setQuery("");
    setResults([]);
    setActiveIndex(-1);
    inputRef.current?.focus();
  };

  return (
    <div className="relative" ref={containerRef} role="search">
      <button
        onClick={open}
        className="group flex items-center gap-2 rounded-full border border-gray-200 bg-gray-100 px-3 py-2 text-gray-800 shadow-sm outline-none transition-all hover:border-red-700/30 hover:bg-white hover:text-red-800 focus-visible:ring-2 focus-visible:ring-red-700 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100 dark:hover:border-red-400/40 dark:hover:bg-gray-800 dark:hover:text-red-100 sm:px-4"
        aria-label="Abrir pesquisa"
        aria-expanded={isOpen}
      >
        <Search className="w-5 h-5 group-hover:scale-110 transition-transform" strokeWidth={2.5} />
        <span className="hidden sm:inline text-[13px] font-black">
          Buscar...
        </span>
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
              onClick={close}
            />

            {/* Dropdown */}
            <motion.div
              initial={{ opacity: 0, y: 10, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.98 }}
              transition={{ duration: 0.15 }}
              className="fixed inset-0 z-[110] flex h-dvh w-screen flex-col overflow-hidden bg-white shadow-2xl dark:bg-gray-950 sm:absolute sm:inset-auto sm:right-0 sm:top-full sm:mt-4 sm:h-auto sm:w-[520px] sm:rounded-2xl sm:border sm:border-gray-200 dark:sm:border-gray-800"
            >
              {/* Input */}
              <div className="p-4 bg-gray-50/50 dark:bg-gray-900/30 border-b border-gray-200 dark:border-gray-800 flex items-center gap-3">
                <form
                  onSubmit={handleSearch}
                  className="flex-1 bg-white dark:bg-gray-900 rounded-xl border-2 border-gray-200 dark:border-gray-800 focus-within:border-red-700 transition-all flex items-center px-4 shadow-sm"
                >
                  <Search className="w-4 h-4 text-gray-400 flex-shrink-0" strokeWidth={3} />
                  <input
                    ref={inputRef}
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Buscar notícias, temas ou autores..."
                    className="flex-1 bg-transparent border-none py-3 px-3 text-[14px] font-bold text-gray-900 dark:text-gray-100 placeholder:text-gray-400 focus:ring-0 outline-none"
                    autoFocus
                    autoComplete="off"
                    autoCorrect="off"
                    spellCheck={false}
                    aria-label="Campo de busca"
                  />
                  {query && (
                    <button
                      type="button"
                      onClick={clearQuery}
                      className="p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors"
                      aria-label="Limpar busca"
                    >
                      <X className="w-4 h-4 text-gray-400" />
                    </button>
                  )}
                </form>
                <button
                  onClick={close}
                  className="sm:hidden text-[12px] font-black uppercase text-gray-500 px-2"
                >
                  Fechar
                </button>
              </div>

              {/* Resultados */}
              <div className="flex-1 overflow-y-auto">
                {query.length < 2 ? (
                  <div>
                    <RecentSearches onSelect={(q) => { setQuery(q); handleSearch(undefined, q); }} />
                    <TrendingSearches onSelect={(q) => { setQuery(q); handleSearch(undefined, q); }} />
                  </div>
                ) : (
                  <SearchSuggestions
                    results={results}
                    isLoading={isLoading}
                    query={query}
                    onSelect={close}
                  />
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}


