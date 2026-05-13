"use client";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical, Trash2, EyeOff } from "lucide-react";
import { MediaKitSectionWithData } from "@/types/media-kit";

interface Props {
  section: MediaKitSectionWithData;
  isActive: boolean;
  onClick: () => void;
  onDelete: () => void;
}

export default function SortableBlockItem({ section, isActive, onClick, onDelete }: Props) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: section.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`group relative flex items-center gap-2 rounded-xl border px-3 py-2 transition-all min-w-[140px] max-w-[200px] ${
        isDragging ? "z-50 shadow-xl opacity-90 border-rose-400 bg-rose-50" :
        isActive ? "border-rose-400 bg-rose-50 shadow-md ring-2 ring-rose-100" : "border-gray-200 bg-white hover:border-gray-300 hover:shadow-sm"
      }`}
      onClick={onClick}
    >
      <button
        type="button"
        className="cursor-grab text-gray-300 hover:text-rose-500 active:cursor-grabbing transition-colors"
        {...attributes}
        {...listeners}
      >
        <GripVertical className="h-3.5 w-3.5" />
      </button>

      <div className="flex-1 min-w-0 cursor-pointer">
        <div className="flex items-center gap-1.5">
          {!section.ativo && <EyeOff className="h-2.5 w-2.5 text-red-500 shrink-0" />}
          <h4 className="truncate text-[11px] font-black text-slate-900 uppercase tracking-tight">
            {section.titulo}
          </h4>
        </div>
        <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest truncate">
          {section.tipo}
        </p>
      </div>

      <button
        onClick={(e) => {
          e.stopPropagation();
          onDelete();
        }}
        className={`rounded-lg p-1 text-gray-300 hover:bg-red-50 hover:text-red-600 transition-all ${
          isActive ? "opacity-100" : "opacity-0 group-hover:opacity-100"
        }`}
      >
        <Trash2 className="h-3 w-3" />
      </button>
    </div>
  );
}
