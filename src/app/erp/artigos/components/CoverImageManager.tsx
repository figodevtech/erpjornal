"use client";

import Image from "next/image";
import { ImageIcon, RefreshCcw, Sparkles, Upload } from "lucide-react";
import { useRef, useState } from "react";
import { toast } from "sonner";

import {
  generateArticleCoverImage,
  recreateArticleCoverImage,
  uploadArticleCoverImage,
} from "../image-actions";

type CoverImageManagerProps = {
  value: string;
  onChange: (url: string) => void;
  title: string;
  resumo?: string;
  corpoTexto?: string;
  referenceImageUrl?: string | null;
  allowRecreateFromReference?: boolean;
};

export default function CoverImageManager({
  value,
  onChange,
  title,
  resumo,
  corpoTexto,
  referenceImageUrl,
  allowRecreateFromReference = false,
}: CoverImageManagerProps) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [pendingAction, setPendingAction] = useState<"upload" | "generate" | "recreate" | null>(null);

  const actionContext = {
    title,
    resumo,
    corpoTexto,
    referenceImageUrl,
  };

  async function handleUpload(file?: File) {
    if (!file) return;

    setPendingAction("upload");
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("title", title || "materia");
      const result = await uploadArticleCoverImage(formData);
      onChange(result.url);
      toast.success("Imagem de capa enviada.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Erro ao enviar imagem.");
    } finally {
      setPendingAction(null);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  async function handleGenerate() {
    setPendingAction("generate");
    try {
      const result = await generateArticleCoverImage(actionContext);
      onChange(result.url);
      toast.success("Imagem de capa gerada com IA.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Erro ao gerar imagem.");
    } finally {
      setPendingAction(null);
    }
  }

  async function handleRecreate() {
    setPendingAction("recreate");
    try {
      const result = await recreateArticleCoverImage(actionContext);
      onChange(result.url);
      toast.success("Imagem do RSS recriada em alta qualidade.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Erro ao recriar imagem.");
    } finally {
      setPendingAction(null);
    }
  }

  const disabled = pendingAction !== null;

  return (
    <div className="space-y-4 rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h3 className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-gray-500">
            <ImageIcon className="h-4 w-4 text-indigo-600" />
            Imagem de Capa
          </h3>
          <p className="mt-1 text-xs font-medium text-gray-500">
            Usada no portal, cards e compartilhamento da matéria.
          </p>
        </div>
      </div>

      <div className="relative aspect-video overflow-hidden rounded-xl border border-gray-200 bg-gray-100">
        {value ? (
          <Image src={value} alt="Imagem de capa da matéria" fill className="object-cover" sizes="(max-width: 768px) 100vw, 420px" />
        ) : (
          <div className="flex h-full flex-col items-center justify-center text-gray-400">
            <ImageIcon className="mb-2 h-8 w-8" />
            <span className="text-[10px] font-black uppercase tracking-widest">Sem capa</span>
          </div>
        )}
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/png,image/jpeg,image/webp"
        className="hidden"
        onChange={(event) => handleUpload(event.target.files?.[0])}
      />

      <div className="grid grid-cols-1 gap-2">
        <button
          type="button"
          disabled={disabled}
          onClick={() => inputRef.current?.click()}
          className="flex items-center justify-center gap-2 rounded-xl border border-gray-200 bg-gray-50 px-4 py-2.5 text-[10px] font-black uppercase tracking-widest text-gray-700 transition-all hover:bg-white disabled:opacity-50"
        >
          <Upload className="h-3.5 w-3.5" />
          {pendingAction === "upload" ? "Enviando..." : "Enviar imagem"}
        </button>

        <button
          type="button"
          disabled={disabled || !title}
          onClick={handleGenerate}
          className="flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-[10px] font-black uppercase tracking-widest text-white shadow-lg shadow-indigo-500/20 transition-all hover:bg-indigo-500 disabled:opacity-50"
        >
          <Sparkles className="h-3.5 w-3.5" />
          {pendingAction === "generate" ? "Gerando..." : "Gerar por IA"}
        </button>

        {allowRecreateFromReference && referenceImageUrl && (
          <button
            type="button"
            disabled={disabled || !title}
            onClick={handleRecreate}
            className="flex items-center justify-center gap-2 rounded-xl border border-amber-200 bg-amber-50 px-4 py-2.5 text-[10px] font-black uppercase tracking-widest text-amber-800 transition-all hover:bg-amber-100 disabled:opacity-50"
          >
            <RefreshCcw className="h-3.5 w-3.5" />
            {pendingAction === "recreate" ? "Recriando..." : "Recriar imagem RSS"}
          </button>
        )}
      </div>

      <input type="hidden" name="urlImagemOg" value={value} />
    </div>
  );
}
