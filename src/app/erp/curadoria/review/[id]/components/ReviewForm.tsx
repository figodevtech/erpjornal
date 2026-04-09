"use client";

import ConfirmationDialog from "@/components/ui/ConfirmationDialog";
import RichTextEditor from "@/components/ui/RichTextEditor";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { useState } from "react";
import {
  CheckCircle2,
  Layout,
  RotateCcw,
  Sparkles,
  XCircle,
} from "lucide-react";
import {
  approveAndPublish,
  rejectRSSItem,
  republishOriginalWithCredits,
  rewriteWithAI,
} from "../../../actions";

export function ReviewForm({
  item,
  aiData,
  user,
  categories,
}: {
  item: any;
  aiData: any;
  user: any;
  categories: Array<{ id: string; nome: string }>;
}) {
  const [loadingIA, setLoadingIA] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [confirmarAcao, setConfirmarAcao] = useState<null | "publish" | "republish" | "reject">(null);
  const router = useRouter();

  const [titulo, setTitulo] = useState(aiData?.ai_title || item.tituloOriginal);
  const [resumo, setResumo] = useState(aiData?.ai_lead || "");
  const [corpo, setCorpo] = useState(aiData?.ai_body || "");
  const [categoriaId, setCategoriaId] = useState("");

  async function handleAI() {
    setLoadingIA(true);
    try {
      const res = await rewriteWithAI(item.id);
      if (res.success) {
        setTitulo(res.aiResponse.ai_title);
        setResumo(res.aiResponse.ai_lead);
        setCorpo(res.aiResponse.ai_body);
        toast.success("IA gerou uma nova versao.");
      }
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setLoadingIA(false);
    }
  }

  async function handlePublishRewrite() {
    if (!categoriaId) {
      toast.error("Selecione uma categoria antes de publicar.");
      return;
    }

    setActionLoading(true);
    try {
      const res = await approveAndPublish(item.id, {
        titulo,
        resumo,
        corpoTexto: corpo,
        categoriaId: categoriaId || undefined,
      });
      if (res.success) {
        toast.success("Artigo publicado com sucesso.");
        setConfirmarAcao(null);
        router.push("/erp/artigos");
      }
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setActionLoading(false);
    }
  }

  async function handleRepublishOriginal() {
    if (!categoriaId) {
      toast.error("Selecione uma categoria antes de republicar.");
      return;
    }

    setActionLoading(true);
    try {
      const res = await republishOriginalWithCredits(item.id, categoriaId || undefined);
      if (res.success) {
        toast.success("Conteudo original republicado com creditos.");
        setConfirmarAcao(null);
        router.push("/erp/artigos");
      }
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setActionLoading(false);
    }
  }

  async function handleReject() {
    setActionLoading(true);
    try {
      await rejectRSSItem(item.id);
      toast.info("Item rejeitado.");
      setConfirmarAcao(null);
      router.push("/erp/curadoria/dashboard");
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setActionLoading(false);
    }
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-1000">
      {item.thumbnail && (
        <div className="relative h-64 w-full overflow-hidden rounded-[40px] border-4 border-white shadow-2xl md:h-96">
          <img
            src={item.thumbnail}
            alt="Preview do RSS"
            className="h-full w-full object-cover shadow-inner transition-transform duration-700 group-hover:scale-105"
          />
          <div className="absolute inset-x-0 bottom-0 flex items-end bg-gradient-to-t from-gray-900 to-transparent px-8 py-10">
            <span className="flex items-center gap-2 rounded-full border border-white/20 bg-white/20 px-4 py-2 text-[10px] font-black uppercase tracking-widest text-white backdrop-blur-md">
              <Layout className="h-3.5 w-3.5" />
              Miniatura Original do RSS
            </span>
          </div>
        </div>
      )}

      <div className="group relative flex flex-col items-center justify-between overflow-hidden rounded-[32px] border border-white/10 bg-gray-900 p-6 text-white shadow-xl shadow-indigo-500/10 md:flex-row">
        <div className="absolute right-0 top-0 -mr-32 -mt-32 h-64 w-64 rounded-full bg-indigo-500/10 blur-3xl transition-all group-hover:bg-indigo-500/20" />
        <div className="relative z-10 text-center md:text-left">
          <h3 className="flex items-center justify-center gap-2 text-xl font-black uppercase tracking-tight md:justify-start">
            <Sparkles className="h-6 w-6 text-indigo-400" />
            Reescrita IA (Gemini)
          </h3>
          <p className="mt-1 text-xs font-bold uppercase tracking-widest text-white/50">
            Gere uma versao original e exclusiva do conteudo
          </p>
        </div>
        <button
          type="button"
          onClick={handleAI}
          disabled={loadingIA}
          className="relative z-10 mt-6 flex items-center gap-3 rounded-2xl bg-white px-8 py-5 text-xs font-black uppercase tracking-widest text-gray-900 shadow-lg transition-all hover:bg-indigo-500 hover:text-white active:scale-95 disabled:opacity-50 md:mt-0"
        >
          {loadingIA ? "Gerando..." : "Reescrever com IA"}
          <RotateCcw className={`h-4 w-4 ${loadingIA ? "animate-spin" : ""}`} />
        </button>
      </div>

      <div className="space-y-8 rounded-[40px] border border-gray-200 bg-white p-6 shadow-sm md:p-10">
        <div className="space-y-2">
          <label className="ml-2 text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">
            Categoria
          </label>
          <select
            value={categoriaId}
            onChange={(event) => setCategoriaId(event.target.value)}
            className="w-full rounded-3xl border-2 border-gray-100 bg-gray-50 p-4 text-sm font-bold text-gray-900 outline-none transition-all focus:border-indigo-500 focus:bg-white"
          >
            <option value="">Selecionar categoria</option>
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.nome}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-2">
          <label className="ml-2 text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">
            Titulo Final
          </label>
          <input
            value={titulo}
            onChange={(e) => setTitulo(e.target.value)}
            className="w-full rounded-3xl border-2 border-gray-100 bg-gray-50 p-6 text-2xl font-black text-gray-900 outline-none transition-all placeholder:text-gray-300 focus:border-indigo-500 focus:bg-white"
            placeholder="Titulo final da materia..."
          />
        </div>

        <div className="space-y-2">
          <label className="ml-2 text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">
            Lead (Resumo)
          </label>
          <textarea
            rows={3}
            value={resumo}
            onChange={(e) => setResumo(e.target.value)}
            className="w-full resize-none rounded-3xl border-2 border-gray-100 bg-gray-50 p-6 text-sm font-bold italic text-gray-600 outline-none transition-all focus:border-indigo-500 focus:bg-white"
            placeholder="Breve resumo atraente..."
          />
        </div>

        <div className="space-y-2">
          <label className="ml-2 text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">
            Corpo da Materia
          </label>
          <RichTextEditor content={corpo} onChange={setCorpo} />
        </div>

        <div className="rounded-3xl border border-indigo-100 bg-indigo-50 px-5 py-4 text-sm font-medium text-indigo-800">
          Se preferir, voce tambem pode republicar o conteudo original com os devidos creditos da fonte e o link da materia de origem.
        </div>

        <div className="flex flex-col items-center justify-between gap-6 border-t border-gray-100 pt-8 md:flex-row">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gray-900 shadow-lg">
              <span className="text-sm font-black uppercase tracking-tighter text-white">
                {user.name?.[0] || "E"}
              </span>
            </div>
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">
                Revisor Humano
              </p>
              <p className="text-sm font-black uppercase text-gray-900">
                Portal • {user.name || "Editor"}
              </p>
            </div>
          </div>

          <div className="flex w-full flex-col gap-3 md:w-auto md:flex-row">
            <button
              type="button"
              onClick={() => setConfirmarAcao("reject")}
              className="flex items-center justify-center gap-2 rounded-2xl border border-gray-200 px-5 py-3.5 text-[10px] font-black uppercase tracking-widest text-gray-400 transition-all hover:border-rose-100 hover:bg-rose-50 hover:text-rose-500"
            >
              <XCircle className="h-4 w-4" />
              Rejeitar
            </button>

            <button
              type="button"
              onClick={() => setConfirmarAcao("republish")}
              disabled={actionLoading}
              className="flex items-center justify-center gap-2 rounded-2xl border border-indigo-200 bg-white px-5 py-3.5 text-[10px] font-black uppercase tracking-widest text-indigo-700 transition-all hover:bg-indigo-50 disabled:opacity-50"
            >
              <CheckCircle2 className="h-4 w-4" />
              Republicar
            </button>

            <button
              type="button"
              onClick={() => setConfirmarAcao("publish")}
              disabled={actionLoading}
              className="flex items-center justify-center gap-2 rounded-2xl bg-emerald-600 px-5 py-3.5 text-[10px] font-black uppercase tracking-widest text-white shadow-lg shadow-emerald-500/20 transition-all hover:bg-emerald-500 active:scale-95 disabled:opacity-50"
            >
              <CheckCircle2 className="h-4 w-4" />
              {actionLoading ? "Publicando..." : "Publicar reescrita"}
            </button>
          </div>
        </div>
      </div>

      <div className="relative space-y-1 overflow-hidden rounded-[40px] border border-white/10 bg-gray-900 p-8 text-xs italic text-white/50">
        <div className="absolute right-0 top-0 p-8 text-white/5 opacity-20">
          <Layout className="h-32 w-32" />
        </div>
        <p className="mb-4 flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-white/80">
          <span className="h-2 w-2 animate-pulse rounded-full bg-indigo-500" />
          Preview do rodape de creditos
        </p>
        <p className="border-t border-white/5 pt-4">---</p>
        <p>
          Baseado em materia original do portal <strong>{item.source.name}</strong>
        </p>
        <p>
          Publicado originalmente em{" "}
          {new Date(item.dataPublicacao).toLocaleDateString("pt-BR")} as{" "}
          {new Date(item.dataPublicacao).toLocaleTimeString("pt-BR", {
            hour: "2-digit",
            minute: "2-digit",
          })}
        </p>
        <p>
          Conteudo reescrito ou republicado com revisao de <strong>{user.name || "Redacao"}</strong>
        </p>
        <p>Revista Gestao - Sua fonte confiavel</p>
        <p>---</p>
      </div>

      <ConfirmationDialog
        open={confirmarAcao === "publish"}
        onClose={() => setConfirmarAcao(null)}
        onConfirm={handlePublishRewrite}
        pending={actionLoading}
        title="Publicar artigo reescrito?"
        description="O texto final sera salvo no ERP e publicado no portal."
        confirmLabel="Publicar"
      />

      <ConfirmationDialog
        open={confirmarAcao === "republish"}
        onClose={() => setConfirmarAcao(null)}
        onConfirm={handleRepublishOriginal}
        pending={actionLoading}
        title="Republicar conteudo original?"
        description="A materia sera publicada com creditos da fonte e link de origem, usando o conteudo disponivel no feed."
        confirmLabel="Republicar"
      />

      <ConfirmationDialog
        open={confirmarAcao === "reject"}
        onClose={() => setConfirmarAcao(null)}
        onConfirm={handleReject}
        pending={actionLoading}
        title="Rejeitar item da curadoria?"
        description="O item saira da fila e deixara de aparecer no dashboard."
        confirmLabel="Rejeitar"
        tone="danger"
      />
    </div>
  );
}
