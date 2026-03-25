"use client";

import { useState, useEffect } from "react";
import { getArticleVersions } from "../actions";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { History, ChevronDown, ChevronUp, FileDiff, X } from "lucide-react";
import * as diff from "diff";

interface Version {
  id: string;
  titulo: string;
  resumo: string | null;
  corpo_texto: string;
  status_id: string;
  mudancas_resumo: string | null;
  created_at: string; // From JSON.stringify
}

export function ArticleHistory({ articleId, currentContent }: { articleId: string, currentContent: string }) {
  const [versions, setVersions] = useState<Version[]>([]);
  const [loading, setLoading] = useState(true);
  const [isOpen, setIsOpen] = useState(false);
  const [selectedVersionId, setSelectedVersionId] = useState<string | null>(null);

  useEffect(() => {
    async function loadVersions() {
      try {
        setLoading(true);
        const data = await getArticleVersions(articleId);
        setVersions(data);
      } catch (error) {
        console.error("Erro ao carregar histórico:", error);
      } finally {
        setLoading(false);
      }
    }

    if (isOpen && versions.length === 0) {
      loadVersions();
    }
  }, [isOpen, versions.length, articleId]);

  const selectedVersion = versions.find(v => v.id === selectedVersionId);

  const renderDiff = (oldText: string, newText: string) => {
    const changes = diff.diffWords(oldText, newText);
    
    return (
      <div className="bg-white p-4 rounded border border-slate-200 font-sans text-sm leading-relaxed whitespace-pre-wrap">
        {changes.map((part, index) => (
          <span
            key={index}
            className={`${
              part.added ? "bg-emerald-100 text-emerald-800" :
              part.removed ? "bg-red-100 text-red-800 line-through" :
              "text-slate-700"
            }`}
          >
            {part.value}
          </span>
        ))}
      </div>
    );
  };

  return (
    <div className="mt-8 border-t border-slate-200 pt-8">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 text-slate-600 hover:text-[#002045] font-semibold transition-colors"
      >
        <History className="w-5 h-5" />
        Histórico de Versões
        {isOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
      </button>

      {isOpen && (
        <div className="mt-4 bg-slate-50 rounded-xl p-4 border border-slate-100 animate-in fade-in slide-in-from-top-2">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#002045]"></div>
            </div>
          ) : versions.length === 0 ? (
            <p className="text-center py-8 text-slate-400 italic">Nenhuma versão anterior encontrada.</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="md:col-span-1 space-y-2 max-h-[400px] overflow-y-auto pr-2">
                {versions.map((version) => (
                  <button
                    key={version.id}
                    onClick={() => setSelectedVersionId(version.id)}
                    className={`w-full text-left p-3 rounded-lg border transition-all ${
                      selectedVersionId === version.id
                        ? "bg-white border-[#002045] shadow-sm ring-1 ring-[#002045]"
                        : "bg-white/50 border-slate-200 hover:border-slate-300"
                    }`}
                  >
                    <div className="flex flex-col gap-1">
                      <span className="text-[10px] uppercase font-bold tracking-widest text-[#002045]">
                        {format(new Date(version.created_at), "dd/MM/yyyy HH:mm", { locale: ptBR })}
                      </span>
                      <span className="text-xs font-medium text-slate-600 truncate">
                        {version.mudancas_resumo || "Alteração genérica"}
                      </span>
                      <span className={`text-[9px] w-fit px-1.5 py-0.5 rounded font-bold uppercase ${
                        version.status_id === 'publicado' ? 'bg-emerald-50 text-emerald-600' : 'bg-blue-50 text-blue-600'
                      }`}>
                        {version.status_id}
                      </span>
                    </div>
                  </button>
                ))}
              </div>

              <div className="md:col-span-2 bg-white rounded-lg border border-slate-200 p-6 flex flex-col gap-4">
                {selectedVersion ? (
                  <>
                    <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                      <h4 className="font-serif font-bold text-lg text-slate-900 flex items-center gap-2">
                        <FileDiff className="w-5 h-5 text-indigo-500" />
                        Comparativo de Texto
                      </h4>
                      <button 
                        onClick={() => setSelectedVersionId(null)}
                        className="p-1 hover:bg-slate-100 rounded-full"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                    
                    <div className="space-y-4">
                      <p className="text-xs text-slate-400 font-medium uppercase tracking-wider">
                        Mudanças detectadas (Vs Atual):
                      </p>
                      {renderDiff(selectedVersion.corpo_texto, currentContent)}
                    </div>
                  </>
                ) : (
                  <div className="h-full flex flex-col items-center justify-center text-slate-400 py-12">
                    <History className="w-12 h-12 mb-4 opacity-20" />
                    <p className="text-sm">Selecione uma versão à esquerda para comparar com o rascunho atual.</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
