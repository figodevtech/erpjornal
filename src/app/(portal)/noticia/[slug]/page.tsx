import { prisma } from "@/lib/prisma";
import { ArticleStatus } from "@/lib/types/article-status";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Metadata } from "next";
import Image from "next/image";
import { obterSessao } from "@/lib/auth";

import { Lock, Crown } from "lucide-react";
import NewsletterForm from "@/components/portal/NewsletterForm";
import TTSPlayer from "@/components/portal/TTSPlayer";
import { ViewCounter } from "@/components/portal/ViewCounter";
import { getArticleViews } from "@/app/actions/analytics";
import { sanitizeHtmlForRender } from "@/lib/tts-utils";

export const revalidate = 300;

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const artigo = await prisma.artigo.findUnique({
    where: { slug }
  });

  if (!artigo) return { title: "Artigo não encontrado" };

  return {
    title: `${artigo.titulo} | Revista Gestão`,
    description: artigo.resumo || "Leia esta matéria na Revista Gestão.",
    openGraph: {
      title: artigo.titulo,
      description: artigo.resumo || "",
      type: "article",
      publishedTime: artigo.dataPublicacao?.toISOString(),
      url: `https://revistagestao.com.br/noticia/${artigo.slug}`,
    }
  };
}

export default async function NoticiaPage({ params }: PageProps) {
  const { slug } = await params;
  const session = await obterSessao();

  // Busca o artigo
  const artigo = await prisma.artigo.findFirst({
    where: {
      slug,
      status: ArticleStatus.publicado,
    },
    include: {
      autor: true,
      categoria: true,
    }
  });

  if (!artigo) {
    notFound();
  }

  // Busca visualizações em tempo real (Redis)
  const realTimeViews = await getArticleViews(artigo.id);
  const corpoTextoSanitizado = sanitizeHtmlForRender(artigo.corpoTexto);

  const isPremium = artigo.ehPremium;
  const isAuthed = !!session;
  const canAccess = !isPremium || isAuthed;

  return (
    <div className="w-full bg-background pb-20 overflow-x-hidden transition-colors duration-300">
      
      {/* Top Banner Category Header */}
      {artigo.categoria && (
        <div className="w-full bg-gray-100 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 py-3 hidden md:block transition-colors">
          <div className="max-w-[1000px] mx-auto px-4 sm:px-6 lg:px-8">
             <Link 
               href={`/categoria/${artigo.categoria.slug}`}
               className="text-[14px] font-black uppercase tracking-widest text-red-700 hover:text-red-950 transition-colors"
             >
               {artigo.categoria.nome}
             </Link>
          </div>
        </div>
      )}

      <article className="max-w-[1000px] mx-auto px-4 sm:px-6 lg:px-8 pt-8 md:pt-14 font-serif">
        
        {/* Cabeçalho do Artigo */}
        <header className="mb-10 lg:mb-12 font-sans">
          
          <div className="flex items-center gap-3 mb-4">
             {artigo.categoria && (
               <Link 
                 href={`/categoria/${artigo.categoria.slug}`}
                 className="text-[12px] font-black uppercase tracking-widest text-red-700"
               >
                 {artigo.categoria.nome}
               </Link>
             )}
             {isPremium && (
               <span className="bg-gray-900 text-white text-[10px] font-black uppercase tracking-[0.2em] px-2 py-0.5 rounded-sm flex items-center gap-1">
                 <Crown className="w-3 h-3 text-red-700 fill-red-700" />
                 Exclusivo
               </span>
             )}
          </div>

          <h1 className="article-headline text-4xl md:text-5xl lg:text-6xl font-black leading-[1.05] tracking-tight mb-6">
            {artigo.titulo}
          </h1>

          {artigo.resumo && (
            <p
              className="article-summary text-[20px] md:text-[24px] font-semibold leading-[1.3] mb-8 font-sans"
              style={{ color: "#000000" }}
            >
              {artigo.resumo}
            </p>
          )}

          {/* Dados d Autor */}
          <div className="flex flex-col sm:flex-row sm:items-center py-4 border-y-2 border-gray-900/30 justify-between gap-4">
            <div className="flex items-center gap-4">
              <div>
                <p className="article-meta text-[15px] font-bold uppercase tracking-widest">
                  Por <span className="text-red-700">{artigo.autor?.nome || "Redação"}</span>
                </p>
                <time className="article-meta text-[13px] font-black uppercase tracking-widest flex items-center gap-2 mt-1">
                  {artigo.dataPublicacao?.toLocaleDateString("pt-BR", { 
                    day: "2-digit", month: "long", year: "numeric"
                  })} à s {artigo.dataPublicacao?.toLocaleTimeString("pt-BR", { 
                    hour: "2-digit", minute: "2-digit"
                  })}
                </time>
                {artigo.autorExterno && (
                  <p
                    className="mt-2 flex items-center gap-2 text-[13px] font-bold uppercase tracking-tight text-black dark:text-gray-100"
                    style={{ color: "#000000" }}
                  >
                    <span
                      className="rounded bg-gray-200 px-2 py-0.5 text-[11px] text-black dark:bg-gray-900 dark:text-gray-100"
                      style={{ color: "#000000", backgroundColor: "#e5e7eb" }}
                    >
                      Fonte Original:
                    </span>
                    <span className="font-black text-black dark:text-white" style={{ color: "#000000" }}>
                      {artigo.autorExterno}
                    </span>
                    {artigo.urlFonte && (
                      <a 
                        href={artigo.urlFonte} 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        className="font-black text-red-700 underline decoration-dotted underline-offset-4 hover:text-red-950"
                      >
                        Ver Original
                      </a>
                    )}
                  </p>
                )}
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <span className="text-[12px] font-black uppercase tracking-widest text-gray-800 dark:text-gray-400 flex items-center gap-1.5" title="Visualizações em tempo real via Redis">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                Lido {realTimeViews} vezes
              </span>
            </div>
          </div>
        </header>

        {/* TTS Player (M1-PLUS-T1-ST2) */}
        {canAccess && (
          <div className="max-w-[760px] mx-auto font-sans">
            <TTSPlayer htmlContent={corpoTextoSanitizado} title={artigo.titulo} />
          </div>
        )}

        {/* Hero Image */}
        <figure className="w-full aspect-video md:aspect-[21/9] bg-gray-100 dark:bg-gray-900 mb-12 relative border border-gray-300 dark:border-gray-800 overflow-hidden group transition-all">
          {artigo.urlImagemOg ? (
            <Image 
              src={artigo.urlImagemOg} 
              alt={artigo.titulo}
              fill
              sizes="(max-width: 768px) 100vw, 1000px"
              className="object-cover group-hover:scale-105 transition-transform duration-1000"
              priority
            />
          ) : (
            <div className="absolute inset-0 bg-gray-100/50 dark:bg-gray-900/50 flex items-center justify-center text-gray-400 dark:text-gray-700">
               <svg className="w-16 h-16 transform group-hover:scale-110 transition-transform duration-500" fill="currentColor" viewBox="0 0 24 24"><path d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
            </div>
          )}
        </figure>

        {/* Corpo do Texto */}
        <div className={`
          article-prose
          w-full max-w-[760px] mx-auto 
          prose prose-gray dark:prose-invert prose-lg md:prose-xl max-w-none
          prose-p:text-gray-950 dark:prose-p:text-gray-100 prose-p:leading-[1.8] prose-p:mb-7
          prose-li:text-gray-950 dark:prose-li:text-gray-100
          prose-strong:text-gray-950 dark:prose-strong:text-gray-50
          prose-em:text-gray-900 dark:prose-em:text-gray-100
          prose-h2:text-gray-950 dark:prose-h2:text-gray-100 prose-h2:font-black prose-h2:mt-12 prose-h2:mb-6
          prose-blockquote:border-red-700 prose-blockquote:italic prose-blockquote:text-gray-800 dark:prose-blockquote:text-gray-200
          prose-a:text-red-700 prose-a:no-underline hover:prose-a:underline
          ${!canAccess ? 'max-h-[300px] overflow-hidden relative mask-fade-to-bottom' : ''}
        `}>
          {canAccess ? (
            <div dangerouslySetInnerHTML={{ __html: corpoTextoSanitizado }} />
          ) : (
            <>
               <div className="pointer-events-none opacity-40" dangerouslySetInnerHTML={{ __html: corpoTextoSanitizado.substring(0, 400) + "..." }} />
               
               {/* PAYWALL / CTA */}
               <div className="absolute inset-0 bg-gradient-to-t from-white dark:from-gray-950 via-white/95 dark:via-gray-950/95 to-transparent flex flex-col items-center justify-end pb-10 text-center px-4">
                  <div className="p-8 bg-gray-900 rounded-3xl shadow-2xl max-w-sm border-2 border-red-700/30 transform sm:scale-110">
                    <div className="w-12 h-12 bg-red-700 rounded-full flex items-center justify-center mx-auto mb-4 border-4 border-gray-900 -mt-14 shadow-xl">
                      <Lock className="w-6 h-6 text-white" />
                    </div>
                    <h3 className="text-white text-xl font-black uppercase tracking-tight mb-2">Conteúdo Exclusivo</h3>
                    <p className="text-gray-400 text-sm font-medium mb-6">
                      Esta matéria é reservada para assinantes da <span className="text-white font-bold">Revista Gestão</span>.
                    </p>
                    <div className="space-y-3">
                      <Link 
                        href="/login" 
                        className="block w-full bg-red-700 hover:bg-red-600 text-white font-black uppercase text-xs py-4 rounded-xl transition-all shadow-lg"
                      >
                        Já sou assinante / Entrar
                      </Link>
                      <Link 
                        href="/assine" 
                        className="block w-full bg-gray-800 hover:bg-gray-700 text-gray-300 font-black uppercase text-xs py-4 rounded-xl transition-all"
                      >
                        Quero assinar
                      </Link>
                    </div>
                  </div>
               </div>
            </>
          )}
        </div>

        {/* Newsletter CTA at the end of artigo (M1-PLUS-T3-ST3) */}
        <div className="mt-16 w-full max-w-[760px] mx-auto font-sans">
          <NewsletterForm origem={`noticia_${artigo.slug}`} />
        </div>

        {/* View Counter Client Injector (M3-PLUS-T1-ST2) */}
        <ViewCounter artigoId={artigo.id} />

      </article>
    </div>
  );
}

