"use client";

import { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { BookOpen, Edit3, Layers3, Loader2, Plus, Trash2, X } from "lucide-react";
import { toast } from "sonner";
import { excluirCategoria, salvarCategoria } from "../actions";

type CategoriaItem = {
  id: string;
  nome: string;
  slug: string;
  esfera: string | null;
  cor: string | null;
  metaDescricao: string | null;
  artigosCount: number;
  subcategoriasCount: number;
};

function slugify(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "");
}

function ModalShell({
  open,
  title,
  subtitle,
  onClose,
  children,
}: {
  open: boolean;
  title: string;
  subtitle: string;
  onClose: () => void;
  children: React.ReactNode;
}) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [onClose, open]);

  if (!mounted || !open) return null;

  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/70 p-4 backdrop-blur-md">
      <div className="flex max-h-[90vh] w-full max-w-2xl flex-col overflow-hidden rounded-[36px] border border-gray-100 bg-white shadow-2xl">
        <div className="relative bg-slate-900 p-7 text-white">
          <button
            type="button"
            onClick={onClose}
            className="absolute right-5 top-5 rounded-full p-2 text-white/50 transition hover:bg-white/10 hover:text-white"
          >
            <X className="h-5 w-5" />
          </button>
          <h2 className="text-xl font-black tracking-tight">{title}</h2>
          <p className="mt-1 text-sm text-slate-300">{subtitle}</p>
        </div>
        <div className="overflow-y-auto bg-white p-7">{children}</div>
      </div>
    </div>,
    document.body
  );
}

export default function CategoryManager({ categorias }: { categorias: CategoriaItem[] }) {
  const [dialogAberto, setDialogAberto] = useState(false);
  const [categoriaSelecionadaId, setCategoriaSelecionadaId] = useState<string | null>(null);
  const [nome, setNome] = useState("");
  const [slug, setSlug] = useState("");
  const [esfera, setEsfera] = useState("");
  const [cor, setCor] = useState("#c4170c");
  const [metaDescricao, setMetaDescricao] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const categoriaSelecionada = useMemo(
    () => categorias.find((categoria) => categoria.id === categoriaSelecionadaId) ?? null,
    [categoriaSelecionadaId, categorias]
  );

  useEffect(() => {
    if (!dialogAberto) {
      setNome("");
      setSlug("");
      setEsfera("");
      setCor("#c4170c");
      setMetaDescricao("");
      setCategoriaSelecionadaId(null);
      return;
    }

    if (categoriaSelecionada) {
      setNome(categoriaSelecionada.nome);
      setSlug(categoriaSelecionada.slug);
      setEsfera(categoriaSelecionada.esfera ?? "");
      setCor(categoriaSelecionada.cor ?? "#c4170c");
      setMetaDescricao(categoriaSelecionada.metaDescricao ?? "");
    }
  }, [categoriaSelecionada, dialogAberto]);

  async function handleSubmit(formData: FormData) {
    setIsSaving(true);
    try {
      await salvarCategoria(formData);
      toast.success(categoriaSelecionada ? "Categoria atualizada." : "Categoria criada.");
      setDialogAberto(false);
    } catch (error: any) {
      toast.error(error.message || "Erro ao salvar categoria.");
    } finally {
      setIsSaving(false);
    }
  }

  async function handleDelete(id: string) {
    setIsDeleting(true);
    try {
      await excluirCategoria(id);
      toast.success("Categoria excluida.");
      setDialogAberto(false);
    } catch (error: any) {
      toast.error(error.message || "Erro ao excluir categoria.");
    } finally {
      setIsDeleting(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-gray-950">Categorias</h1>
          <p className="mt-1 text-sm text-gray-600">
            Organize as editorias do portal e mantenha a taxonomia editorial centralizada.
          </p>
        </div>
        <button
          type="button"
          onClick={() => {
            setCategoriaSelecionadaId(null);
            setDialogAberto(true);
          }}
          className="inline-flex items-center gap-2 rounded-xl bg-red-700 px-4 py-2.5 text-sm font-black text-white transition hover:bg-red-800"
        >
          <Plus className="h-4 w-4" />
          Nova categoria
        </button>
      </div>

      <div className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="rounded-2xl bg-red-50 p-3 text-red-700">
            <Layers3 className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-xl font-black text-gray-950">Editorias ativas</h2>
            <p className="text-sm text-gray-500">
              {categorias.length} categoria(s) disponiveis para publicacao e curadoria.
            </p>
          </div>
        </div>
      </div>

      {categorias.length === 0 ? (
        <div className="rounded-3xl border-2 border-dashed border-gray-200 bg-white px-6 py-16 text-center text-gray-500">
          Nenhuma categoria cadastrada ainda.
        </div>
      ) : (
        <div className="grid gap-4 xl:grid-cols-2">
          {categorias.map((categoria) => (
            <article key={categoria.id} className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <div className="flex items-center gap-3">
                    <span
                      className="h-4 w-4 rounded-full border border-gray-200"
                      style={{ backgroundColor: categoria.cor || "#c4170c" }}
                    />
                    <h3 className="truncate text-lg font-black text-gray-950">{categoria.nome}</h3>
                  </div>
                  <p className="mt-1 text-sm text-gray-500">/{categoria.slug}</p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setCategoriaSelecionadaId(categoria.id);
                    setDialogAberto(true);
                  }}
                  className="inline-flex items-center gap-2 rounded-2xl bg-gray-950 px-4 py-2 text-sm font-black text-white transition hover:bg-black"
                >
                  <Edit3 className="h-4 w-4" />
                  Editar
                </button>
              </div>

              <div className="mt-4 flex flex-wrap gap-2 text-xs font-bold uppercase tracking-wide">
                {categoria.esfera && (
                  <span className="rounded-full bg-indigo-100 px-3 py-1 text-indigo-700">{categoria.esfera}</span>
                )}
                <span className="rounded-full bg-gray-100 px-3 py-1 text-gray-700">
                  {categoria.artigosCount} artigo(s)
                </span>
                <span className="rounded-full bg-amber-100 px-3 py-1 text-amber-700">
                  {categoria.subcategoriasCount} subcategoria(s)
                </span>
              </div>

              {categoria.metaDescricao && (
                <p className="mt-4 text-sm leading-relaxed text-gray-600">{categoria.metaDescricao}</p>
              )}
            </article>
          ))}
        </div>
      )}

      <ModalShell
        open={dialogAberto}
        onClose={() => !isSaving && !isDeleting && setDialogAberto(false)}
        title={categoriaSelecionada ? "Editar categoria" : "Nova categoria"}
        subtitle="Defina o nome, slug e metadados visuais da editoria."
      >
        <form
          onSubmit={(event) => {
            event.preventDefault();
            const formData = new FormData(event.currentTarget);
            void handleSubmit(formData);
          }}
          className="space-y-4"
        >
          {categoriaSelecionada && <input type="hidden" name="id" value={categoriaSelecionada.id} />}

          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-sm font-bold text-gray-800">Nome</label>
              <input
                name="nome"
                value={nome}
                onChange={(event) => {
                  setNome(event.target.value);
                  if (!categoriaSelecionada) {
                    setSlug(slugify(event.target.value));
                  }
                }}
                required
                className="w-full rounded-xl border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-950 outline-none transition focus:border-red-500 focus:ring-2 focus:ring-red-100"
              />
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-bold text-gray-800">Slug</label>
              <input
                name="slug"
                value={slug}
                onChange={(event) => setSlug(slugify(event.target.value))}
                required
                className="w-full rounded-xl border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-950 outline-none transition focus:border-red-500 focus:ring-2 focus:ring-red-100"
              />
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-[1fr_180px]">
            <div>
              <label className="mb-1.5 block text-sm font-bold text-gray-800">Esfera</label>
              <input
                name="esfera"
                value={esfera}
                onChange={(event) => setEsfera(event.target.value)}
                placeholder="Nacional, Internacional, Estadual..."
                className="w-full rounded-xl border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-950 outline-none transition focus:border-red-500 focus:ring-2 focus:ring-red-100"
              />
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-bold text-gray-800">Cor</label>
              <div className="flex items-center gap-3 rounded-xl border border-gray-300 bg-white px-3 py-2">
                <input
                  type="color"
                  name="cor"
                  value={cor}
                  onChange={(event) => setCor(event.target.value)}
                  className="h-9 w-12 cursor-pointer rounded border-0 bg-transparent p-0"
                />
                <span className="text-xs font-bold uppercase tracking-widest text-gray-500">{cor}</span>
              </div>
            </div>
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-bold text-gray-800">Meta descricao</label>
            <textarea
              name="metaDescricao"
              value={metaDescricao}
              onChange={(event) => setMetaDescricao(event.target.value)}
              rows={3}
              className="w-full rounded-xl border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-950 outline-none transition focus:border-red-500 focus:ring-2 focus:ring-red-100"
            />
          </div>

          <div className="flex flex-col gap-3 border-t border-gray-100 pt-4 sm:flex-row sm:justify-between">
            {categoriaSelecionada ? (
              <button
                type="button"
                onClick={() => void handleDelete(categoriaSelecionada.id)}
                disabled={isSaving || isDeleting}
                className="inline-flex items-center justify-center gap-2 rounded-2xl border border-rose-200 bg-rose-50 px-5 py-3 text-sm font-black text-rose-700 transition hover:bg-rose-100 disabled:opacity-50"
              >
                <Trash2 className="h-4 w-4" />
                {isDeleting ? "Excluindo..." : "Excluir"}
              </button>
            ) : (
              <span />
            )}

            <button
              type="submit"
              disabled={isSaving || isDeleting}
              className="inline-flex items-center justify-center gap-2 rounded-2xl bg-gray-950 px-5 py-3 text-sm font-black text-white transition hover:bg-black disabled:opacity-50"
            >
              {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <BookOpen className="h-4 w-4" />}
              {isSaving ? "Salvando..." : "Salvar categoria"}
            </button>
          </div>
        </form>
      </ModalShell>
    </div>
  );
}
