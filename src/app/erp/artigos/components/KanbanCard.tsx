"use client";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { User, Calendar, Tag } from "lucide-react";

interface Article {
  id: string;
  titulo: string;
  status_id: string;
  autor?: { nome: string } | null;
  categoria?: { nome: string; cor?: string | null } | null;
  created_at: Date;
}

interface KanbanCardProps {
  article: Article;
}

export function KanbanCard({ article }: KanbanCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: article.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 50 : undefined,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={`bg-white rounded-lg p-4 shadow-sm group hover:shadow-md transition-all cursor-grab active:cursor-grabbing border-l-4 ${
        article.categoria?.cor ? `border-[${article.categoria.cor}]` : "border-gray-200"
      }`}
    >
      <div className="space-y-3">
        {article.categoria && (
          <div 
            className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] uppercase font-bold tracking-wider"
            style={{ 
              backgroundColor: article.categoria.cor + '20' || '#f1f5f9',
              color: article.categoria.cor || '#475569' 
            }}
          >
            <Tag className="w-2 h-2 mr-1" />
            {article.categoria.nome}
          </div>
        )}
        
        <h4 className="text-sm font-semibold text-gray-900 leading-snug line-clamp-2 font-serif">
          {article.titulo}
        </h4>
        
        <div className="flex flex-col gap-1.5 mt-2">
          <div className="flex items-center text-[11px] text-gray-500 font-medium">
            <User className="w-3 h-3 mr-1" />
            {article.autor?.nome || "Sem autor"}
          </div>
          <div className="flex items-center text-[11px] text-gray-500">
            <Calendar className="w-3 h-3 mr-1" />
            {format(new Date(article.created_at), "dd/MM/yyyy", { locale: ptBR })}
          </div>
        </div>
      </div>
    </div>
  );
}

