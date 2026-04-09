"use client";

import { useState } from "react";
import { ArticleStatus } from "@/lib/types/article-status";
import {
  DndContext,
  DragOverlay,
  closestCorners,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragStartEvent,
  DragOverEvent,
  DragEndEvent,
  defaultDropAnimationSideEffects,
} from "@dnd-kit/core";
import {
  arrayMove,
  sortableKeyboardCoordinates,
} from "@dnd-kit/sortable";
import { KanbanColumn, COLUMNS } from "./KanbanColumn";
import { KanbanCard } from "./KanbanCard";
import { updateArticleStatus } from "../actions";
import { toast } from "sonner";

interface Article {
  id: string;
  titulo: string;
  autor?: { nome: string } | null;
  categoria?: { nome: string; cor?: string | null } | null;
  status: ArticleStatus;
  criadoEm: Date;
}

export function KanbanBoard({ initialArticles }: { initialArticles: Article[] }) {
  const [artigos, setArticles] = useState<Article[]>(initialArticles);
  const [activeId, setActiveId] = useState<string | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const findColumn = (id: string): ArticleStatus | null => {
    if (COLUMNS.some((col) => col.id === id)) {
      return id as ArticleStatus;
    }
    const artigo = artigos.find((art) => art.id === id);
    return artigo ? (artigo.status as ArticleStatus) : null;
  };

  const onDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  };

  const onDragOver = (event: DragOverEvent) => {
    const { active, over } = event;
    if (!over) return;

    const activeId = active.id as string;
    const overId = over.id as string;

    const activeColumn = findColumn(activeId);
    const overColumn = findColumn(overId);

    if (!activeColumn || !overColumn || activeColumn === overColumn) {
      return;
    }

    setArticles((prev) => {
      const activeIndex = prev.findIndex((art) => art.id === activeId);
      const overIndex = prev.findIndex((art) => art.id === overId);

      let newIndex;
      if (COLUMNS.some((col) => col.id === overId)) {
        newIndex = artigos.length;
      } else {
        const isBelowOverItem =
          over &&
          active.rect.current.translated &&
          active.rect.current.translated.top >
            over.rect.top;

        const modifier = isBelowOverItem ? 1 : 0;
        newIndex = overIndex >= 0 ? overIndex + modifier : prev.length;
      }

      const updated = [...prev];
      updated[activeIndex] = { ...updated[activeIndex], status: overColumn as ArticleStatus };
      return arrayMove(updated, activeIndex, newIndex);
    });
  };

  const onDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over) {
      setActiveId(null);
      return;
    }

    const activeId = active.id as string;
    const overId = over.id as string;

    const activeColumn = findColumn(activeId);
    const overColumn = findColumn(overId);

    if (activeColumn && overColumn) {
      const artigo = artigos.find((art) => art.id === activeId);
      if (artigo && artigo.status !== activeColumn) {
        // Updated in onDragOver
      }
      
      // Persist status change
      if (artigo && overColumn !== initialArticles.find(a => a.id === activeId)?.status) {
        try {
          await updateArticleStatus(activeId, overColumn as ArticleStatus);
          toast.success("Status atualizado com sucesso!");
        } catch (error) {
          toast.error(`Falha ao atualizar: ${(error as Error).message}`);
          setArticles(initialArticles);
        }
      }
    }

    setActiveId(null);
  };

  const activeArticle = artigos.find((art) => art.id === activeId);

  return (
    <div className="flex flex-col h-full bg-gray-50 min-h-[calc(100vh-120px)] p-6 overflow-x-auto overflow-y-hidden">
      <DndContext
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragStart={onDragStart}
        onDragOver={onDragOver}
        onDragEnd={onDragEnd}
      >
        <div className="flex gap-6 h-full min-w-max pb-8">
          {COLUMNS.map((column) => (
            <KanbanColumn
              key={column.id}
              id={column.id}
              label={column.label}
              artigos={artigos.filter((art) => art.status === column.id)}
            />
          ))}
        </div>

        <DragOverlay dropAnimation={{
          sideEffects: defaultDropAnimationSideEffects({
            styles: {
              active: {
                opacity: "0.5",
              },
            },
          }),
        }}>
          {activeArticle ? <KanbanCard artigo={activeArticle} /> : null}
        </DragOverlay>
      </DndContext>
    </div>
  );
}

