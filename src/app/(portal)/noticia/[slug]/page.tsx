import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Metadata } from "next";

// REVALIDAÇÃO A CADA 300 SEGUNDOS (5 MINUTOS) ZERO WATERFALL
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

  // Busca o artigo e incrementa view silenciosamente via Update (Isso não bloqueia a UI pq o prisma retorna o row original em tempo real e já comita no bg da VM)
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
    <div className="w-full bg-slate-50 min-h-screen">
      <article className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 md:py-16">
        
        {/* Cabeçalho do Artigo (M1-MVP-T3-ST2 & ST3) */}
        <header className="mb-10 lg:mb-14">
          
          <div className="flex items-center gap-3 mb-6">
            <Link 
              href="/" 
              className="group flex items-center text-sm font-semibold text-slate-500 hover:text-indigo-600 transition-colors"
            >
              <svg className="w-4 h-4 mr-1 transform group-hover:-translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Voltar à Capa
            </Link>

            {article.categoria && (
              <>
                <span className="text-slate-300">•</span>
                <Link 
                  href={`/categoria/${article.categoria.slug}`}
                  className="inline-flex px-3 py-1 rounded-full text-[11px] font-black uppercase tracking-widest bg-indigo-100 text-indigo-700 hover:bg-indigo-600 hover:text-white transition-colors"
                >
                  {article.categoria.nome}
                </Link>
              </>
            )}
          </div>

          <h1 className="text-3xl md:text-5xl lg:text-6xl font-extrabold text-slate-900 leading-[1.15] tracking-tight mb-6">
            {article.titulo}
          </h1>

          {article.resumo && (
            <p className="text-lg md:text-2xl text-slate-600 font-medium leading-relaxed mb-8 max-w-3xl">
              {article.resumo}
            </p>
          )}

          {/* Dados Adicionais na Base do Header */}
          <div className="flex flex-col sm:flex-row sm:items-center py-5 border-y border-slate-200/80 justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-slate-200 flex items-center justify-center shadow-inner">
                <svg className="w-6 h-6 text-slate-400" fill="currentColor" viewBox="0 0 24 24"><path d="M24 20.993V24H0v-2.996A14.977 14.977 0 0112.004 15c4.904 0 9.26 2.354 11.996 5.993zM16.002 8.999a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
              </div>
              <div>
                <p className="text-[15px] font-bold text-slate-900">
                  Por {article.autor?.nome || "Redação"}
                </p>
                <time className="text-sm font-medium text-slate-500 flex items-center gap-2">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                  {article.data_publicacao?.toLocaleDateString("pt-BR", { 
                    day: "2-digit", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit" 
                  })}
                </time>
              </div>
            </div>
            
            {/* Share / Metadados */}
            <div className="flex items-center gap-3">
              <span className="text-sm font-semibold text-slate-400 flex items-center gap-1.5 bg-slate-100 px-3 py-1.5 rounded-lg border border-slate-200">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                {article.visualizacoes} acessos
              </span>
            </div>
          </div>
        </header>

        {/* Hero Image Fictícia com Drop Shadow (Caso tenha, injetar src, por hora renderiza Fallback UI) */}
        <figure className="w-full aspect-[16/9] md:aspect-[21/9] bg-slate-200 rounded-2xl md:rounded-[32px] overflow-hidden mb-12 shadow-md relative ring-1 ring-slate-900/5 flex items-center justify-center group pointer-events-none">
          <div className="absolute inset-0 bg-gradient-to-tr from-indigo-100/50 to-slate-50"></div>
          <svg className="w-20 h-20 text-indigo-200/50" fill="currentColor" viewBox="0 0 24 24"><path d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
        </figure>

        {/* Corpo do Texto (M1-MVP-T3-ST1) - Componente Leitura Escala Otimizada */}
        {/* Como não instalamos o @tailwindcss/typography (prose), injetamos CSS hierárquico limpo e performático */}
        <div className="
          w-full max-w-3xl mx-auto rounded-xl bg-white p-6 sm:p-10 md:p-14 shadow-[0_2px_40px_-15px_rgba(0,0,0,0.05)] border border-slate-100
          text-[17px] md:text-[19px] leading-[1.8] md:leading-[1.9] text-slate-700
          [&>p]:mb-6 md:[&>p]:mb-8 [&>p:last-child]:mb-0
          [&>h2]:text-2xl md:[&>h2]:text-3xl [&>h2]:font-bold [&>h2]:text-slate-900 [&>h2]:mt-10 [&>h2]:mb-6
          [&>h3]:text-xl md:[&>h3]:text-2xl [&>h3]:font-bold [&>h3]:text-slate-900 [&>h3]:mt-8 [&>h3]:mb-4
          [&>ul]:list-disc [&>ul]:pl-6 [&>ul]:mb-6 [&>ul>li]:mb-2
          [&>ol]:list-decimal [&>ol]:pl-6 [&>ol]:mb-6 [&>ol>li]:mb-2
          [&>a]:text-indigo-600 [&>a]:underline [&>a:hover]:text-indigo-800
          [&>blockquote]:border-l-4 [&>blockquote]:border-indigo-500 [&>blockquote]:pl-6 [&>blockquote]:italic [&>blockquote]:text-slate-600 [&>blockquote]:bg-indigo-50/50 [&>blockquote]:py-3 [&>blockquote]:my-8 [&>blockquote]:rounded-r-lg
          font-serif antialiased
        ">
          {/* Se o texto real vier com Pular Linha \n, transformaremos em <p> blocks */}
          {article.corpo_texto.split("\n\n").map((paragraph, index) => {
            // Um pequeno parse rudimentar de markdown minimalista apenas para a base MVP
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
