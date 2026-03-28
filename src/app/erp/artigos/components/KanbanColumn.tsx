"use client";

import { useDroppable } from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { KanbanCard } from "./KanbanCard";
import { Plus } from "lucide-react";
import Link from "next/link";

export const COLUMNS = [
  { id: "pauta", label: "Pauta", color: "border-gray-200" },
  { id: "apuracao", label: "Apuração", color: "border-blue-200" },
  { id: "redacao", label: "Redação", color: "border-yellow-200" },
  { id: "revisao", label: "Revisão", color: "border-orange-200" },
  { id: "juridico", label: "Jurídico", color: "border-red-200" },
  { id: "publicado", label: "Publicado", color: "border-green-200" },
];

interface Article {
  id: string;
  titulo: string;
  status_id: string;
  autor?: { nome: string } | null;
  categoria?: { nome: string; cor?: string | null } | null;
  created_at: Date;
}

interface KanbanColumnProps {
  id: string;
  label: string;
  articles: Article[];
}

export function KanbanColumn({ id, label, articles }: KanbanColumnProps) {
  const { setNodeRef } = useDroppable({ id });

  return (
    <div className="flex flex-col w-screen md:w-[280px] bg-[#f8f9ff] rounded-xl overflow-hidden shadow-sm">
      <div className="p-4 flex items-center justify-between border-b border-gray-100 bg-white shadow-sm">
        <h3 className="font-bold text-gray-800 text-sm flex items-center">
          <span className="mr-2 uppercase tracking-widest text-[10px] bg-gray-100 px-2 py-0.5 rounded text-gray-500 font-bold">
            {articles.length}
          </span>
          {label}
        </h3>
        {id === "pauta" && (
          <Link 
            href="/erp/artigos/novo"
            className="p-1 hover:bg-gray-100 rounded-full transition-colors text-gray-400"
          >
            <Plus className="w-4 h-4" />
          </Link>
        )}
      </div>

      <div
        ref={setNodeRef}
        className="flex-1 p-3 flex flex-col gap-3 min-h-[300px]"
      >
        <SortableContext
          id={id}
          items={articles.map((a) => a.id)}
          strategy={verticalListSortingStrategy}
        >
          {articles.map((article) => (
            <KanbanCard key={article.id} article={article} />
          ))}
        </SortableContext>
        
        {articles.length === 0 && (
          <div className="flex items-center justify-center h-full border-2 border-dashed border-gray-200 rounded-lg p-4">
             <span className="text-xs text-gray-400 font-medium italic">Sem itens</span>
          </div>
        )}
      </div>
    </div>
  );
}

