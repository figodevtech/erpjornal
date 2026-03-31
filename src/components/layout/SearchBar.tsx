"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Search, X } from "lucide-react";

export default function SearchBar() {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState("");
  const router = useRouter();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      router.push(`/busca?q=${encodeURIComponent(query.trim())}`);
      setIsOpen(false);
      setQuery("");
    }
  };

  return (
    <div className="relative">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="text-gray-900 dark:text-gray-100 hover:text-red-700 transition-colors p-2 focus-visible:ring-2 focus-visible:ring-red-700 rounded-full outline-none" 
        aria-label={isOpen ? "Fechar pesquisa" : "Abrir pesquisa"}
      >
        {isOpen ? <X className="w-6 h-6" /> : <Search className="w-6 h-6" strokeWidth={3} />}
      </button>

      {isOpen && (
        <div className="absolute top-full right-0 mt-2 w-72 bg-white dark:bg-gray-950 shadow-2xl border border-gray-200 dark:border-gray-800 rounded-xl p-3 z-50 animate-in fade-in slide-in-from-top-2">
          <form onSubmit={handleSearch} className="flex gap-2">
            <input 
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Pesquisar notícias..."
              autoFocus
              className="flex-1 bg-gray-100 dark:bg-gray-900 border-none rounded-lg px-3 py-2 text-sm text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-red-700 outline-none"
            />
            <button 
              type="submit"
              className="bg-red-700 text-white px-3 py-2 rounded-lg hover:bg-red-800 transition-colors"
            >
              <Search className="w-4 h-4" />
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
