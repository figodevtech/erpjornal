"use client";

import { useState } from "react";
import { History, X } from "lucide-react";

interface RecentSearchesProps {
  onSelect: (query: string) => void;
}

export default function RecentSearches({ onSelect }: RecentSearchesProps) {
  const [recent, setRecent] = useState<string[]>(() => {
    if (typeof window === "undefined") return [];
    const stored = sessionStorage.getItem("recent_searches");
    if (!stored) return [];

    try {
      const parsed = JSON.parse(stored);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  });

  const clearItem = (item: string) => {
    const updated = recent.filter(i => i !== item);
    setRecent(updated);
    sessionStorage.setItem("recent_searches", JSON.stringify(updated));
  };

  if (recent.length === 0) return null;

  return (
    <div className="py-4">
      <div className="flex items-center justify-between mb-3 px-4">
        <h3 className="flex items-center gap-2 text-[11px] font-black uppercase tracking-widest text-gray-900 dark:text-gray-100">
          <History className="w-3 h-3" />
          Buscas Recentes
        </h3>
      </div>
      <div className="flex flex-wrap gap-2 px-4">
        {recent.map((item) => (
          <div 
            key={item}
            className="group flex items-center gap-2 rounded-full border border-gray-200 bg-gray-100 px-3 py-1.5 text-xs font-bold text-gray-900 transition-all hover:border-red-200 hover:bg-red-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100 dark:hover:border-red-800 dark:hover:bg-red-900/20"
          >
            <button 
              onClick={() => onSelect(item)}
              className="outline-none transition-colors group-hover:text-red-700 dark:group-hover:text-red-300"
            >
              {item}
            </button>
            <button 
              onClick={() => clearItem(item)}
              className="text-gray-900 transition-colors hover:text-red-600 dark:text-white dark:hover:text-red-300"
              aria-label={`Remover ${item} do histórico`}
            >
              <X className="w-3 h-3" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
