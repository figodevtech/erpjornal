"use client";

import { Search, Loader2 } from "lucide-react";

export function SearchResultsSkeleton() {
  return (
    <div className="w-full animate-pulse">
      <div className="space-y-12">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="flex flex-col md:flex-row gap-8 pb-12 border-b border-gray-100 dark:border-gray-800">
            <div className="md:w-72 lg:w-80 h-56 bg-gray-100 dark:bg-gray-900 rounded-xl flex-shrink-0" />
            <div className="flex-1 space-y-4">
              <div className="h-4 w-32 bg-gray-100 dark:bg-gray-900 rounded" />
              <div className="h-8 w-full bg-gray-100 dark:bg-gray-900 rounded" />
              <div className="h-4 w-full bg-gray-100 dark:bg-gray-900 rounded" />
              <div className="h-4 w-2/3 bg-gray-100 dark:bg-gray-900 rounded" />
              <div className="h-4 w-24 bg-gray-150 dark:bg-gray-800 rounded mt-auto" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function SearchSuggestionsSkeleton() {
  return (
    <div className="p-8 flex flex-col items-center justify-center space-y-4">
      <Loader2 className="w-10 h-10 text-red-700 animate-spin" />
      <span className="text-[11px] font-black uppercase tracking-[0.2em] text-gray-500 animate-pulse">
        Acessando Arquivos...
      </span>
    </div>
  );
}
