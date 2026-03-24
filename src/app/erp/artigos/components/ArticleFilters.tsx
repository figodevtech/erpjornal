"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useState, useTransition } from "react";

export default function ArticleFilters({ initialSearch, initialStatus }: { initialSearch: string; initialStatus: string }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const [isPending, startTransition] = useTransition();

  const [search, setSearch] = useState(initialSearch);
  const [status, setStatus] = useState(initialStatus);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams(searchParams.toString());
    
    if (search.trim()) params.set("search", search.trim());
    else params.delete("search");

    if (status) params.set("status", status);
    else params.delete("status");

    startTransition(() => {
      router.push(`${pathname}?${params.toString()}`);
    });
  };

  return (
    <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-4 items-end">
      <div className="flex-1 w-full">
        <label className="block text-sm font-medium text-slate-700 mb-1.5">Buscar por Título</label>
        <input 
          type="text" 
          value={search} 
          onChange={(e) => setSearch(e.target.value)} 
          className="w-full border-slate-300 rounded-lg shadow-sm p-2.5 border focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-shadow outline-none text-sm placeholder-slate-400" 
          placeholder="Digite a palavra-chave da matéria..." 
        />
      </div>
      <div className="w-full sm:w-56">
        <label className="block text-sm font-medium text-slate-700 mb-1.5">Filtrar por Status</label>
        <select 
          value={status} 
          onChange={(e) => setStatus(e.target.value)} 
          className="w-full border-slate-300 rounded-lg shadow-sm p-2.5 border focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-shadow outline-none text-sm bg-white"
        >
          <option value="">Todos os status</option>
          <option value="rascunho">Rascunho</option>
          <option value="em_revisao">Em Revisão</option>
          <option value="publicado">Publicado</option>
        </select>
      </div>
      <button 
        type="submit" 
        disabled={isPending}
        className="w-full sm:w-auto bg-slate-900 text-white font-medium px-6 py-2.5 rounded-lg hover:bg-slate-800 transition-colors disabled:opacity-70 disabled:cursor-not-allowed shadow-sm focus:ring-2 focus:ring-slate-900 focus:ring-offset-1"
      >
        {isPending ? "Aplicando..." : "Filtrar"}
      </button>
    </form>
  );
}
