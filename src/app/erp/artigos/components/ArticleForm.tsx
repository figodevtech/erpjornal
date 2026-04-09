"use client";

import React, { useTransition, useState } from "react";
import { saveArticle } from "../actions";

interface Category {
  id: string;
  nome: string;
}

export interface InitialData {
  id: string;
  titulo: string;
  slug: string;
  resumo: string | null;
  corpoTexto: string;
  categoriaId: string | null;
  status: string;
  observacoesLegais: string | null;
  statusLegal: string;
  dataPublicacao: Date | null;
  checagensFato?: { id: string, fonte_url: string, documento_url: string, status_verificacao: string }[];
  politicos?: { id: string }[];
  regiao: string | null;
  estado: string | null;
  autorId?: string;
  canaisPublicacao?: string[];
  urlFonte?: string | null;
  autorExterno?: string | null;
}

interface Politician {
  id: string;
  nome: string;
  partido: string | null;
}

interface ArticleFormProps {
  categories: Category[];
  politicians: Politician[];
  userRole: string;
  initialData?: InitialData | null;
}

import { FactCheckManager } from "./FactCheckManager";
import { ArticleHistory } from "./ArticleHistory";
import { 
  Globe,
  BookOpen,
  Link as LinkIcon, 
  Sparkles, 
  Eye, 
  Edit3, 
  Columns, 
  Tablet, 
  Smartphone, 
  Monitor, 
  ArrowLeftRight
} from "lucide-react";
import { toast as sonnerToast } from "sonner";
import RichTextEditor from "@/components/ui/RichTextEditor";
import { SEOSidebar } from "./SEOSidebar";
import { ArticlePreview } from "./ArticlePreview";
import { rephraseArticleContent } from "../ai-actions";

export default function ArticleForm({ categories, politicians, userRole, initialData }: ArticleFormProps) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState("");
  // Inicia com o status do banco, ou "rascunho"
  const [statusInput, setStatusInput] = useState(initialData?.status || "rascunho");
  const [currentText, setCurrentText] = useState(initialData?.corpoTexto || "");
  const [currentTitle, setCurrentTitle] = useState(initialData?.titulo || "");
  const [currentResumo, setCurrentResumo] = useState(initialData?.resumo || "");
  const [importUrl, setImportUrl] = useState("");
  const [isImporting, setIsImporting] = useState(false);
  const [sourceUrl, setSourceUrl] = useState(initialData?.urlFonte || "");
  const [externalAuthor, setExternalAuthor] = useState(initialData?.autorExterno || "");
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [viewMode, setViewMode] = useState<"edit" | "preview" | "split">("edit");
  const [previewDevice, setPreviewDevice] = useState<"mobile" | "tablet" | "desktop">("desktop");
  const [selectedCategoryId, setSelectedCategoryId] = useState(initialData?.categoriaId || "");

  const formatSlug = (val: string) => {
    return val.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
  };

  const formatedDate = initialData?.dataPublicacao 
    ? new Date(initialData.dataPublicacao.getTime() - initialData.dataPublicacao.getTimezoneOffset() * 60000).toISOString().slice(0, 16)
    : "";

  const handleAiRefactor = async (e: React.MouseEvent) => {
    if (!currentTitle || !currentText) {
      sonnerToast.error("Preencha o título e o corpo do texto antes de usar a IA.");
      return;
    }

    setIsAiLoading(true);
    try {
      const result = await rephraseArticleContent(currentTitle, currentText);
      
      if (result.new_title) setCurrentTitle(result.new_title);
      if (result.new_text) setCurrentText(result.new_text);
      
      sonnerToast.success("Texto Refinado com Sucesso!", {
        description: result.summary || "A IA melhorou a clareza e o fluxo editorial.",
        duration: 5000,
      });
    } catch (err: unknown) {
      const error = err as Error;
      sonnerToast.error("Erro na Mágica IA", {
        description: error.message || "Tente novamente em instantes.",
      });
    } finally {
      setIsAiLoading(false);
    }
  };

  const handleAction = async (formData: FormData) => {
    setError("");
    startTransition(async () => {
      try {
        await saveArticle(formData);
      } catch (err: unknown) {
        setError((err as Error).message || "Erro interno ao salvar.");
      }
    });
  };

  const canPublish = userRole === "admin" || userRole === "editor";

  return (
    <div className="space-y-8">
      {/* Toolbar Superior de Modos de Visualização */}
      <div className="sticky top-4 z-50 flex items-center justify-between bg-white/80 backdrop-blur-md p-3 rounded-2xl border border-gray-200 shadow-xl mx-auto max-w-fit gap-2">
        <div className="flex bg-gray-100 p-1 rounded-xl">
          <button
            type="button"
            onClick={() => setViewMode("edit")}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all ${viewMode === "edit" ? "bg-white text-blue-600 shadow-sm" : "text-gray-500 hover:text-gray-900"}`}
          >
            <Edit3 size={14} /> Editor
          </button>
          <button
            type="button"
            onClick={() => setViewMode("split")}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all ${viewMode === "split" ? "bg-white text-blue-600 shadow-sm" : "text-gray-500 hover:text-gray-900"}`}
          >
            <Columns size={14} /> Split View
          </button>
          <button
            type="button"
            onClick={() => setViewMode("preview")}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all ${viewMode === "preview" ? "bg-white text-blue-600 shadow-sm" : "text-gray-500 hover:text-gray-900"}`}
          >
            <Eye size={14} /> Preview Real
          </button>
        </div>

        {viewMode !== "edit" && (
          <>
            <div className="w-px h-6 bg-gray-200 mx-2" />
            <div className="flex bg-gray-100 p-1 rounded-xl">
              <button
                type="button"
                onClick={() => setPreviewDevice("mobile")}
                className={`p-2 rounded-lg transition-all ${previewDevice === "mobile" ? "bg-white text-blue-600 shadow-sm" : "text-gray-500"}`}
              >
                <Smartphone size={14} />
              </button>
              <button
                type="button"
                onClick={() => setPreviewDevice("tablet")}
                className={`p-2 rounded-lg transition-all ${previewDevice === "tablet" ? "bg-white text-blue-600 shadow-sm" : "text-gray-500"}`}
              >
                <Tablet size={14} />
              </button>
              <button
                type="button"
                onClick={() => setPreviewDevice("desktop")}
                className={`p-2 rounded-lg transition-all ${previewDevice === "desktop" ? "bg-white text-blue-600 shadow-sm" : "text-gray-500"}`}
              >
                <Monitor size={14} />
              </button>
            </div>
          </>
        )}

        <div className="w-px h-6 bg-gray-200 mx-2" />
        
        <button
          type="button"
          disabled={isAiLoading}
          onClick={handleAiRefactor}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-black transition-all group overflow-hidden relative ${
            isAiLoading 
            ? "bg-gray-100 text-gray-400 cursor-not-allowed" 
            : "bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg shadow-indigo-500/30 hover:shadow-indigo-500/50 hover:scale-105"
          }`}
        >
          {isAiLoading ? (
            <>
              <div className="animate-spin rounded-full h-3 w-3 border-2 border-gray-400 border-t-white" />
              Processando...
            </>
          ) : (
            <>
              <Sparkles size={14} className="group-hover:animate-pulse" />
              Mágica IA
              <div className="absolute inset-0 bg-white/20 translate-x-full group-hover:translate-x-[-100%] transition-transform duration-1000 skew-x-12" />
            </>
          )}
        </button>
      </div>

      <form action={handleAction} className={`transition-all duration-500 ${viewMode === "preview" ? "opacity-0 invisible h-0" : ""}`}>
        {/* Campo Oculto para UPDATE Dinâmico Controlado por React API Routes */}
        {initialData?.id && <input type="hidden" name="id" value={initialData.id} />}

        {error && (
          <div className="mb-6 p-4 bg-rose-50 text-rose-800 border-l-4 border-rose-500 rounded-r-lg text-sm font-medium">
            {error}
          </div>
        )}

        <div className={`grid grid-cols-1 gap-8 pt-4 transition-all duration-500 ${viewMode === "split" ? "lg:grid-cols-2" : "lg:grid-cols-3"}`}>
          <div className={`${viewMode === "split" ? "col-span-1" : "lg:col-span-2"} space-y-6`}>
            <div>
              <label className="block text-sm font-semibold text-gray-800 mb-2 font-sans">
                Título da Matéria <span className="text-rose-500">*</span>
              </label>
              <input 
                type="text" 
                name="titulo" 
                required 
                value={currentTitle}
                onChange={(e) => setCurrentTitle(e.target.value)}
                className="w-full bg-gray-50 border border-gray-200 rounded-lg p-3 text-gray-900 focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all" 
                placeholder="Ex: Nova reforma tem impacto positivo"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-800 mb-2 font-sans">
                URL (Slug) <span className="text-rose-500">*</span>
              </label>
              <input 
                type="text" 
                name="slug" 
                required 
                defaultValue={initialData?.slug}
                onChange={(e) => e.target.value = formatSlug(e.target.value)}
                className="w-full bg-gray-50 border border-gray-200 rounded-lg p-3 text-gray-600 font-mono text-sm focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all" 
                placeholder="ex: nova-reforma-impacto"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-800 mb-2 font-sans">
                Resumo (Linha Fina)
              </label>
              <textarea 
                name="resumo" 
                rows={2}
                value={currentResumo}
                onChange={(e) => setCurrentResumo(e.target.value)}
                className="w-full bg-gray-50 border border-gray-200 rounded-lg p-3 text-gray-900 focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all resize-none" 
                placeholder="Breve sumário exibido abaixo do título..."
              ></textarea>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-800 mb-2 font-sans">
                Corpo do Texto <span className="text-rose-500">*</span>
              </label>
              <RichTextEditor 
                content={currentText} 
                onChange={setCurrentText} 
              />
              <input type="hidden" name="corpoTexto" value={currentText} required />
            </div>

            <FactCheckManager initialData={initialData?.checagensFato} />
          </div>

          {viewMode === "split" ? (
             <div className="bg-slate-100 rounded-3xl p-4 overflow-x-hidden relative h-[calc(100vh-100px)] sticky top-24 border border-gray-200">
                <div className={`mx-auto transition-all duration-500 ${
                  previewDevice === "mobile" ? "max-w-[375px]" : 
                  previewDevice === "tablet" ? "max-w-[768px]" : "max-w-full"
                }`}>
                  <ArticlePreview 
                    titulo={currentTitle}
                    resumo={currentResumo}
                    corpoTexto={currentText}
                    categoria={categories.find(c => c.id === selectedCategoryId)?.nome}
                    regiao={initialData?.regiao}
                    estado={initialData?.estado}
                  />
                </div>
             </div>
          ) : (
            <div className="space-y-6">
              <SEOSidebar title={currentTitle} resumo={currentResumo} content={currentText} />
              
              <div className="bg-gray-50 p-6 rounded-xl border border-gray-200/60 shadow-sm">
                <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-5">
                  Controle de Publicação
                </h3>
                
                <div className="space-y-5">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Categoria</label>
                    <select 
                      name="categoriaId" 
                      value={selectedCategoryId}
                      onChange={(e) => setSelectedCategoryId(e.target.value)}
                      className="w-full bg-white border border-gray-200 rounded-lg shadow-sm p-3 text-gray-700 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all text-sm"
                    >
                      <option value="">Selecione uma categoria...</option>
                      {categories.map(c => (
                        <option key={c.id} value={c.id}>{c.nome}</option>
                      ))}
                    </select>
                  </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Status do Workflow</label>
                  <select 
                    name="status" 
                    value={statusInput}
                    onChange={(e) => setStatusInput(e.target.value)}
                    className="w-full bg-white border border-gray-200 rounded-lg shadow-sm p-3 text-gray-700 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all text-sm"
                  >
                    <option value="rascunho">Salvar como Rascunho</option>
                    <option value="em_revisao">Enviar para Revisão</option>
                    {canPublish && <option value="publicado">Publicar Oficialmente</option>}
                  </select>
                </div>

                {statusInput === "publicado" && canPublish && (
                  <div className="animate-in fade-in slide-in-from-top-2 duration-300">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Agendamento (Opcional)</label>
                    <input 
                      type="datetime-local" 
                      name="dataPublicacao" 
                      defaultValue={formatedDate}
                      className="w-full bg-white border border-gray-200 rounded-lg shadow-sm p-3 text-gray-700 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all text-sm"
                    />
                    <p className="text-xs text-gray-500 mt-2">Deixe em branco para publicar agora.</p>
                  </div>
                )}
              </div>
            </div>

            <div className="pt-6 border-t border-gray-200/80">
                <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-4 flex items-center gap-2 font-sans">
                  <svg className="w-4 h-4 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                  Políticos Envolvidos
                </h3>
                
                <div className="max-h-48 overflow-y-auto space-y-2 p-1">
                  {politicians.map((p) => (
                    <label key={p.id} className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded-lg cursor-pointer transition-colors group">
                      <input 
                        type="checkbox" 
                        name="politicoIds" 
                        value={p.id}
                        defaultChecked={initialData?.politicos?.some((item) => item.id === p.id)}
                        className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500 transition-all"
                      />
                      <div className="flex flex-col">
                        <span className="text-sm font-medium text-gray-700 group-hover:text-indigo-600 transition-colors">{p.nome}</span>
                        <span className="text-[10px] text-gray-400 font-medium uppercase">{p.partido || "Sem Partido"}</span>
                      </div>
                    </label>
                  ))}
                  {politicians.length === 0 && (
                    <p className="text-xs text-gray-400 italic py-2">Nenhum político cadastrado.</p>
                  )}
                </div>
              </div>

              <div className="pt-6 border-t border-gray-200/80">
                <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-4 flex items-center gap-2 font-sans">
                  <svg className="w-4 h-4 text-rose-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  Localidade da Notícia
                </h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5">Esfera / Região</label>
                    <select 
                      name="regiao" 
                      defaultValue={initialData?.regiao || "Nacional"}
                      className="w-full bg-gray-50 border border-gray-200 rounded-xl p-2.5 text-sm outline-none focus:ring-2 focus:ring-rose-500 transition-all font-medium"
                    >
                      <option value="Nacional">Nacional</option>
                      <option value="Internacional">Internacional</option>
                      <option value="Estadual">Estadual</option>
                      <option value="Municipal">Municipal</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5">Estado (Sigla)</label>
                    <input 
                      name="estado" 
                      placeholder="EX: SP"
                      maxLength={2}
                      defaultValue={initialData?.estado || ""}
                      className="w-full bg-gray-50 border border-gray-200 rounded-xl p-2.5 text-sm outline-none focus:ring-2 focus:ring-rose-500 transition-all font-medium uppercase"
                    />
                  </div>
                </div>
              </div>

              {/* CRÉDITOS E TRANSPARÊNCIA (M4-REPUBLICAÇàO) */}
              <div className="pt-6 border-t border-gray-200/80">
                <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-4 flex items-center gap-2 font-sans">
                  <BookOpen className="w-4 h-4 text-emerald-600" />
                  Transparência e Fonte (Republicação)
                </h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5 flex items-center gap-1">
                      <Globe className="w-3 h-3" /> Portal/Autor Original
                    </label>
                    <input 
                      name="autorExterno" 
                      placeholder="Ex: CNN Brasil, G1, Folha"
                      value={externalAuthor}
                      onChange={(e) => setExternalAuthor(e.target.value)}
                      className="w-full bg-gray-50 border border-gray-200 rounded-xl p-2.5 text-sm outline-none focus:ring-2 focus:ring-emerald-500 transition-all font-medium"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5 flex items-center gap-1">
                      <LinkIcon className="w-3 h-3" /> Link da Fonte Original
                    </label>
                    <input 
                      name="urlFonte" 
                      placeholder="URL completa para crédito"
                      value={sourceUrl}
                      onChange={(e) => setSourceUrl(e.target.value)}
                      className="w-full bg-gray-50 border border-gray-200 rounded-xl p-2.5 text-sm outline-none focus:ring-2 focus:ring-emerald-500 transition-all font-mono text-xs"
                    />
                  </div>
                </div>
              </div>

              <div className="pt-6 border-t border-gray-200/80">
                <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-4 flex items-center gap-2 font-sans">
                  <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                  </svg>
                  Canais de Distribuição
                </h3>
                
                <div className="space-y-3">
                  {[
                    { id: "portal", label: "Portal Revista Gestão", icon: "🌐" },
                    { id: "newsletter", label: "Newsletter Matinal", icon: "📧" },
                    { id: "redes_sociais", label: "Redes Sociais (Social Post)", icon: "📱" }
                  ].map((channel) => (
                    <label key={channel.id} className="flex items-center gap-3 p-3 hover:bg-gray-50 rounded-xl cursor-pointer border border-transparent hover:border-gray-200 transition-all group">
                      <input 
                        type="checkbox" 
                        name="canaisPublicacao" 
                        value={channel.id}
                        defaultChecked={initialData?.canaisPublicacao?.includes(channel.id) || (!initialData && channel.id === "portal")}
                        className="w-5 h-5 text-indigo-600 border-gray-300 rounded-lg focus:ring-indigo-500 transition-all"
                      />
                      <div className="flex flex-col">
                        <span className="text-sm font-bold text-gray-700 group-hover:text-indigo-600 transition-colors">
                          {channel.icon} {channel.label}
                        </span>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              <div className="pt-6 border-t border-gray-200/80">
                <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-4 flex items-center gap-2">
                  <svg className="w-4 h-4 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                  Revisão Jurídica
                </h3>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1.5 font-sans">Status Legal</label>
                    <select 
                      name="statusLegal" 
                      defaultValue={initialData?.statusLegal || "pendente"}
                      disabled={userRole === "reporter"}
                      className="w-full bg-white border border-gray-200 rounded-lg shadow-sm p-3 text-gray-700 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all text-sm disabled:bg-gray-50 disabled:cursor-not-allowed"
                    >
                      <option value="pendente">Pendente</option>
                      <option value="em_analise">Em Análise</option>
                      <option value="aprovado">Aprovado para Publicação</option>
                      <option value="ajustes">Requer Ajustes</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1.5 font-sans">Notas Jurídicas</label>
                    <textarea 
                      name="observacoesLegais" 
                      rows={3}
                      defaultValue={initialData?.observacoesLegais || ""}
                      readOnly={userRole === "reporter"}
                      className="w-full bg-white border border-gray-200 rounded-lg shadow-sm p-3 text-gray-700 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all text-sm resize-none disabled:bg-gray-50 placeholder:italic"
                      placeholder="Observações do departamento jurídico..."
                    ></textarea>
                  </div>
                </div>
              </div>

              <div className="mt-8 pt-6 border-t border-gray-200/80">
                <button 
                  type="submit" 
                  disabled={isPending}
                  className="group w-full bg-indigo-600 text-white font-semibold flex justify-center items-center px-6 py-3.5 rounded-xl border border-transparent shadow-[0_4px_14px_0_rgb(79,70,229,0.39)] hover:shadow-[0_6px_20px_rgba(79,70,229,0.23)] hover:-trangray-y-0.5 hover:bg-indigo-500 active:scale-[0.98] disabled:opacity-70 disabled:hover:-trangray-y-0 disabled:active:scale-100 disabled:cursor-not-allowed transition-all duration-200 outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  {isPending ? (
                    <span className="flex items-center gap-2">
                      <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Processando...
                    </span>
                  ) : (initialData?.id ? "Atualizar Matéria" : "Salvar Matéria")}
                </button>
              </div>
            </div>
          )}
        </div>
      </form>

      {/* Modo Preview Full Screen */}
      {viewMode === "preview" && (
        <div className="fixed inset-0 z-[60] bg-slate-100 overflow-y-auto p-4 md:p-8 animate-in fade-in duration-300">
          <div className="flex justify-center mb-8">
            <div className="bg-white p-2 rounded-2xl shadow-xl border border-gray-200 flex items-center gap-4">
              <div className="flex bg-gray-100 p-1 rounded-xl">
                <button onClick={() => setViewMode("split")} className="p-2 text-gray-500 hover:text-blue-600 transition-all font-bold text-xs flex items-center gap-2">
                  <ArrowLeftRight size={14} /> Voltar ao Editor
                </button>
              </div>
              <div className="w-px h-6 bg-gray-200" />
              <div className="flex bg-gray-100 p-1 rounded-xl">
                <button onClick={() => setPreviewDevice("mobile")} className={`p-2 rounded-lg transition-all ${previewDevice === "mobile" ? "bg-white text-blue-600 shadow-sm" : "text-gray-500"}`}><Smartphone size={16} /></button>
                <button onClick={() => setPreviewDevice("tablet")} className={`p-2 rounded-lg transition-all ${previewDevice === "tablet" ? "bg-white text-blue-600 shadow-sm" : "text-gray-500"}`}><Tablet size={16} /></button>
                <button onClick={() => setPreviewDevice("desktop")} className={`p-2 rounded-lg transition-all ${previewDevice === "desktop" ? "bg-white text-blue-600 shadow-sm" : "text-gray-500"}`}><Monitor size={16} /></button>
              </div>
              <button 
                onClick={() => setViewMode("edit")}
                className="bg-blue-600 text-white px-4 py-2 rounded-xl text-xs font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-500/30"
              >
                Concluir Visualização
              </button>
            </div>
          </div>

          <div className={`mx-auto transition-all duration-500 pb-20 ${
            previewDevice === "mobile" ? "max-w-[375px]" : 
            previewDevice === "tablet" ? "max-w-[768px]" : "max-w-7xl"
          }`}>
            <ArticlePreview 
              titulo={currentTitle}
              resumo={currentResumo}
              corpoTexto={currentText}
              categoria={categories.find(c => c.id === selectedCategoryId)?.nome}
              regiao={initialData?.regiao}
              estado={initialData?.estado}
            />
          </div>
        </div>
      )}

      {initialData?.id && viewMode === "edit" && (
        <ArticleHistory artigoId={initialData.id} currentContent={currentText} />
      )}
    </div>
  );
}

