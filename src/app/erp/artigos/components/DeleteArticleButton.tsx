"use client";

import { useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import ConfirmationDialog from "@/components/ui/ConfirmationDialog";
import { deleteArticle } from "../actions";

type DeleteArticleButtonProps = {
  articleId: string;
  title: string;
  redirectTo?: string;
};

export default function DeleteArticleButton({ articleId, title, redirectTo = "/erp/artigos" }: DeleteArticleButtonProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [pending, setPending] = useState(false);

  async function handleDelete() {
    setPending(true);
    try {
      const result = await deleteArticle(articleId);
      toast.success("Artigo excluido.");
      setOpen(false);
      router.push(result.revistaId ? `/erp/revistas/${result.revistaId}` : redirectTo);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Nao foi possivel excluir o artigo.");
    } finally {
      setPending(false);
    }
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-rose-200 bg-rose-50 px-6 py-3.5 text-sm font-black text-rose-700 transition hover:bg-rose-100 disabled:opacity-60"
      >
        <Trash2 className="h-4 w-4" />
        Excluir artigo
      </button>

      <ConfirmationDialog
        open={open}
        title="Excluir artigo"
        description={`Esta acao remove definitivamente "${title}".`}
        confirmLabel="Excluir"
        tone="danger"
        pending={pending}
        onConfirm={handleDelete}
        onClose={() => setOpen(false)}
      />
    </>
  );
}
