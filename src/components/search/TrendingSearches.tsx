"use client";

import { TrendingUp } from "lucide-react";

interface TrendingSearchesProps {
  onSelect: (query: string) => void;
}

const TRENDING_TERMS = [
  "Economia Brasileira",
  "Eleições 2026",
  "Nova Política Fiscal",
  "Inteligência Artificial no Brasil",
  "Agronegócio",
  "Meio Ambiente"
];

export default function TrendingSearches({ onSelect }: TrendingSearchesProps) {
  return (
    <div className="py-4 border-t border-gray-100 dark:border-gray-800">
      <div className="flex items-center justify-between mb-3 px-4">
        <h3 className="text-[11px] font-black uppercase tracking-widest text-gray-500 dark:text-gray-400 flex items-center gap-2">
          <TrendingUp className="w-3 h-3" />
          Em Alta Agora
        </h3>
      </div>
      <div className="flex flex-wrap gap-2 px-4">
        {TRENDING_TERMS.map((term) => (
          <button 
            key={term}
            onClick={() => onSelect(term)}
            className="flex items-center gap-2 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 px-3 py-1.5 rounded-full text-xs font-bold transition-all border border-transparent focus:ring-2 focus:ring-red-600 outline-none"
          >
            {term}
          </button>
        ))}
      </div>
    </div>
  );
}
