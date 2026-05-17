"use client";

import { Calendar, FileText, Pencil, Trash2 } from "lucide-react";
import Link from "next/link";
import { useState, useTransition } from "react";

import ConfirmationDialog from "@/components/ui/ConfirmationDialog";

import { deleteRevista } from "../actions";
import NovaRevistaDialog from "./NovaRevistaDialog";

type RevistaCardProps = {
  revista: {
    id: string;
    titulo: string;
    descricao: string | null;
    edicao: string;
    capaUrl: string | null;
    dataPublicacao: Date | null;
    _count: {
      artigos: number;
    };
  };
  podeEditar: boolean;
};

export default function RevistaCard({ revista, podeEditar }: RevistaCardProps) {
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [error, setError] = useState("");
  const [isPending, startTransition] = useTransition();

  function handleDelete() {
    startTransition(async () => {
      try {
        await deleteRevista(revista.id);
        setConfirmOpen(false);
      } catch {
        setError("Não foi possível excluir esta revista.");
      }
    });
  }

  return (
    <>
      <div className="group relative overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
        <Link href={`/erp/revistas/${revista.id}`} className="block">
          <div className="aspect-[16/9] bg-gray-100">
            {revista.capaUrl ? (
              <img src={revista.capaUrl} alt={revista.titulo} className="h-full w-full object-cover" />
            ) : (
              <div className="flex h-full items-center justify-center bg-gray-900 text-white">
                <FileText className="h-10 w-10 opacity-50" />
              </div>
            )}
          </div>
          <div className="space-y-3 p-5">
            <div className="flex items-center justify-between gap-3">
              <span className="rounded-full bg-indigo-50 px-3 py-1 text-xs font-bold text-indigo-700">
                Edição {revista.edicao}
              </span>
              <span className="inline-flex items-center gap-1 text-xs text-gray-500">
                <Calendar className="h-3.5 w-3.5" />
                {revista.dataPublicacao ? revista.dataPublicacao.toLocaleDateString("pt-BR") : "Sem data"}
              </span>
            </div>
            <div>
              <h2 className="line-clamp-2 text-lg font-bold text-gray-900 group-hover:text-indigo-700">{revista.titulo}</h2>
              {revista.descricao && <p className="mt-2 line-clamp-2 text-sm text-gray-500">{revista.descricao}</p>}
            </div>
            <div className="border-t border-gray-100 pt-3 text-sm font-medium text-gray-600">
              {revista._count.artigos} artigos
            </div>
          </div>
        </Link>

        {podeEditar && (
          <div className="absolute right-3 top-3 flex gap-2 opacity-0 transition group-hover:opacity-100">
            <NovaRevistaDialog
              initialData={{
                id: revista.id,
                titulo: revista.titulo,
                descricao: revista.descricao,
                edicao: revista.edicao,
                dataPublicacao: revista.dataPublicacao,
                capaUrl: revista.capaUrl,
              }}
              triggerLabel=""
              buttonAriaLabel={`Editar ${revista.titulo}`}
              icon={<Pencil className="h-4 w-4" />}
              buttonClassName="inline-flex items-center justify-center rounded-lg bg-white/95 p-2 text-gray-500 shadow-sm transition hover:bg-indigo-50 hover:text-indigo-600"
            />
            <button
              type="button"
              onClick={() => {
                setError("");
                setConfirmOpen(true);
              }}
              className="inline-flex items-center justify-center rounded-lg bg-white/95 p-2 text-gray-500 shadow-sm transition hover:bg-rose-50 hover:text-rose-600"
              aria-label={`Excluir ${revista.titulo}`}
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        )}
      </div>

      <ConfirmationDialog
        open={confirmOpen}
        title="Excluir revista"
        description={`Esta acao remove a edicao ${revista.edicao} e exclui definitivamente ${revista._count.artigos} artigo(s) vinculado(s).`}
        confirmLabel="Excluir"
        cancelLabel="Cancelar"
        tone="danger"
        pending={isPending}
        onConfirm={handleDelete}
        onClose={() => {
          if (!isPending) {
            setConfirmOpen(false);
            setError("");
          }
        }}
      >
        {error && <p className="text-xs font-medium text-rose-600">{error}</p>}
      </ConfirmationDialog>
    </>
  );
}
