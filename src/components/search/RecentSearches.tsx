"use client";

import { useEffect, useState } from "react";
import { History, X } from "lucide-react";

interface RecentSearchesProps {
  onSelect: (query: string) => void;
}

export default function RecentSearches({ onSelect }: RecentSearchesProps) {
  const [recent, setRecent] = useState<string[]>([]);

  useEffect(() => {
    const stored = sessionStorage.getItem("recent_searches");
    if (stored) setRecent(JSON.parse(stored));
  }, []);

  const clearItem = (item: string) => {
    const updated = recent.filter(i => i !== item);
    setRecent(updated);
    sessionStorage.setItem("recent_searches", JSON.stringify(updated));
  };

  if (recent.length === 0) return null;

  return (
    <div className="py-4">
      <div className="flex items-center justify-between mb-3 px-4">
        <h3 className="text-[11px] font-black uppercase tracking-widest text-gray-500 dark:text-gray-400 flex items-center gap-2">
          <History className="w-3 h-3" />
          Buscas Recentes
        </h3>
      </div>
      <div className="flex flex-wrap gap-2 px-4">
        {recent.map((item) => (
          <div 
            key={item}
            className="group flex items-center gap-2 bg-gray-100 dark:bg-gray-800 hover:bg-red-50 dark:hover:bg-red-900/20 text-gray-700 dark:text-gray-300 px-3 py-1.5 rounded-full text-xs font-bold transition-all border border-transparent hover:border-red-200 dark:hover:border-red-800"
          >
            <button 
              onClick={() => onSelect(item)}
              className="outline-none"
            >
              {item}
            </button>
            <button 
              onClick={() => clearItem(item)}
              className="text-gray-400 hover:text-red-600 transition-colors"
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
