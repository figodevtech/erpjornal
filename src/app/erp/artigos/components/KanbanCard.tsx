"use client";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { User, Calendar, Tag } from "lucide-react";

interface Article {
  id: string;
  titulo: string;
  status: string;
  autor?: { nome: string } | null;
  categoria?: { nome: string; cor?: string | null } | null;
  criadoEm: Date;
}

interface KanbanCardProps {
  artigo: Article;
}

export function KanbanCard({ artigo }: KanbanCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: artigo.id });

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
        artigo.categoria?.cor ? `border-[${artigo.categoria.cor}]` : "border-gray-200"
      }`}
    >
      <div className="space-y-3">
        {artigo.categoria && (
          <div 
            className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] uppercase font-bold tracking-wider"
            style={{ 
              backgroundColor: artigo.categoria.cor + '20' || '#f1f5f9',
              color: artigo.categoria.cor || '#475569' 
            }}
          >
            <Tag className="w-2 h-2 mr-1" />
            {artigo.categoria.nome}
          </div>
        )}
        
        <h4 className="text-sm font-semibold text-gray-900 leading-snug line-clamp-2 font-serif">
          {artigo.titulo}
        </h4>
        
        <div className="flex flex-col gap-1.5 mt-2">
          <div className="flex items-center text-[11px] text-gray-500 font-medium">
            <User className="w-3 h-3 mr-1" />
            {artigo.autor?.nome || "Sem autor"}
          </div>
          <div className="flex items-center text-[11px] text-gray-500">
            <Calendar className="w-3 h-3 mr-1" />
            {format(new Date(artigo.criadoEm), "dd/MM/yyyy", { locale: ptBR })}
          </div>
        </div>
      </div>
    </div>
  );
}

