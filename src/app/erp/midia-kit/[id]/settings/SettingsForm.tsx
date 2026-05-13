"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Trash2, Globe, EyeOff } from "lucide-react";
import { MediaKit, MediaKitStatus } from "@prisma/client";
import { updateMediaKit, deleteMediaKit, publishMediaKit } from "../../actions";
import { MediaKitTheme } from "@/types/media-kit";

interface Props {
  kit: MediaKit & { _count: { versoes: number } };
  podePublicar: boolean;
}

export default function SettingsForm({ kit, podePublicar }: Props) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const tema = (kit.tema as MediaKitTheme | null) ?? {
    primaryColor: "#0f172a",
    secondaryColor: "#e2e8f0",
    backgroundColor: "#ffffff",
    textColor: "#0f172a",
  };

  function handleSave(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    const fd = new FormData(e.currentTarget);

    startTransition(async () => {
      try {
        await updateMediaKit(kit.id, {
          nome: fd.get("nome") as string,
          slug: fd.get("slug") as string,
          tema: {
            primaryColor: fd.get("primaryColor") as string,
            secondaryColor: fd.get("secondaryColor") as string,
            backgroundColor: fd.get("backgroundColor") as string,
            textColor: fd.get("textColor") as string,
          },
        });
        setSuccess("Configurações salvas com sucesso.");
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : "Erro ao salvar.");
      }
    });
  }

  function handlePublish() {
    setError(null);
    startTransition(async () => {
      try {
        await publishMediaKit(kit.id);
        setSuccess("Mídia Kit publicado com sucesso!");
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : "Erro ao publicar.");
      }
    });
  }

  function handleArchive() {
    setError(null);
    startTransition(async () => {
      try {
        await updateMediaKit(kit.id, { status: "ARCHIVED" as MediaKitStatus });
        setSuccess("Mídia Kit arquivado.");
        router.refresh();
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : "Erro ao arquivar.");
      }
    });
  }

  function handleDelete() {
    if (!confirm(`Tem certeza que deseja excluir "${kit.nome}"? Esta ação não pode ser desfeita.`)) return;
    startTransition(async () => {
      try {
        await deleteMediaKit(kit.id);
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : "Erro ao excluir.");
      }
    });
  }

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
      {/* Coluna principal */}
      <div className="lg:col-span-2 space-y-6">
        <form onSubmit={handleSave} className="space-y-5 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
          <h2 className="text-base font-bold text-gray-900">Informações Básicas</h2>

          <div>
            <label htmlFor="nome" className="mb-1.5 block text-sm font-semibold text-gray-700">
              Nome
            </label>
            <input
              id="nome"
              name="nome"
              type="text"
              defaultValue={kit.nome}
              required
              className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-2.5 text-sm text-gray-900 focus:border-rose-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-rose-100"
            />
          </div>

          <div>
            <label htmlFor="slug" className="mb-1.5 block text-sm font-semibold text-gray-700">
              Slug (URL)
            </label>
            <div className="flex items-center overflow-hidden rounded-xl border border-gray-200 bg-gray-50 focus-within:border-rose-400 focus-within:ring-2 focus-within:ring-rose-100">
              <span className="border-r border-gray-200 bg-gray-100 px-3 py-2.5 text-sm text-gray-400">/midia-kit/</span>
              <input
                id="slug"
                name="slug"
                type="text"
                defaultValue={kit.slug}
                required
                className="flex-1 bg-transparent px-3 py-2.5 text-sm text-gray-900 focus:outline-none"
              />
            </div>
          </div>

          {/* Design tokens */}
          <div>
            <h3 className="mb-3 text-sm font-bold text-gray-700">Tema de Cores</h3>
            <div className="grid grid-cols-2 gap-4">
              {[
                { name: "primaryColor", label: "Cor Primária", default: tema.primaryColor },
                { name: "secondaryColor", label: "Cor Secundária", default: tema.secondaryColor },
                { name: "backgroundColor", label: "Fundo", default: tema.backgroundColor },
                { name: "textColor", label: "Texto", default: tema.textColor },
              ].map((field) => (
                <div key={field.name} className="flex items-center gap-3">
                  <input
                    type="color"
                    name={field.name}
                    defaultValue={field.default}
                    className="h-10 w-12 cursor-pointer rounded-xl border border-gray-200 p-1"
                  />
                  <label className="text-sm text-gray-600">{field.label}</label>
                </div>
              ))}
            </div>
          </div>

          {error && (
            <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>
          )}
          {success && (
            <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">{success}</div>
          )}

          <div className="flex justify-end border-t border-gray-100 pt-4">
            <button
              type="submit"
              disabled={pending}
              className="rounded-xl bg-rose-600 px-5 py-2.5 text-sm font-bold text-white transition hover:bg-rose-500 disabled:opacity-50"
            >
              {pending ? "Salvando..." : "Salvar alterações"}
            </button>
          </div>
        </form>
      </div>

      {/* Sidebar de ações */}
      <div className="space-y-4">
        {/* Status e publicação */}
        {podePublicar && (
          <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm space-y-3">
            <h2 className="text-sm font-bold text-gray-900">Publicação</h2>
            <p className="text-xs text-gray-500">Status atual: <strong>{kit.status === "DRAFT" ? "Rascunho" : kit.status === "PUBLISHED" ? "Publicado" : "Arquivado"}</strong></p>

            {kit.status !== "PUBLISHED" && (
              <button
                type="button"
                onClick={handlePublish}
                disabled={pending}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-bold text-white transition hover:bg-emerald-500 disabled:opacity-50"
              >
                <Globe className="h-4 w-4" />
                {pending ? "Publicando..." : "Publicar"}
              </button>
            )}

            {kit.status === "PUBLISHED" && (
              <button
                type="button"
                onClick={handleArchive}
                disabled={pending}
                className="flex w-full items-center justify-center gap-2 rounded-xl border border-gray-200 px-4 py-2.5 text-sm font-semibold text-gray-600 transition hover:bg-gray-50 disabled:opacity-50"
              >
                <EyeOff className="h-4 w-4" />
                {pending ? "Arquivando..." : "Despublicar / Arquivar"}
              </button>
            )}
          </div>
        )}

        {/* Zona de perigo */}
        <div className="rounded-2xl border border-red-100 bg-white p-5 shadow-sm space-y-3">
          <h2 className="text-sm font-bold text-red-700">Zona de Perigo</h2>
          <p className="text-xs text-gray-500">Excluir o kit remove permanentemente todo o conteúdo e versões.</p>
          <button
            type="button"
            onClick={handleDelete}
            disabled={pending}
            className="flex w-full items-center justify-center gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-2.5 text-sm font-bold text-red-600 transition hover:bg-red-100 disabled:opacity-50"
          >
            <Trash2 className="h-4 w-4" />
            Excluir Mídia Kit
          </button>
        </div>
      </div>
    </div>
  );
}
