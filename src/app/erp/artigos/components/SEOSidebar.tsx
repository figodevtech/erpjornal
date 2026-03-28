"use client";

import React, { useState, useEffect } from "react";
import { Search, Info, TrendingUp, AlertCircle, CheckCircle2, XCircle, Tag, Sparkles } from "lucide-react";

interface SEOSidebarProps {
  title: string;
  resumo: string;
  content: string;
}

interface SEOStats {
  score: number;
  checks: {
    label: string;
    status: "success" | "warning" | "error";
  }[];
}

export function SEOSidebar({ title, resumo, content }: SEOSidebarProps) {
  const [stats, setStats] = useState<SEOStats>({
    score: 0,
    checks: []
  });

  const analyzeContent = () => {
    const checks: SEOStats["checks"] = [];
    let score = 0;

    // Título
    if (title.length > 30 && title.length < 60) {
      score += 25;
      checks.push({ label: "Título com tamanho ideal (30-60 chars)", status: "success" });
    } else {
      checks.push({ label: "Título muito curto ou longo", status: "warning" });
    }

    // Resumo/Lead
    if (resumo && resumo.length > 50) {
      score += 25;
      checks.push({ label: "Resumo/Lead presente", status: "success" });
    } else {
      checks.push({ label: "Adicione um resumo impactante", status: "error" });
    }

    // Conteúdo
    const wordCount = content.replace(/<[^>]*>/g, "").split(/\s+/).length;
    if (wordCount > 300) {
      score += 25;
      checks.push({ label: `Conteúdo rico (${wordCount} palavras)`, status: "success" });
    } else {
      checks.push({ label: "Texto muito curto para SEO", status: "warning" });
    }

    // Formatação (H2/H3)
    const h2Count = (content.match(/<h2/g) || []).length;
    if (h2Count > 0) {
      score += 25;
      checks.push({ label: "Uso de subtítulos (H2)", status: "success" });
    } else {
      checks.push({ label: "Considere usar subtítulos", status: "warning" });
    }

    setStats({ score, checks });
  };

  useEffect(() => {
    analyzeContent();
  }, [title, resumo, content]);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "success": return <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-sm shadow-emerald-500/50" />;
      case "warning": return <div className="w-2 h-2 rounded-full bg-amber-500 shadow-sm shadow-amber-500/50" />;
      case "error": return <div className="w-2 h-2 rounded-full bg-rose-500 shadow-sm shadow-rose-500/50" />;
      default: return <div className="w-2 h-2 rounded-full bg-gray-300" />;
    }
  };

  return (
    <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm hover:shadow-md transition-all">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-blue-50 text-blue-600 rounded-xl">
          <Search size={20} />
        </div>
        <div>
          <h3 className="text-sm font-bold text-slate-800">Análise de SEO</h3>
          <p className="text-[10px] text-gray-400 font-medium uppercase tracking-wider">Métrica de Engajamento</p>
        </div>
      </div>

      <div className="space-y-6">
        {/* Score Ring */}
        <div className="flex items-center justify-center py-4">
          <div className="relative flex items-center justify-center">
            <svg className="w-24 h-24 transform -rotate-90">
              <circle
                cx="48"
                cy="48"
                r="40"
                stroke="currentColor"
                strokeWidth="8"
                fill="transparent"
                className="text-gray-100"
              />
              <circle
                cx="48"
                cy="48"
                r="40"
                stroke="currentColor"
                strokeWidth="8"
                fill="transparent"
                strokeDasharray={251.2}
                strokeDashoffset={251.2 - (251.2 * stats.score) / 100}
                className="text-blue-600 transition-all duration-1000 ease-out"
                strokeLinecap="round"
              />
            </svg>
            <div className="absolute flex flex-col items-center">
              <span className="text-2xl font-black text-slate-800">{stats.score}</span>
              <span className="text-[8px] font-bold text-gray-400 uppercase">Pontos</span>
            </div>
          </div>
        </div>

        <div className="space-y-2">
          {stats.checks.map((check, index) => (
            <div key={index} className="flex items-center gap-3 p-3 bg-gray-50/50 border border-gray-100 rounded-xl hover:bg-white hover:shadow-sm transition-all group">
              {getStatusIcon(check.status)}
              <span className="text-[11px] font-medium text-gray-600 group-hover:text-slate-800">{check.label}</span>
            </div>
          ))}
        </div>

        <div className="pt-4 border-t border-gray-100">
          <p className="text-[10px] text-gray-400 leading-relaxed italic">
            &quot;Um bom SEO aumenta em até 300% a chance de indexação pelo Google News.&quot;
          </p>
          <div className="mt-4 p-3 bg-blue-50/50 border border-blue-100 rounded-xl">
            <p className="text-[10px] text-blue-700 font-medium">
              💡 Dica: Use palavras-chave como &quot;Brasília&quot;, &quot;Relatório&quot; ou nomes de políticos no título.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
