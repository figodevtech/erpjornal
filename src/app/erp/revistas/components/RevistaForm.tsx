"use client";

import Link from "next/link";
import { useTransition } from "react";
import { Save } from "lucide-react";

import { saveRevista } from "../actions";

export type RevistaFormInitialData = {
  id: string;
  titulo: string;
  descricao: string | null;
  edicao: string;
  dataPublicacao: Date | null;
  capaUrl: string | null;
};

type RevistaFormProps = {
  initialData?: RevistaFormInitialData;
  onCancel?: () => void;
};

function formatDate(date?: Date | null) {
  if (!date) return "";
  return new Date(date.getTime() - date.getTimezoneOffset() * 60000).toISOString().slice(0, 10);
}

export default function RevistaForm({ initialData, onCancel }: RevistaFormProps) {
  const [isPending, startTransition] = useTransition();

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    startTransition(() => saveRevista(formData));
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {initialData?.id && <input type="hidden" name="id" value={initialData.id} />}

      <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
        <div className="md:col-span-2">
          <label className="mb-2 block text-xs font-bold uppercase tracking-widest text-gray-500">Título</label>
          <input
            name="titulo"
            required
            defaultValue={initialData?.titulo ?? ""}
            className="w-full rounded-lg border border-gray-200 bg-gray-50 p-3 text-sm outline-none transition focus:border-indigo-500 focus:bg-white focus:ring-2 focus:ring-indigo-500"
            placeholder="Ex: Edição Especial Gestão Pública"
          />
        </div>

        <div>
          <label className="mb-2 block text-xs font-bold uppercase tracking-widest text-gray-500">Edição</label>
          <input
            name="edicao"
            required
            defaultValue={initialData?.edicao ?? ""}
            className="w-full rounded-lg border border-gray-200 bg-gray-50 p-3 text-sm outline-none transition focus:border-indigo-500 focus:bg-white focus:ring-2 focus:ring-indigo-500"
            placeholder="Ex: 001, Maio 2026"
          />
        </div>

        <div>
          <label className="mb-2 block text-xs font-bold uppercase tracking-widest text-gray-500">Data de publicação</label>
          <input
            type="date"
            name="dataPublicacao"
            defaultValue={formatDate(initialData?.dataPublicacao)}
            className="w-full rounded-lg border border-gray-200 bg-gray-50 p-3 text-sm outline-none transition focus:border-indigo-500 focus:bg-white focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        <div className="md:col-span-2">
          <label className="mb-2 block text-xs font-bold uppercase tracking-widest text-gray-500">URL da capa</label>
          <input
            type="url"
            name="capaUrl"
            defaultValue={initialData?.capaUrl ?? ""}
            className="w-full rounded-lg border border-gray-200 bg-gray-50 p-3 text-sm outline-none transition focus:border-indigo-500 focus:bg-white focus:ring-2 focus:ring-indigo-500"
            placeholder="https://..."
          />
        </div>

        <div className="md:col-span-2">
          <label className="mb-2 block text-xs font-bold uppercase tracking-widest text-gray-500">Descrição</label>
          <textarea
            name="descricao"
            rows={4}
            defaultValue={initialData?.descricao ?? ""}
            className="w-full resize-none rounded-lg border border-gray-200 bg-gray-50 p-3 text-sm outline-none transition focus:border-indigo-500 focus:bg-white focus:ring-2 focus:ring-indigo-500"
          />
        </div>
      </div>

      <div className="flex flex-col gap-3 border-t border-gray-100 pt-5 sm:flex-row sm:items-center sm:justify-end">
        {onCancel ? (
          <button
            type="button"
            onClick={onCancel}
            disabled={isPending}
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-gray-200 px-5 py-3 text-sm font-bold text-gray-600 transition hover:bg-gray-50 disabled:opacity-60"
          >
            Cancelar
          </button>
        ) : (
          <Link
            href="/erp/revistas"
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-gray-200 px-5 py-3 text-sm font-bold text-gray-600 transition hover:bg-gray-50"
          >
            Cancelar
          </Link>
        )}
        <button
          type="submit"
          disabled={isPending}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-5 py-3 text-sm font-bold text-white transition hover:bg-indigo-700 disabled:opacity-60"
        >
          <Save className="h-4 w-4" />
          {isPending ? "Salvando..." : initialData ? "Salvar revista" : "Criar revista"}
        </button>
      </div>
    </form>
  );
}
