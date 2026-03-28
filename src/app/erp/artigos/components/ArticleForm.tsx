"use client";

import { useTransition, useState } from "react";
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
  corpo_texto: string;
  categoria_id: string | null;
  status_id: string;
  legal_notes: string | null;
  legal_status: string;
  data_publicacao: Date | null;
  fact_checks?: { id: string, fonte_url: string, documento_url: string, status_verificacao: string }[];
  politicos?: { id: string }[];
  regiao: string | null;
  estado: string | null;
  autor_id?: string;
  publish_channels?: string[];
  source_url?: string | null;
  external_author?: string | null;
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
import { scrapeNews } from "../import-actions";
import { Globe, BookOpen, Link as LinkIcon, Sparkles } from "lucide-react";
import { toast as sonnerToast } from "sonner";
import RichTextEditor from "@/components/ui/RichTextEditor";
import { SEOSidebar } from "./SEOSidebar";

export default function ArticleForm({ categories, politicians, userRole, initialData }: ArticleFormProps) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState("");
  // Inicia com o status do banco, ou "rascunho"
  const [statusInput, setStatusInput] = useState(initialData?.status_id || "rascunho");
  const [currentText, setCurrentText] = useState(initialData?.corpo_texto || "");
  const [currentTitle, setCurrentTitle] = useState(initialData?.titulo || "");
  const [currentResumo, setCurrentResumo] = useState(initialData?.resumo || "");
  const [importUrl, setImportUrl] = useState("");
  const [isImporting, setIsImporting] = useState(false);
  const [sourceUrl, setSourceUrl] = useState(initialData?.source_url || "");
  const [externalAuthor, setExternalAuthor] = useState(initialData?.external_author || "");

  const formatSlug = (val: string) => {
    return val.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
  };

  const formatedDate = initialData?.data_publicacao 
    ? new Date(initialData.data_publicacao.getTime() - initialData.data_publicacao.getTimezoneOffset() * 60000).toISOString().slice(0, 16)
    : "";

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
      <form action={handleAction} className="bg-white p-6 md:p-8 rounded-2xl shadow-sm border border-gray-200">
        {/* Campo Oculto para UPDATE Dinâmico Controlado por React API Routes */}
        {initialData?.id && <input type="hidden" name="id" value={initialData.id} />}

        {error && (
          <div className="mb-6 p-4 bg-rose-50 text-rose-800 border-l-4 border-rose-500 rounded-r-lg text-sm font-medium">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 pt-4">
          <div className="lg:col-span-2 space-y-6">
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
              <input type="hidden" name="corpo_texto" value={currentText} required />
            </div>

            <FactCheckManager initialData={initialData?.fact_checks} />
          </div>

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
                    name="categoria_id" 
                    defaultValue={initialData?.categoria_id || ""}
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
                    name="status_id" 
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
                      name="data_publicacao" 
                      defaultValue={formatedDate}
                      className="w-full bg-white border border-gray-200 rounded-lg shadow-sm p-3 text-gray-700 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all text-sm"
                    />
                    <p className="text-xs text-gray-500 mt-2">Deixe em branco para publicar agora.</p>
                  </div>
                )}
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
                        name="politico_ids" 
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

              {/* CRÉDITOS E TRANSPARÊNCIA (M4-REPUBLICAÇÃO) */}
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
                      name="external_author" 
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
                      name="source_url" 
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
                        name="publish_channels" 
                        value={channel.id}
                        defaultChecked={initialData?.publish_channels?.includes(channel.id) || (!initialData && channel.id === "portal")}
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
                      name="legal_status" 
                      defaultValue={initialData?.legal_status || "pendente"}
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
                      name="legal_notes" 
                      rows={3}
                      defaultValue={initialData?.legal_notes || ""}
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
          </div>
        </div>
      </form>

      {initialData?.id && (
        <ArticleHistory articleId={initialData.id} currentContent={currentText} />
      )}
    </div>
  );
}

