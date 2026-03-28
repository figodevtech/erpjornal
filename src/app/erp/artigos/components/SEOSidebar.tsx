"use client";

import { useEffect, useState } from "react";
import { CheckCircle2, AlertCircle, XCircle, Search, Info } from "lucide-react";

interface SEOStats {
  score: number;
  checks: {
    label: string;
    status: "pass" | "warn" | "fail";
    detail: string;
  }[];
}

interface SEOSidebarProps {
  title: string;
  resumo: string;
  content: string;
}

export function SEOSidebar({ title, resumo, content }: SEOSidebarProps) {
  const [stats, setStats] = useState<SEOStats>({ score: 0, checks: [] });

  useEffect(() => {
    analyzeContent();
  }, [title, resumo, content]);

  const analyzeContent = () => {
    const checks: SEOStats["checks"] = [];
    let score = 0;

    // 1. Título
    if (title.length >= 40 && title.length <= 70) {
      checks.push({ label: "Tamanho do Título", status: "pass", detail: `${title.length} chars (Ideal)` });
      score += 20;
    } else if (title.length > 0) {
      checks.push({ label: "Tamanho do Título", status: "warn", detail: `${title.length} chars (40-70 ideal)` });
      score += 10;
    } else {
      checks.push({ label: "Tamanho do Título", status: "fail", detail: "Obrigatório" });
    }

    // 2. Resumo (Meta Description)
    const resLen = resumo.length;
    if (resLen >= 120 && resLen <= 160) {
      checks.push({ label: "Linha Fina (Meta)", status: "pass", detail: `${resLen} chars (Ideal)` });
      score += 20;
    } else if (resLen > 0) {
      checks.push({ label: "Linha Fina (Meta)", status: "warn", detail: `${resLen} chars (120-160 ideal)` });
      score += 10;
    } else {
      checks.push({ label: "Linha Fina (Meta)", status: "fail", detail: "Altamente recomendado" });
    }

    // 3. Extensão do Conteúdo
    // Strip HTML to count words correctly
    const plainText = content.replace(/<[^>]*>/g, " ");
    const words = plainText.trim().split(/\s+/).filter(w => w.length > 0).length;

    if (words >= 300) {
      checks.push({ label: "Extensão do Texto", status: "pass", detail: `${words} palavras (Ótimo)` });
      score += 20;
    } else if (words >= 100) {
      checks.push({ label: "Extensão do Texto", status: "warn", detail: `${words} palavras (Muito curto)` });
      score += 10;
    } else {
      checks.push({ label: "Extensão do Texto", status: "fail", detail: `${words} palavras (Crítico)` });
    }

    // 4. Estrutura de Headings (H2/H3)
    const h2Count = (content.match(/<h2/g) || []).length;
    const h3Count = (content.match(/<h3/g) || []).length;
    if (h2Count >= 1) {
      checks.push({ label: "Hierarquia (H2)", status: "pass", detail: `${h2Count} subtítulos encontrados` });
      score += 20;
    } else {
      checks.push({ label: "Hierarquia (H2)", status: "warn", detail: "Use H2 para melhor SEO" });
    }

    // 5. Mídia/Imagens
    const imgCount = (content.match(/<img/g) || []).length;
    if (imgCount >= 1) {
      checks.push({ label: "Conteúdo Rico", status: "pass", detail: `${imgCount} imagens no corpo` });
      score += 20;
    } else {
      checks.push({ label: "Conteúdo Rico", status: "warn", detail: "Sem imagens no corpo" });
    }

    setStats({ score, checks });
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "pass": return <CheckCircle2 className="w-4 h-4 text-emerald-500" />;
      case "warn": return <AlertCircle className="w-4 h-4 text-amber-500" />;
      case "fail": return <XCircle className="w-4 h-4 text-rose-500" />;
      default: return null;
    }
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm animate-in fade-in slide-in-from-right-4 duration-500">
      <div className="p-4 bg-gray-900 text-white flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Search className="w-4 h-4 text-red-500" />
          <h3 className="text-sm font-black uppercase tracking-widest">Análise de SEO</h3>
        </div>
        <div className={`text-xs font-black px-2 py-1 rounded ${stats.score >= 80 ? 'bg-emerald-500' : stats.score >= 50 ? 'bg-amber-500' : 'bg-rose-500'}`}>
          {stats.score}/100
        </div>
      </div>

      <div className="p-4 space-y-4">
        {stats.checks.map((check, i) => (
          <div key={i} className="flex items-start gap-3 group">
            <div className="mt-0.5 shrink-0">
              {getStatusIcon(check.status)}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-bold text-gray-800 leading-tight">{check.label}</p>
              <p className="text-[10px] text-gray-500 truncate">{check.detail}</p>
            </div>
          </div>
        ))}

        <div className="mt-6 pt-4 border-t border-gray-100">
          <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3 flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-indigo-500" /> Sugestões Adicionais
          </h4>
          <ul className="space-y-2">
            <li className="text-[11px] text-gray-600 bg-gray-50 p-2 rounded border border-gray-100 leading-relaxed italic">
              "Tente incluir a palavra-chave principal nos primeiros 10% do texto."
            </li>
            <li className="text-[11px] text-gray-600 bg-gray-50 p-2 rounded border border-gray-100 leading-relaxed italic">
                "Adicione links internos para outros artigos relacionados."
            </li>
          </ul>
        </div>

        <div className="mt-4 p-3 bg-indigo-50 rounded-lg flex gap-3 items-start">
            <Info className="w-4 h-4 text-indigo-500 shrink-0" />
            <p className="text-[10px] text-indigo-700 leading-snug">
                Esta análise é baseada em tempo real sobre o conteúdo bruto e estrutural do seu artigo.
            </p>
        </div>
      </div>
    </div>
  );
}

// Re-export Sparkles for the Sidebar
import { Sparkles } from "lucide-react";
