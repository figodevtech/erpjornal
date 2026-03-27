import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Metadata } from "next";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { Lock, Crown } from "lucide-react";
import NewsletterForm from "@/components/portal/NewsletterForm";

export const revalidate = 300;

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const article = await prisma.article.findUnique({
    where: { slug }
  });

  if (!article) return { title: "Artigo não encontrado" };

  return {
    title: `${article.titulo} | Revista Gestão`,
    description: article.resumo || "Leia esta matéria na Revista Gestão.",
    openGraph: {
      title: article.titulo,
      description: article.resumo || "",
      type: "article",
      publishedTime: article.data_publicacao?.toISOString(),
      url: `https://revistagestao.com.br/noticia/${article.slug}`,
    }
  };
}

export default async function NoticiaPage({ params }: PageProps) {
  const { slug } = await params;
  const session = await getServerSession(authOptions);

  // Busca o artigo
  const article = await prisma.article.findFirst({
    where: {
      slug,
      status_id: "publicado",
    },
    include: {
      autor: true,
      categoria: true,
    }
  });

  if (!article) {
    notFound();
  }

  // Despacha incremento de Views async non-blocking
  prisma.article.update({
    where: { id: article.id },
    data: { visualizacoes: { increment: 1 } }
  }).catch(() => {});

  const isPremium = article.is_premium;
  const isAuthed = !!session;
  const canAccess = !isPremium || isAuthed;

  return (
    <div className="w-full bg-background pb-20 overflow-x-hidden transition-colors duration-300">
      
      {/* Top Banner Category Header */}
      {article.categoria && (
        <div className="w-full bg-slate-100 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 py-3 hidden md:block transition-colors">
          <div className="max-w-[1000px] mx-auto px-4 sm:px-6 lg:px-8">
             <Link 
               href={`/categoria/${article.categoria.slug}`}
               className="text-[14px] font-black uppercase tracking-widest text-red-700 hover:text-red-800 transition-colors"
             >
               {article.categoria.nome}
             </Link>
          </div>
        </div>
      )}

      <article className="max-w-[1000px] mx-auto px-4 sm:px-6 lg:px-8 pt-8 md:pt-14 font-serif">
        
        {/* Cabeçalho do Artigo */}
        <header className="mb-10 lg:mb-12 font-sans">
          
          <div className="flex items-center gap-3 mb-4">
             {article.categoria && (
               <Link 
                 href={`/categoria/${article.categoria.slug}`}
                 className="text-[12px] font-black uppercase tracking-widest text-red-700"
               >
                 {article.categoria.nome}
               </Link>
             )}
             {isPremium && (
               <span className="bg-slate-900 text-white text-[10px] font-black uppercase tracking-[0.2em] px-2 py-0.5 rounded-sm flex items-center gap-1">
                 <Crown className="w-3 h-3 text-red-700 fill-red-700" />
                 Exclusivo
               </span>
             )}
          </div>

          <h1 className="text-4xl md:text-5xl lg:text-6xl font-black text-slate-900 dark:text-slate-100 leading-[1.05] tracking-tight mb-6">
            {article.titulo}
          </h1>

          {article.resumo && (
            <p className="text-[20px] md:text-[24px] text-slate-800 dark:text-slate-200 font-medium leading-[1.3] mb-8 font-serif">
              {article.resumo}
            </p>
          )}

          {/* Dados d Autor */}
          <div className="flex flex-col sm:flex-row sm:items-center py-4 border-y-2 border-slate-900/30 justify-between gap-4">
            <div className="flex items-center gap-4">
              <div>
                <p className="text-[15px] font-bold text-slate-950 dark:text-slate-50 uppercase tracking-widest">
                  Por <span className="text-red-700">{article.autor?.nome || "Redação"}</span>
                </p>
                <time className="text-[13px] font-black text-slate-950 dark:text-slate-300 uppercase tracking-widest flex items-center gap-2 mt-1">
                  {article.data_publicacao?.toLocaleDateString("pt-BR", { 
                    day: "2-digit", month: "long", year: "numeric"
                  })} às {article.data_publicacao?.toLocaleTimeString("pt-BR", { 
                    hour: "2-digit", minute: "2-digit"
                  })}
                </time>
                {article.external_author && (
                  <p className="text-[13px] font-bold text-slate-950 dark:text-slate-400 mt-2 flex items-center gap-2 uppercase tracking-tight">
                    <span className="bg-slate-100 dark:bg-slate-900 px-2 py-0.5 rounded text-[11px] text-slate-800 dark:text-slate-400">Fonte Original:</span>
                    <span className="text-slate-950 dark:text-slate-100">{article.external_author}</span>
                    {article.source_url && (
                      <a 
                        href={article.source_url} 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        className="text-red-700 hover:text-red-800 underline decoration-dotted underline-offset-4"
                      >
                        Ver Original
                      </a>
                    )}
                  </p>
                )}
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <span className="text-[12px] font-black uppercase tracking-widest text-slate-800 dark:text-slate-400 flex items-center gap-1.5">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                Lido {article.visualizacoes} vezes
              </span>
            </div>
          </div>
        </header>

        {/* Hero Image */}
        <figure className="w-full aspect-video md:aspect-[21/9] bg-slate-100 dark:bg-slate-900 mb-12 relative border border-slate-300 dark:border-slate-800 pointer-events-none group transition-all">
          <div className="absolute inset-0 bg-slate-100/50 dark:bg-slate-900/50 flex items-center justify-center text-slate-500 dark:text-slate-700">
             <svg className="w-16 h-16 transform group-hover:scale-110 transition-transform duration-500" fill="currentColor" viewBox="0 0 24 24"><path d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
          </div>
        </figure>

        {/* Corpo do Texto */}
        <div className={`
          w-full max-w-[760px] mx-auto 
          prose prose-slate dark:prose-invert prose-lg md:prose-xl max-w-none
          prose-p:text-slate-950 dark:prose-p:text-slate-100 prose-p:leading-[1.8] prose-p:mb-7
          prose-h2:text-slate-950 dark:prose-h2:text-slate-100 prose-h2:font-black prose-h2:mt-12 prose-h2:mb-6
          prose-blockquote:border-red-700 prose-blockquote:italic prose-blockquote:text-slate-800 dark:prose-blockquote:text-slate-200
          prose-a:text-red-700 prose-a:no-underline hover:prose-a:underline
          ${!canAccess ? 'max-h-[300px] overflow-hidden relative mask-fade-to-bottom' : ''}
        `}>
          {canAccess ? (
            <div dangerouslySetInnerHTML={{ __html: article.corpo_texto }} />
          ) : (
            <>
               <div className="pointer-events-none opacity-40" dangerouslySetInnerHTML={{ __html: article.corpo_texto.substring(0, 400) + "..." }} />
               
               {/* PAYWALL / CTA */}
               <div className="absolute inset-0 bg-gradient-to-t from-white dark:from-slate-950 via-white/95 dark:via-slate-950/95 to-transparent flex flex-col items-center justify-end pb-10 text-center px-4">
                  <div className="p-8 bg-slate-900 rounded-3xl shadow-2xl max-w-sm border-2 border-red-700/30 transform sm:scale-110">
                    <div className="w-12 h-12 bg-red-700 rounded-full flex items-center justify-center mx-auto mb-4 border-4 border-slate-900 -mt-14 shadow-xl">
                      <Lock className="w-6 h-6 text-white" />
                    </div>
                    <h3 className="text-white text-xl font-black uppercase tracking-tight mb-2">Conteúdo Exclusivo</h3>
                    <p className="text-slate-400 text-sm font-medium mb-6">
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
                        className="block w-full bg-slate-800 hover:bg-slate-700 text-slate-300 font-black uppercase text-xs py-4 rounded-xl transition-all"
                      >
                        Quero assinar
                      </Link>
                    </div>
                  </div>
               </div>
            </>
          )}
        </div>

        {/* Newsletter CTA at the end of article (M1-PLUS-T3-ST3) */}
        <div className="mt-16 w-full max-w-[760px] mx-auto font-sans">
          <NewsletterForm origem={`noticia_${article.slug}`} />
        </div>

      </article>
    </div>
  );
}
