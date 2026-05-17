"use client";

/* eslint-disable @next/next/no-img-element */

import { useMemo, useState, useTransition } from "react";
import { Eye, Megaphone, Pencil, Plus, Save, Trash2, X } from "lucide-react";
import { toast } from "sonner";

import CustomSelect from "@/components/ui/CustomSelect";
import { AD_PAGE_TYPES, AD_PLACEMENTS, AD_POSITIONS, AD_SIZES, getAdPlacement, inferAdPlacement } from "@/lib/ads";
import { excluirAnuncio, salvarAnuncio } from "../actions";

type AnuncioItem = {
  id: string;
  titulo: string;
  imagemUrl: string;
  linkUrl: string;
  altText: string | null;
  tamanho: string;
  paginas: string[];
  posicoes: string[];
  ativo: boolean;
  prioridade: number;
  dataInicio: string | null;
  dataFim: string | null;
};

function formatDateInput(value: string | null) {
  return value ? value.slice(0, 10) : "";
}

function readFormDraft(form: HTMLFormElement, fallbackId: string): AnuncioItem {
  const formData = new FormData(form);
  const placement = getAdPlacement(formData.get("placement")?.toString() ?? "");

  return {
    id: fallbackId,
    titulo: formData.get("titulo")?.toString() ?? "",
    imagemUrl: formData.get("imagemUrl")?.toString() ?? "",
    linkUrl: formData.get("linkUrl")?.toString() ?? "",
    altText: formData.get("altText")?.toString() ?? "",
    tamanho: placement.tamanho,
    paginas: formData.getAll("paginas").map((value) => value.toString()),
    posicoes: [...placement.posicoes],
    ativo: formData.get("ativo") === "on",
    prioridade: Number.parseInt(formData.get("prioridade")?.toString() || "0", 10),
    dataInicio: formData.get("dataInicio")?.toString() || null,
    dataFim: formData.get("dataFim")?.toString() || null,
  };
}

const previewRatioClassName: Record<string, string> = {
  banner_horizontal: "aspect-[6/1]",
  banner_largo: "aspect-[970/250]",
  retangulo: "aspect-[4/3]",
  quadrado: "aspect-square",
  vertical: "aspect-[3/5]",
};

const previewWidthClassName: Record<string, string> = {
  banner_horizontal: "max-w-full",
  banner_largo: "max-w-full",
  retangulo: "max-w-[168px]",
  quadrado: "max-w-[150px]",
  vertical: "max-w-[150px]",
};

function PreviewAdImage({ draft, compact = false }: { draft: AnuncioItem; compact?: boolean }) {
  const ratio = previewRatioClassName[draft.tamanho] ?? previewRatioClassName.banner_horizontal;
  const width = compact ? "max-w-full" : previewWidthClassName[draft.tamanho] ?? "max-w-full";

  return (
    <div className={`w-full ${width}`}>
      <div className="mb-1 text-[7px] font-black uppercase tracking-[0.2em] text-gray-400">Publicidade</div>
      <div className={`relative overflow-hidden rounded-md border border-gray-200 bg-gray-100 ${ratio}`}>
        {draft.imagemUrl ? (
          <img src={draft.imagemUrl} alt={draft.altText || draft.titulo || "Preview do anúncio"} className="h-full w-full object-cover" />
        ) : (
          <div className="flex h-full w-full items-center justify-center px-3 text-center text-[10px] font-bold text-gray-400">
            Imagem do anúncio
          </div>
        )}
      </div>
    </div>
  );
}

function AdPagePreview({ draft }: { draft: AnuncioItem }) {
  const pagina = AD_PAGE_TYPES.find((item) => draft.paginas.includes(item.value))?.label ?? "Página";
  const showTop = draft.posicoes.includes("topo");
  const showMiddle = draft.posicoes.includes("meio") || draft.posicoes.includes("apos_imagem");
  const showFeed = draft.posicoes.includes("feed");
  const showSidebar = draft.posicoes.includes("lateral");

  return (
    <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
      <div className="flex items-center justify-between border-b border-gray-100 bg-gray-50 px-4 py-2">
        <div className="flex gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full bg-rose-400" />
          <span className="h-2.5 w-2.5 rounded-full bg-amber-400" />
          <span className="h-2.5 w-2.5 rounded-full bg-emerald-400" />
        </div>
        <div className="rounded-full bg-gray-200/60 px-3 py-1 text-[9px] font-mono text-gray-500">
          revistagestao.com.br/preview
        </div>
        <span />
      </div>

      <div className="space-y-4 bg-white p-4">
        <div className="flex items-center justify-between border-b border-gray-900 pb-2">
          <div>
            <p className="text-[8px] font-black uppercase tracking-[0.22em] text-red-700">{pagina}</p>
            <h3 className="text-sm font-black text-gray-950">Revista Gestão</h3>
          </div>
          <div className={`rounded-full px-2 py-1 text-[8px] font-black uppercase ${draft.ativo ? "bg-emerald-50 text-emerald-700" : "bg-gray-100 text-gray-500"}`}>
            {draft.ativo ? "Ativo" : "Inativo"}
          </div>
        </div>

        {showTop && <PreviewAdImage draft={draft} compact />}

        <div className="grid gap-4 sm:grid-cols-[minmax(0,1fr)_120px]">
          <div className="space-y-4">
            <div className="space-y-2">
              <div className="aspect-video rounded-lg bg-gray-200" />
              <div className="h-3 w-2/3 rounded bg-gray-900" />
              <div className="h-2 w-full rounded bg-gray-200" />
              <div className="h-2 w-4/5 rounded bg-gray-200" />
            </div>

            {showMiddle && (
              <div className="rounded-lg border border-dashed border-red-200 bg-red-50/30 p-2">
                <PreviewAdImage draft={draft} compact={draft.tamanho.startsWith("banner")} />
              </div>
            )}

            <div className="grid grid-cols-2 gap-3">
              {[1, 2].map((item) => (
                <div key={item} className="space-y-2">
                  <div className="aspect-[4/3] rounded bg-gray-200" />
                  <div className="h-2.5 rounded bg-gray-900" />
                  <div className="h-2 rounded bg-gray-200" />
                </div>
              ))}
            </div>

            {showFeed && (
              <div className="rounded-lg border border-dashed border-indigo-200 bg-indigo-50/40 p-2">
                <PreviewAdImage draft={draft} compact={draft.tamanho.startsWith("banner")} />
              </div>
            )}
          </div>

          <div className="hidden space-y-3 sm:block">
            {showSidebar ? (
              <PreviewAdImage draft={draft} />
            ) : (
              <div className="rounded-lg border border-dashed border-gray-200 bg-gray-50 p-3 text-center text-[9px] font-bold text-gray-400">
                Lateral vazia
              </div>
            )}
            <div className="space-y-2 rounded-lg bg-gray-50 p-2">
              <div className="h-2 rounded bg-gray-200" />
              <div className="h-2 rounded bg-gray-200" />
              <div className="h-2 w-2/3 rounded bg-gray-200" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function AdEditor({
  selected,
  submit,
  formId,
}: {
  selected: AnuncioItem;
  submit: (formData: FormData) => void;
  formId: string;
}) {
  const [draft, setDraft] = useState(selected);
  const selectedPlacement = inferAdPlacement(selected.tamanho, selected.posicoes);
  const draftPlacement = inferAdPlacement(draft.tamanho, draft.posicoes);

  return (
    <div className="grid min-h-0 gap-5 xl:grid-cols-[minmax(0,1fr)_440px]">
      <section className="flex min-h-0 flex-col rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
        <div className="mb-4 flex items-center gap-3">
          <div className="rounded-2xl bg-red-50 p-3 text-red-700">
            <Eye className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-lg font-black text-gray-950">Pré-visualização</h2>
            <p className="text-xs text-gray-500">{draftPlacement.label}: {AD_SIZES.find((size) => size.value === draft.tamanho)?.label}</p>
          </div>
        </div>
        <div className="min-h-0 flex-1">
          <AdPagePreview draft={draft} />
        </div>
      </section>

      <section className="flex min-h-0 flex-col rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
        <div className="mb-5 flex items-center gap-3">
          <div className="rounded-2xl bg-red-50 p-3 text-red-700">
            <Megaphone className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-lg font-black text-gray-950">{selected.id ? "Editar anúncio" : "Novo anúncio"}</h2>
            <p className="text-xs text-gray-500">Escolha a página e um modelo compatível de espaço.</p>
          </div>
        </div>

        <form
          id={formId}
          action={submit}
          onChange={(event) => setDraft(readFormDraft(event.currentTarget, selected.id))}
          className="min-h-0 flex-1 space-y-4"
        >
          {selected.id && <input type="hidden" name="id" value={selected.id} />}

          <div>
            <label className="mb-1.5 block text-xs font-bold uppercase tracking-widest text-gray-500">Título</label>
            <input name="titulo" required defaultValue={selected.titulo} className="w-full rounded-xl border text-gray-600 border-gray-200 bg-gray-50 px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-red-600" />
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-bold uppercase tracking-widest text-gray-500">Imagem</label>
            <input name="imagemUrl" type="url" required defaultValue={selected.imagemUrl} placeholder="https://..." className="text-gray-600 w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-red-600" />
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-bold uppercase tracking-widest text-gray-500">Link</label>
            <input name="linkUrl" type="url" required defaultValue={selected.linkUrl} placeholder="https://..." className="text-gray-600 w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-red-600" />
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-bold uppercase tracking-widest text-gray-500">Texto alternativo</label>
            <input name="altText" defaultValue={selected.altText ?? ""} className="text-gray-600 w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-red-600" />
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-bold uppercase tracking-widest text-gray-500">Prioridade</label>
            <input name="prioridade" type="number" defaultValue={selected.prioridade} className="w-full rounded-xl border text-gray-600 border-gray-200 bg-gray-50 px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-red-600" />
          </div>

          <fieldset>
            <legend className="mb-2 text-xs font-bold uppercase tracking-widest text-gray-500">Tipos de página</legend>
            <div className="grid gap-2 sm:grid-cols-2">
              {AD_PAGE_TYPES.map((pageType) => (
                <label key={pageType.value} className="flex items-center gap-2 rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 text-sm font-semibold text-gray-700">
                  <input type="checkbox" name="paginas" value={pageType.value} defaultChecked={selected.paginas.includes(pageType.value)} />
                  {pageType.label}
                </label>
              ))}
            </div>
          </fieldset>

          <fieldset>
            <legend className="mb-2 text-xs font-bold uppercase tracking-widest text-gray-500">Modelo de espaço</legend>
            <CustomSelect
              name="placement"
              defaultValue={selectedPlacement.value}
              placeholder="Selecione o modelo de espaço"
              options={AD_PLACEMENTS.map((placement) => ({
                value: placement.value,
                label: `${placement.label} - ${AD_SIZES.find((size) => size.value === placement.tamanho)?.label}`,
                description: placement.description,
              }))}
              onChange={(value) => {
                const placement = getAdPlacement(value);
                setDraft((current) => ({
                  ...current,
                  tamanho: placement.tamanho,
                  posicoes: [...placement.posicoes],
                }));
              }}
            />
            <p className="mt-2 rounded-xl border border-red-100 bg-red-50 px-3 py-2 text-xs leading-5 text-red-900">
              <span className="font-bold">{draftPlacement.label}:</span> {draftPlacement.description}
            </p>
          </fieldset>

          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-xs font-bold uppercase tracking-widest text-gray-500">Início</label>
              <input name="dataInicio" type="date" defaultValue={formatDateInput(selected.dataInicio)} className="text-gray-600 w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-red-600" />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-bold uppercase tracking-widest text-gray-500">Fim</label>
              <input name="dataFim" type="date" defaultValue={formatDateInput(selected.dataFim)} className="text-gray-600 w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-red-600" />
            </div>
          </div>

          <label className="flex items-center gap-2 rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 text-sm font-semibold text-gray-700">
            <input type="checkbox" name="ativo" defaultChecked={selected.ativo} />
            Anúncio ativo
          </label>

        </form>
      </section>
    </div>
  );
}

function AdDialog({
  open,
  selected,
  canSubmit,
  isPending,
  submit,
  onClose,
}: {
  open: boolean;
  selected: AnuncioItem;
  canSubmit: boolean;
  isPending: boolean;
  submit: (formData: FormData) => void;
  onClose: () => void;
}) {
  if (!open) return null;
  const formId = selected.id ? `anuncio-form-${selected.id}` : "anuncio-form-new";

  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-gray-950/70 p-4 backdrop-blur-sm">
      <div className="flex max-h-[92vh] w-full max-w-6xl flex-col overflow-hidden rounded-3xl bg-gray-50 shadow-2xl">
        <div className="shrink-0 flex items-start justify-between gap-4 border-b border-gray-200 bg-white px-5 py-4">
          <div>
            <h2 className="text-xl font-black text-gray-950">{selected.id ? "Editar anúncio" : "Novo anúncio"}</h2>
            <p className="mt-1 text-sm text-gray-500">Configure a peça e confira a pré-visualização antes de salvar.</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={isPending}
            className="rounded-xl border border-gray-200 bg-white p-2 text-gray-500 transition hover:bg-gray-50 hover:text-gray-900 disabled:opacity-50"
            aria-label="Fechar"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="erp-dialog-scrollbar min-h-0 flex-1 overflow-y-auto p-5">
          <AdEditor
            key={selected.id || "new"}
            selected={selected}
            submit={submit}
            formId={formId}
          />
        </div>

        <div className="shrink-0 border-t border-gray-200 bg-white px-5 py-4">
          <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={onClose}
              disabled={isPending}
              className="inline-flex items-center justify-center rounded-xl border border-gray-200 px-5 py-3 text-sm font-bold text-gray-600 transition hover:bg-gray-50 disabled:opacity-50"
            >
              Cancelar
            </button>
            <button
              type="submit"
              form={formId}
              disabled={!canSubmit || isPending}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-red-700 px-5 py-3 text-sm font-bold text-white transition hover:bg-red-800 disabled:opacity-50"
            >
              <Save className="h-4 w-4" />
              {isPending ? "Salvando..." : "Salvar anúncio"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

const emptyAnuncio: AnuncioItem = {
  id: "",
  titulo: "",
  imagemUrl: "",
  linkUrl: "",
  altText: "",
  tamanho: "banner_horizontal",
  paginas: ["home"],
  posicoes: ["topo"],
  ativo: true,
  prioridade: 0,
  dataInicio: null,
  dataFim: null,
};

export default function AnunciosManager({
  anuncios,
  podeCriar,
  podeEditar,
}: {
  anuncios: AnuncioItem[];
  podeCriar: boolean;
  podeEditar: boolean;
}) {
  const [selectedId, setSelectedId] = useState("");
  const [dialogAberto, setDialogAberto] = useState(false);
  const [isPending, startTransition] = useTransition();

  const selected = useMemo(
    () => anuncios.find((anuncio) => anuncio.id === selectedId) ?? emptyAnuncio,
    [anuncios, selectedId]
  );
  const canSubmit = selected.id ? podeEditar : podeCriar;

  function submit(formData: FormData) {
    startTransition(async () => {
      try {
        await salvarAnuncio(formData);
        toast.success(selected.id ? "Anúncio atualizado." : "Anúncio cadastrado.");
        setSelectedId("");
        setDialogAberto(false);
      } catch (error: unknown) {
        toast.error(error instanceof Error ? error.message : "Não foi possível salvar o anúncio.");
      }
    });
  }

  function remove(id: string) {
    startTransition(async () => {
      try {
        await excluirAnuncio(id);
        toast.success("Anúncio excluído.");
        setSelectedId("");
      } catch (error: unknown) {
        toast.error(error instanceof Error ? error.message : "Não foi possível excluir o anúncio.");
      }
    });
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-gray-950">Anúncios</h1>
          <p className="mt-1 text-sm text-gray-600">
            Cadastre imagens comerciais, links, vencimento e os pontos do portal onde cada peça aparece.
          </p>
        </div>
        {podeCriar && (
          <button
            type="button"
            onClick={() => {
              setSelectedId("");
              setDialogAberto(true);
            }}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-red-700 px-5 py-2.5 text-sm font-bold text-white transition hover:bg-red-800"
          >
            <Plus className="h-4 w-4" />
            Novo anúncio
          </button>
        )}
      </div>

      <div>
        <section className="space-y-4">
          {anuncios.length === 0 ? (
            <div className="rounded-3xl border-2 border-dashed border-gray-200 bg-white px-6 py-20 text-center text-gray-500">
              Nenhum anúncio cadastrado ainda.
            </div>
          ) : (
            anuncios.map((anuncio) => (
              <article key={anuncio.id} className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
                <div className="grid gap-0 md:grid-cols-[220px_1fr]">
                  <div className="relative h-40 bg-gray-100 md:h-full">
                    <img src={anuncio.imagemUrl} alt={anuncio.altText || anuncio.titulo} className="h-full w-full object-cover" />
                  </div>
                  <div className="space-y-4 p-5">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                      <div>
                        <h2 className="text-lg font-black text-gray-950">{anuncio.titulo}</h2>
                        <a href={anuncio.linkUrl} target="_blank" rel="noreferrer" className="mt-1 block truncate text-xs font-bold text-red-700">
                          {anuncio.linkUrl}
                        </a>
                      </div>
                      <span className={`w-fit rounded-full px-3 py-1 text-xs font-black uppercase ${anuncio.ativo ? "bg-emerald-50 text-emerald-700" : "bg-gray-100 text-gray-500"}`}>
                        {anuncio.ativo ? "Ativo" : "Inativo"}
                      </span>
                    </div>

                    <div className="flex flex-wrap gap-2 text-xs font-bold uppercase tracking-wide text-gray-600">
                      <span className="rounded-full bg-gray-100 px-3 py-1">{AD_SIZES.find((size) => size.value === anuncio.tamanho)?.label}</span>
                      {anuncio.paginas.map((pagina) => (
                        <span key={pagina} className="rounded-full bg-red-50 px-3 py-1 text-red-700">
                          {AD_PAGE_TYPES.find((item) => item.value === pagina)?.label ?? pagina}
                        </span>
                      ))}
                      {anuncio.posicoes.map((posicao) => (
                        <span key={posicao} className="rounded-full bg-indigo-50 px-3 py-1 text-indigo-700">
                          {AD_POSITIONS.find((item) => item.value === posicao)?.label ?? posicao}
                        </span>
                      ))}
                    </div>

                    <div className="flex flex-col gap-3 border-t border-gray-100 pt-4 sm:flex-row sm:items-center sm:justify-between">
                      <p className="text-xs text-gray-500">
                        Exibe até: {anuncio.dataFim ? new Date(anuncio.dataFim).toLocaleDateString("pt-BR") : "sem vencimento"}
                      </p>
                      {podeEditar && (
                        <div className="flex gap-2">
                          <button
                            type="button"
                            onClick={() => {
                              setSelectedId(anuncio.id);
                              setDialogAberto(true);
                            }}
                            className="inline-flex items-center gap-2 rounded-xl bg-gray-950 px-4 py-2 text-sm font-bold text-white transition hover:bg-black"
                          >
                            <Pencil className="h-4 w-4" />
                            Editar
                          </button>
                          <button
                            type="button"
                            onClick={() => remove(anuncio.id)}
                            disabled={isPending}
                            className="inline-flex items-center gap-2 rounded-xl border border-rose-200 bg-rose-50 px-4 py-2 text-sm font-bold text-rose-700 transition hover:bg-rose-100 disabled:opacity-50"
                          >
                            <Trash2 className="h-4 w-4" />
                            Excluir
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </article>
            ))
          )}
        </section>
      </div>

      <AdDialog
        open={dialogAberto}
        selected={selected}
        canSubmit={canSubmit}
        isPending={isPending}
        submit={submit}
        onClose={() => {
          if (isPending) return;
          setDialogAberto(false);
          setSelectedId("");
        }}
      />
    </div>
  );
}
