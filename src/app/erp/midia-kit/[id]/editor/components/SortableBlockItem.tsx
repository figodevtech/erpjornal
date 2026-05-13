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
      className={`group relative flex items-center gap-3 rounded-xl border p-3 transition-all ${
        isDragging ? "z-50 shadow-xl opacity-90 border-rose-400 bg-rose-50" :
        isActive ? "border-rose-300 bg-rose-50 shadow-sm" : "border-gray-200 bg-white hover:border-gray-300 hover:shadow-sm"
      }`}
      onClick={onClick}
    >
      <button
        type="button"
        className="cursor-grab text-gray-400 hover:text-gray-900 active:cursor-grabbing"
        {...attributes}
        {...listeners}
      >
        <GripVertical className="h-4 w-4" />
      </button>

      <div className="flex-1 min-w-0 cursor-pointer">
        <div className="flex items-center gap-2">
          {!section.ativo && <EyeOff className="h-3 w-3 text-red-500" />}
          <h4 className="truncate text-sm font-bold text-gray-900">{section.titulo}</h4>
        </div>
        <p className="text-[11px] font-semibold uppercase tracking-wider text-gray-500 mt-0.5">
          {section.tipo}
        </p>
      </div>

      <button
        onClick={(e) => {
          e.stopPropagation();
          onDelete();
        }}
        className={`rounded-lg p-2 text-gray-400 hover:bg-red-50 hover:text-red-600 transition ${
          isActive ? "opacity-100" : "opacity-0 group-hover:opacity-100"
        }`}
      >
        <Trash2 className="h-4 w-4" />
      </button>
    </div>
  );
}
