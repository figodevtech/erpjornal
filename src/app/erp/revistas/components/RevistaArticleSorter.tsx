"use client";

import Link from "next/link";
import { useMemo, useState, useTransition } from "react";
import {
  closestCenter,
  DndContext,
  DragEndEvent,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical, Pencil } from "lucide-react";

import { updateRevistaArticleOrder } from "../actions";

type RevistaArticle = {
  id: string;
  titulo: string;
  status: string;
  criadoEm: Date;
  autor: { nome: string | null } | null;
  categoria: { nome: string } | null;
};

type RevistaArticleSorterProps = {
  revistaId: string;
  artigos: RevistaArticle[];
  podeEditar: boolean;
};

function SortableArticleRow({ artigo, index, podeEditar }: { artigo: RevistaArticle; index: number; podeEditar: boolean }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: artigo.id });

  return (
    <tr
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      className={`border-b border-gray-100 bg-white ${isDragging ? "relative z-10 shadow-lg" : "hover:bg-gray-50"}`}
    >
      <td className="w-14 px-4 py-4 text-gray-400">
        <button
          type="button"
          className="inline-flex cursor-grab rounded-md p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-700 active:cursor-grabbing"
          aria-label={`Ordenar ${artigo.titulo}`}
          {...attributes}
          {...listeners}
        >
          <GripVertical className="h-4 w-4" />
        </button>
      </td>
      <td className="w-16 px-4 py-4 text-sm font-bold text-gray-400">{index + 1}</td>
      <td className="px-4 py-4">
        <div className="font-semibold text-gray-900">{artigo.titulo}</div>
        <div className="mt-1 text-xs text-gray-500">
          {artigo.categoria?.nome ?? "Sem categoria"} · {artigo.autor?.nome ?? "Sem autor"}
        </div>
      </td>
      <td className="px-4 py-4">
        <span className="rounded-full bg-gray-100 px-2.5 py-1 text-xs font-semibold text-gray-700">{artigo.status}</span>
      </td>
      <td className="px-4 py-4 text-sm text-gray-500">{new Date(artigo.criadoEm).toLocaleDateString("pt-BR")}</td>
      <td className="px-4 py-4 text-right">
        {podeEditar && (
          <Link
            href={`/erp/artigos/${artigo.id}/edit`}
            className="inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-bold text-indigo-700 hover:bg-indigo-50"
          >
            <Pencil className="h-3.5 w-3.5" />
            Editar
          </Link>
        )}
      </td>
    </tr>
  );
}

export default function RevistaArticleSorter({ revistaId, artigos, podeEditar }: RevistaArticleSorterProps) {
  const [items, setItems] = useState(artigos);
  const [isPending, startTransition] = useTransition();
  const ids = useMemo(() => items.map((item) => item.id), [items]);
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = items.findIndex((item) => item.id === active.id);
    const newIndex = items.findIndex((item) => item.id === over.id);
    const reordered = arrayMove(items, oldIndex, newIndex);
    setItems(reordered);

    startTransition(async () => {
      await updateRevistaArticleOrder(revistaId, reordered.map((item) => item.id));
    });
  }

  if (items.length === 0) {
    return (
      <div className="rounded-xl border-2 border-dashed border-gray-200 bg-gray-50 py-16 text-center">
        <p className="font-medium text-gray-500">Nenhum artigo vinculado a esta revista.</p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
      <div className="flex items-center justify-between border-b border-gray-100 px-5 py-3">
        <p className="text-sm font-semibold text-gray-700">{items.length} artigos na edição</p>
        {isPending && <span className="text-xs font-medium text-indigo-600">Salvando ordem...</span>}
      </div>
      <div className="overflow-x-auto">
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <SortableContext items={ids} strategy={verticalListSortingStrategy}>
            <table className="w-full text-left text-sm">
              <thead className="bg-gray-50 text-xs uppercase tracking-wider text-gray-500">
                <tr>
                  <th className="px-4 py-3 font-semibold"></th>
                  <th className="px-4 py-3 font-semibold">Ordem</th>
                  <th className="px-4 py-3 font-semibold">Titulo</th>
                  <th className="px-4 py-3 font-semibold">Status</th>
                  <th className="px-4 py-3 font-semibold">Data</th>
                  <th className="px-4 py-3 font-semibold"></th>
                </tr>
              </thead>
              <tbody>
                {items.map((artigo, index) => (
                  <SortableArticleRow key={artigo.id} artigo={artigo} index={index} podeEditar={podeEditar} />
                ))}
              </tbody>
            </table>
          </SortableContext>
        </DndContext>
      </div>
    </div>
  );
}
