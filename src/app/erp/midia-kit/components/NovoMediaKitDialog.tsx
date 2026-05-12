"use client";

import { useState, useTransition } from "react";
import { createPortal } from "react-dom";
import { Plus, X, LayoutTemplate } from "lucide-react";
import { createMediaKit } from "../actions";

type Props = {
  emptyState?: boolean;
};

export default function NovoMediaKitDialog({ emptyState }: Props) {
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    const formData = new FormData(e.currentTarget);
    startTransition(async () => {
      try {
        await createMediaKit(formData);
      } catch (err: any) {
        setError(err.message ?? "Ocorreu um erro.");
      }
    });
  }

  function gerarSlug(nome: string) {
    return nome
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "");
  }

  const buttonClass = emptyState
    ? "mt-6 inline-flex items-center gap-2 rounded-xl bg-rose-600 px-5 py-2.5 text-sm font-bold text-white shadow-sm transition hover:bg-rose-500"
    : "inline-flex items-center gap-2 rounded-xl bg-rose-600 px-5 py-2.5 text-sm font-bold text-white shadow-sm transition hover:bg-rose-500";

  return (
    <>
      <button type="button" onClick={() => setOpen(true)} className={buttonClass}>
        <Plus className="h-4 w-4" />
        Novo Mídia Kit
      </button>

      {open &&
        typeof document !== "undefined" &&
        createPortal(
          <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-gray-950/60 p-4 backdrop-blur-sm">
            <div className="w-full max-w-lg overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-2xl">
              <div className="flex items-start justify-between gap-4 border-b border-gray-100 p-6">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-rose-50">
                    <LayoutTemplate className="h-5 w-5 text-rose-600" />
                  </div>
                  <div>
                    <h2 className="text-lg font-black text-gray-900">Novo Mídia Kit</h2>
                    <p className="text-sm text-gray-500">Configure nome e slug do kit comercial.</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="rounded-full p-2 text-gray-400 transition hover:bg-gray-100 hover:text-gray-700"
                  aria-label="Fechar"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4 p-6">
                <div>
                  <label htmlFor="nome" className="mb-1.5 block text-sm font-semibold text-gray-700">
                    Nome do Kit <span className="text-rose-500">*</span>
                  </label>
                  <input
                    id="nome"
                    name="nome"
                    type="text"
                    required
                    placeholder="Ex: Mídia Kit Comercial 2025"
                    className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-2.5 text-sm text-gray-900 placeholder-gray-400 transition focus:border-rose-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-rose-100"
                    onChange={(e) => {
                      const slugInput = document.getElementById("slug") as HTMLInputElement;
                      if (slugInput && !slugInput.dataset.touched) {
                        slugInput.value = gerarSlug(e.target.value);
                      }
                    }}
                  />
                </div>

                <div>
                  <label htmlFor="slug" className="mb-1.5 block text-sm font-semibold text-gray-700">
                    Slug (URL pública) <span className="text-rose-500">*</span>
                  </label>
                  <div className="flex items-center overflow-hidden rounded-xl border border-gray-200 bg-gray-50 focus-within:border-rose-400 focus-within:ring-2 focus-within:ring-rose-100">
                    <span className="border-r border-gray-200 bg-gray-100 px-3 py-2.5 text-sm text-gray-400">
                      /midia-kit/
                    </span>
                    <input
                      id="slug"
                      name="slug"
                      type="text"
                      required
                      placeholder="meu-kit-comercial"
                      className="flex-1 bg-transparent px-3 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:outline-none"
                      onInput={(e) => {
                        (e.target as HTMLInputElement).dataset.touched = "true";
                      }}
                    />
                  </div>
                  <p className="mt-1 text-[11px] text-gray-400">
                    Apenas letras minúsculas, números e hífens. Ex: revista-gestao-2025
                  </p>
                </div>

                {error && (
                  <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                    {error}
                  </div>
                )}

                <div className="flex justify-end gap-3 border-t border-gray-100 pt-4">
                  <button
                    type="button"
                    onClick={() => setOpen(false)}
                    className="rounded-xl px-4 py-2.5 text-sm font-semibold text-gray-600 transition hover:bg-gray-100"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={pending}
                    className="inline-flex items-center gap-2 rounded-xl bg-rose-600 px-5 py-2.5 text-sm font-bold text-white shadow-sm transition hover:bg-rose-500 disabled:opacity-50"
                  >
                    {pending ? "Criando..." : "Criar e Editar"}
                  </button>
                </div>
              </form>
            </div>
          </div>,
          document.body
        )}
    </>
  );
}
