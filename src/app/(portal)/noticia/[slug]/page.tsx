import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Metadata } from "next";

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

  // Busca o artigo
  const article = await prisma.article.findUnique({
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

  return (
    <div className="w-full bg-white pb-20">
      
      {/* Top Banner Category Header */}
      {article.categoria && (
        <div className="w-full bg-slate-100 border-b border-slate-200 py-3 hidden md:block">
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

      <article className="max-w-[1000px] mx-auto px-4 sm:px-6 lg:px-8 pt-8 md:pt-14">
        
        {/* Cabeçalho do Artigo (Estilo Portal Jornalístico) */}
        <header className="mb-10 lg:mb-12">
          
          <div className="md:hidden flex items-center mb-4">
             {article.categoria && (
               <Link 
                 href={`/categoria/${article.categoria.slug}`}
                 className="text-[12px] font-black uppercase tracking-widest text-red-700"
               >
                 {article.categoria.nome}
               </Link>
             )}
          </div>

          <h1 className="text-4xl md:text-5xl lg:text-6xl font-black text-slate-900 leading-[1.05] tracking-tight mb-6">
            {article.titulo}
          </h1>

          {article.resumo && (
            <p className="text-[20px] md:text-[24px] text-slate-600 font-medium leading-snug mb-8">
              {article.resumo}
            </p>
          )}

          {/* Dados e Social Share */}
          <div className="flex flex-col sm:flex-row sm:items-center py-4 border-y-2 border-slate-900/10 justify-between gap-4">
            
            <div className="flex items-center gap-4">
              <div>
                <p className="text-[15px] font-bold text-slate-900 uppercase tracking-widest">
                  Por <span className="text-red-700">{article.autor?.nome || "Redação"}</span>
                </p>
                <time className="text-[13px] font-semibold text-slate-500 uppercase tracking-widest flex items-center gap-2 mt-1">
                  {article.data_publicacao?.toLocaleDateString("pt-BR", { 
                    day: "2-digit", month: "long", year: "numeric"
                  })} às {article.data_publicacao?.toLocaleTimeString("pt-BR", { 
                    hour: "2-digit", minute: "2-digit"
                  })}
                </time>
              </div>
            </div>
            
            {/* Share / Metadados */}
            <div className="flex items-center gap-4">
              <span className="text-[12px] font-bold uppercase tracking-widest text-slate-400 flex items-center gap-1.5">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                Lido {article.visualizacoes} vezes
              </span>
              {/* Fake Social Buttons G1 style */}
              <div className="flex gap-2">
                 <button className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 hover:bg-red-700 hover:text-white transition-colors">
                   <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path fillRule="evenodd" d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" clipRule="evenodd" /></svg>
                 </button>
                 <button className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 hover:bg-red-700 hover:text-white transition-colors">
                   <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path fillRule="evenodd" d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10c5.51 0 10-4.48 10-10S17.51 2 12 2zm6.605 4.61a8.502 8.502 0 011.93 5.314c-.281-.054-3.101-.629-5.943-.271-.065-.156-.134-.311-.205-.466 2.308-1.025 3.328-2.553 3.391-2.65-.008.016-1.042 1.35-3.568 1.956.126-.411.23-.836.31-1.272 1.849-1.242 2.934-2.88 2.964-2.929-.011.02-1.096 1.706-3.882 2.37A20.354 20.354 0 0012 5.093c-.93 1.259-2.023 2.385-3.219 3.313a17.478 17.478 0 01-2.992-2.1c.026.046 1.111 1.71 3.013 2.903-1.428.163-2.774.208-3.033.209.02.001 1.24 1.487 3.25 2.193-1.05.748-2.618 1.112-2.827 1.155.021.002 1.83.945 4.14 1.05-.184.27-.372.536-.563.793-2.181.363-4.108 1.233-4.225 1.288.025.006 2.238-1.127 4.793-1.041a31.32 31.32 0 01-1.205 2.507c-.42.756-.86 1.455-1.325 2.083A8.47 8.47 0 014.288 12.01c.219-5.495 4.634-10.015 10.155-10.015 1.547 0 3.003.35 4.305.973l-.143.242zm-1.163 12.27c2.37-1.436 4.104-3.834 4.54-6.66-.445.419-1.789 1.503-4.008 1.97-.245.503-.51 1-.796 1.487v.001A10.875 10.875 0 0113.88 18.06c1.68-.009 2.986-.796 3.06-.843-.01.006-1.408 1.056-3.642 1.066a22.253 22.253 0 01-3.29-.272c-1.353-.243-2.527-.679-2.585-.701.011.004 1.444.603 3.352.88 2.067.295 4.095-.084 4.88-.283.473-.12.87-.272 1.144-.41-.122-.095-2.29-1.849-5.26-4.938-.49.337-1 .616-1.527.834-3.082 1.196-5.83 2.083-6.685 2.327-.197.057-.311.077-.311.077 3.515 2.52 7.747 2.062 10.45 1.096z" clipRule="evenodd" /></svg>
                 </button>
              </div>
            </div>
          </div>
        </header>

        {/* Hero Image (Square, Solid Frame G1 style) */}
        <figure className="w-full aspect-video md:aspect-[21/9] bg-slate-100 mb-12 relative border border-slate-200 pointer-events-none group">
          <div className="absolute inset-0 bg-slate-50 flex items-center justify-center text-slate-300">
             <svg className="w-16 h-16 transform group-hover:scale-110 transition-transform duration-500" fill="currentColor" viewBox="0 0 24 24"><path d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
          </div>
        </figure>

        {/* Corpo do Texto - Tipografia de Jornalismo Puro */}
        <div className="
          w-full max-w-[760px] mx-auto 
          text-[19px] md:text-[21px] leading-[1.7] md:leading-[1.75] text-slate-900
          [&>p]:mb-7 [&>p:last-child]:mb-0
          [&>h2]:text-[28px] md:[&>h2]:text-[32px] [&>h2]:font-black [&>h2]:text-slate-900 [&>h2]:mt-12 [&>h2]:mb-6 [&>h2]:leading-tight
          [&>h3]:text-[22px] md:[&>h3]:text-[24px] [&>h3]:font-bold [&>h3]:text-slate-900 [&>h3]:mt-10 [&>h3]:mb-4
          [&>ul]:list-disc [&>ul]:pl-6 [&>ul]:mb-6 [&>ul>li]:mb-3 [&>ul>li]:pl-2
          [&>ol]:list-decimal [&>ol]:pl-6 [&>ol]:mb-6 [&>ol>li]:mb-3 [&>ol>li]:pl-2
          [&>a]:text-red-700 [&>a]:underline [&>a]:underline-offset-2 [&>a:hover]:text-red-800
          [&>blockquote]:border-l-[6px] [&>blockquote]:border-red-700 [&>blockquote]:pl-6 [&>blockquote]:italic [&>blockquote]:text-slate-700 [&>blockquote]:py-4 [&>blockquote]:my-10 [&>blockquote]:font-serif [&>blockquote]:text-2xl
          font-serif antialiased
        ">
          {/* Se o texto real vier com Pular Linha \n, transformaremos em <p> blocks */}
          {article.corpo_texto.split("\n\n").map((paragraph, index) => {
            // Um pequeno parse rudimentar de markdown minimalista para a base jornalística MVP
            if (paragraph.startsWith("## ")) {
              return <h2 key={index}>{paragraph.replace("## ", "")}</h2>;
            }
            if (paragraph.startsWith("> ")) {
              return <blockquote key={index}>{paragraph.replace("> ", "")}</blockquote>;
            }
            return <p key={index}>{paragraph}</p>;
          })}
        </div>

      </article>
    </div>
  );
}
