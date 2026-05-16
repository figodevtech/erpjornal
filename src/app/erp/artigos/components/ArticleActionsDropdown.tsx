"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Edit3, MoreVertical, Trash2 } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";

import ConfirmationDialog from "@/components/ui/ConfirmationDialog";
import { deleteArticle } from "../actions";

type ArticleActionsDropdownProps = {
  articleId: string;
  title: string;
  canEdit: boolean;
};

export default function ArticleActionsDropdown({ articleId, title, canEdit }: ArticleActionsDropdownProps) {
  const router = useRouter();
  const wrapperRef = useRef<HTMLDivElement | null>(null);
  const [open, setOpen] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [pending, setPending] = useState(false);

  useEffect(() => {
    if (!open) return;

    function handleClickOutside(event: MouseEvent) {
      if (!wrapperRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open]);

  async function handleDelete() {
    setPending(true);
    try {
      await deleteArticle(articleId);
      toast.success("Artigo excluido.");
      setConfirmOpen(false);
      router.refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Nao foi possivel excluir o artigo.");
    } finally {
      setPending(false);
    }
  }

  return (
    <div ref={wrapperRef} className="relative flex justify-end">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-gray-200 bg-white text-gray-500 transition hover:bg-gray-50 hover:text-gray-900"
        aria-label={`Ações para ${title}`}
      >
        <MoreVertical className="h-4 w-4" />
      </button>

      {open && (
        <div className="absolute right-0 top-10 z-30 w-44 overflow-hidden rounded-xl border border-gray-200 bg-white py-1 shadow-xl">
          {canEdit && (
            <Link
              href={`/erp/artigos/${articleId}/edit`}
              className="flex items-center gap-2 px-3 py-2 text-sm font-semibold text-gray-700 transition hover:bg-gray-50"
              onClick={() => setOpen(false)}
            >
              <Edit3 className="h-4 w-4 text-indigo-600" />
              Editar
            </Link>
          )}
          <button
            type="button"
            onClick={() => {
              setOpen(false);
              setConfirmOpen(true);
            }}
            className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm font-semibold text-rose-700 transition hover:bg-rose-50"
          >
            <Trash2 className="h-4 w-4" />
            Excluir
          </button>
        </div>
      )}

      <ConfirmationDialog
        open={confirmOpen}
        title="Excluir artigo"
        description={`Esta acao remove definitivamente "${title}".`}
        confirmLabel="Excluir"
        tone="danger"
        pending={pending}
        onConfirm={handleDelete}
        onClose={() => setConfirmOpen(false)}
      />
    </div>
  );
}
