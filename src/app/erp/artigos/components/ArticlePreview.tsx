"use client";

import React from "react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { User, Calendar, Tag, Share2, Printer, Bookmark } from "lucide-react";

interface ArticlePreviewProps {
  titulo: string;
  resumo?: string | null;
  corpo_texto: string;
  categoria?: string;
  autor?: string;
  data?: Date | null;
  regiao?: string | null;
  estado?: string | null;
}

export function ArticlePreview({
  titulo,
  resumo,
  corpo_texto,
  categoria,
  autor = "Equipe Revista Gestão",
  data,
  regiao,
  estado,
}: ArticlePreviewProps) {
  const publishedDate = data || new Date();

  return (
    <div className="bg-white rounded-3xl overflow-hidden border border-gray-100 shadow-2xl max-w-4xl mx-auto my-4 transition-all duration-500 animate-in fade-in zoom-in-95">
      {/* Barra de Simulação do Browser/Portal */}
      <div className="bg-gray-50 border-b border-gray-100 px-6 py-3 flex items-center justify-between">
        <div className="flex gap-1.5">
          <div className="w-3 h-3 rounded-full bg-rose-400" />
          <div className="w-3 h-3 rounded-full bg-amber-400" />
          <div className="w-3 h-3 rounded-full bg-emerald-400" />
        </div>
        <div className="bg-gray-200/50 px-4 py-1 rounded-full text-[10px] font-mono text-gray-400 select-none">
          revistagestao.com.br/noticia/preview
        </div>
        <div />
      </div>

      <div className="p-8 md:p-12 lg:p-16 space-y-8 min-h-[800px] news-body">
        {/* Breadcrumb e Categoria */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="bg-blue-600 text-white text-[10px] font-bold uppercase tracking-[0.2em] px-3 py-1 rounded-full shadow-lg shadow-blue-500/20">
              {categoria || "Geral"}
            </span>
            {regiao && (
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest flex items-center gap-1">
                <span className="w-1 h-1 rounded-full bg-gray-300" />
                {regiao} {estado ? `(${estado})` : ""}
              </span>
            )}
          </div>
          <div className="flex items-center gap-3 text-gray-400">
            <Share2 className="w-4 h-4 cursor-pointer hover:text-blue-500 transition-colors" />
            <Bookmark className="w-4 h-4 cursor-pointer hover:text-blue-500 transition-colors" />
            <Printer className="w-4 h-4 cursor-pointer hover:text-blue-500 transition-colors" />
          </div>
        </div>

        {/* Headline Section */}
        <header className="space-y-6">
          <h1 className="news-title text-4xl md:text-5xl lg:text-6xl text-slate-900 leading-[1.1] selection:bg-blue-100 selection:text-blue-900">
            {titulo || "Título da Notícia"}
          </h1>
          
          {resumo && (
            <p className="text-xl md:text-2xl text-slate-500 font-light leading-relaxed border-l-4 border-blue-500 pl-6 italic selection:bg-blue-50">
              {resumo}
            </p>
          )}

          <div className="flex flex-wrap items-center gap-6 pt-4 border-y border-gray-100 py-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white shadow-lg">
                <User size={20} />
              </div>
              <div className="flex flex-col">
                <span className="text-sm font-bold text-slate-900">{autor}</span>
                <span className="text-[10px] text-gray-400 font-medium uppercase">Repórter Político</span>
              </div>
            </div>
            
            <div className="h-8 w-px bg-gray-100" />

            <div className="flex items-center gap-2 text-gray-500">
              <Calendar size={16} />
              <span className="text-xs font-medium">
                {format(publishedDate, "dd 'de' MMMM 'de' yyyy 'às' HH:mm", { locale: ptBR })}
              </span>
            </div>
          </div>
        </header>

        {/* Article Body */}
        <article 
          className="news-prose prose prose-lg prose-slate max-w-none 
            prose-p:leading-[1.8] prose-p:mb-6
            prose-headings:font-serif prose-headings:font-bold prose-headings:text-slate-900
            prose-img:rounded-3xl prose-img:shadow-2xl prose-img:mx-auto prose-img:block
            prose-blockquote:border-l-blue-600 prose-blockquote:bg-blue-50/50 prose-blockquote:p-8 prose-blockquote:rounded-r-3xl
            prose-a:text-blue-600 prose-a:font-bold prose-a:no-underline hover:prose-a:underline
            selection:bg-indigo-100 selection:text-indigo-900"
          dangerouslySetInnerHTML={{ __html: corpo_texto || "<p className='text-gray-300 italic'>O conteúdo da notícia aparecerá aqui...</p>" }}
        />

        {/* Footer/Tags */}
        <footer className="pt-12 mt-12 border-t border-gray-100">
          <div className="flex flex-wrap gap-2">
            <span className="text-xs font-bold text-gray-400 uppercase tracking-widest mr-2 flex items-center gap-2">
              <Tag size={14} /> Tags:
            </span>
            {["Política", "Gestão", "Brasília", "Economia"].map(tag => (
              <span key={tag} className="bg-gray-100 text-gray-600 text-[10px] font-bold px-3 py-1 rounded-full hover:bg-blue-600 hover:text-white transition-all cursor-pointer">
                #{tag}
              </span>
            ))}
          </div>
        </footer>
      </div>

      {/* Marca D'água de Preview */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none opacity-[0.03] rotate-[-25deg]">
        <span className="text-9xl font-black uppercase tracking-[0.5em] whitespace-nowrap">
          PREVIEW PORTAL
        </span>
      </div>
    </div>
  );
}
