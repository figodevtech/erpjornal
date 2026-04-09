"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Clock, ExternalLink, Sparkles, User, X } from "lucide-react";
import { toast } from "sonner";

import ConfirmationDialog from "@/components/ui/ConfirmationDialog";

import { rejectRSSItem, republishOriginalWithCredits, selectRSSItem } from "../../actions";

export function SelectionCard({
  item,
  categories,
  podeAprovar,
}: {
  item: any;
  categories: Array<{ id: string; nome: string }>;
  podeAprovar: boolean;
}) {
  const [loading, setLoading] = useState(false);
  const [confirmarAcao, setConfirmarAcao] = useState<null | "reject" | "republish">(null);
  const [categoriaId, setCategoriaId] = useState("");
  const router = useRouter();

  async function handleSelect() {
    setLoading(true);
    try {
      await selectRSSItem(item.id);
      toast.success("Noticia selecionada!");
      router.push(`/erp/curadoria/review/${item.id}`);
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleReject() {
    setLoading(true);
    try {
      await rejectRSSItem(item.id);
      toast.info("Noticia descartada");
      router.refresh();
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleRepublish() {
    if (!categoriaId) {
      toast.error("Selecione uma categoria antes de republicar.");
      return;
    }

    setLoading(true);
    try {
      await republishOriginalWithCredits(item.id, categoriaId || undefined);
      toast.success("Conteudo original republicado com creditos.");
      router.push("/erp/artigos");
      router.refresh();
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <div className="group relative flex flex-col overflow-hidden rounded-[32px] border border-gray-200 bg-white shadow-sm transition-all hover:shadow-xl">
        <div className="pointer-events-none relative h-44 shrink-0 overflow-hidden bg-gray-100">
          {item.thumbnail ? (
            <img
              src={item.thumbnail}
              alt=""
              className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-gray-300">
              <svg className="h-12 w-12" fill="currentColor" viewBox="0 0 24 24">
                <path d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
          )}
          <div className="absolute left-4 top-4">
            <span className="rounded-full border border-white/10 bg-gray-900/80 px-3 py-1.5 text-[10px] font-black uppercase tracking-widest text-white shadow-lg backdrop-blur-md">
              {item.source.name}
            </span>
          </div>
        </div>

        <div className="flex flex-1 flex-col p-6">
          <div className="mb-3 flex items-center gap-3 text-[10px] font-black uppercase tracking-widest text-gray-400">
            <span className="flex items-center gap-1 whitespace-nowrap">
              <Clock className="h-3 w-3" />
              {new Date(item.dataPublicacao).toLocaleDateString("pt-BR")}
            </span>
            <span className="line-clamp-1 flex items-center gap-1">
              <User className="h-3 w-3 text-gray-300" />
              {item.autorOriginal}
            </span>
          </div>

          <h3 className="mb-3 line-clamp-2 text-xl font-black leading-tight text-gray-900 transition-colors group-hover:text-indigo-600">
            {item.tituloOriginal}
          </h3>

          <p className="mb-6 line-clamp-3 text-sm font-medium leading-relaxed text-gray-500">
            {item.description?.replace(/<[^>]*>?/gm, "")}
          </p>

          <div className="mt-auto space-y-3">
            <div className="grid gap-2">
              {podeAprovar ? (
                <>
                  <button
                    onClick={handleSelect}
                    disabled={loading}
                    className="flex flex-1 items-center justify-center gap-2 rounded-2xl bg-gray-900 py-3 text-[11px] font-black uppercase tracking-[0.14em] text-white shadow-lg transition-all hover:bg-gray-800 active:scale-[0.98] disabled:opacity-50"
                  >
                    <Sparkles className="h-4 w-4 text-indigo-400" />
                    Reescrever
                  </button>

                  <div className="flex gap-2">
                    <button
                      onClick={() => setConfirmarAcao("republish")}
                      disabled={loading}
                      className="flex-1 rounded-2xl border border-indigo-200 bg-indigo-50 py-3 text-[11px] font-black uppercase tracking-[0.14em] text-indigo-700 transition-all hover:bg-indigo-100 active:scale-[0.98] disabled:opacity-50"
                    >
                      Republicar
                    </button>
                    <button
                      onClick={() => setConfirmarAcao("reject")}
                      disabled={loading}
                      className="rounded-2xl border border-gray-200 px-4 py-3 text-gray-400 transition-all hover:border-rose-100 hover:bg-rose-50 hover:text-rose-500 active:scale-95 disabled:opacity-50"
                    >
                      <X className="h-5 w-5" />
                    </button>
                  </div>
                </>
              ) : (
                <div className="rounded-2xl border border-dashed border-gray-200 px-4 py-3 text-center text-[10px] font-black uppercase tracking-[0.14em] text-gray-400">
                  Sem permissao para aprovar
                </div>
              )}
            </div>

            <a
              href={item.linkOriginal}
              target="_blank"
              rel="noopener noreferrer"
              className="flex w-full items-center justify-center gap-2 py-2 text-[10px] font-black uppercase tracking-widest text-gray-400 transition-colors hover:text-indigo-600"
            >
              <ExternalLink className="h-3.5 w-3.5" />
              Ver Original
            </a>
          </div>
        </div>
      </div>

      <ConfirmationDialog
        open={confirmarAcao === "republish"}
        onClose={() => setConfirmarAcao(null)}
        onConfirm={async () => {
          await handleRepublish();
          setConfirmarAcao(null);
        }}
        pending={loading}
        title="Republicar conteudo original?"
        description="Isso publica a materia com os creditos da fonte e o link da noticia original."
        confirmLabel="Republicar"
      >
        <div>
          <label className="mb-1.5 block text-xs font-black uppercase tracking-widest text-gray-500">
            Categoria
          </label>
          <select
            value={categoriaId}
            onChange={(event) => setCategoriaId(event.target.value)}
            className="w-full rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm font-medium text-gray-900 outline-none transition focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
          >
            <option value="">Selecionar categoria</option>
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.nome}
              </option>
            ))}
          </select>
        </div>
      </ConfirmationDialog>

      <ConfirmationDialog
        open={confirmarAcao === "reject"}
        onClose={() => setConfirmarAcao(null)}
        onConfirm={async () => {
          await handleReject();
          setConfirmarAcao(null);
        }}
        pending={loading}
        title="Descartar item da fila?"
        description="A noticia sera removida do dashboard de curadoria."
        confirmLabel="Descartar"
        tone="danger"
      />
    </>
  );
}
