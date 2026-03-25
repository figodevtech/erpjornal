import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Metadata } from "next";

export const revalidate = 60;

interface PageProps {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ esfera?: string }>;
}

export async function generateMetadata(props: PageProps): Promise<Metadata> {
  const params = await props.params;
  const { slug } = params;
  const category = await prisma.category.findUnique({ where: { slug } });

  if (!category) return { title: "Categoria não encontrada" };

  return {
    title: `${category.nome} | Notícias - Revista Gestão`,
    description: `Acompanhe as últimas publicações arquivadas na seção ${category.nome} da Revista Gestão.`,
  };
}

export default async function CategoriaPage(props: PageProps) {
  const params = await props.params;
  const { slug } = params;

  // Primeiro descobre a categoria (Validação primária)
  const category = await prisma.category.findUnique({
    where: { slug }
  });

  if (!category) {
    notFound();
  }

  // Monta Where condicional
  const whereClause: Prisma.ArticleWhereInput = {
    categoria_id: category.id,
    status_id: "publicado",
    data_publicacao: { lte: new Date() }
  };
  
  const articles = await prisma.article.findMany({
    where: whereClause,
    orderBy: { data_publicacao: "desc" },
    include: {
      autor: { select: { nome: true } }
    }
  });

  return (
    <div className="w-full bg-white min-h-[70vh]">
      
      {/* Header Escopo Categoria */}
      <div className="bg-slate-100 border-b-4 border-slate-900 pt-12 pb-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-[32px] md:text-[48px] font-black text-slate-900 tracking-tight flex items-center gap-4 mb-2 uppercase">
             <span className="w-4 h-12 shadow-sm" style={{ backgroundColor: category.cor || "#C4170C" }}></span>
             {category.nome}
          </h1>
          <p className="text-slate-600 text-lg font-medium max-w-2xl pl-8 border-l-4 border-slate-300 ml-2">
            Acompanhe as últimas informações e apurações exclusivas sobre {category.nome}.
          </p>
        </div>
      </div>

      {/* Grid Central */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">

        {articles.length === 0 ? (
          <div className="py-20 text-center bg-slate-50 border border-slate-200 max-w-3xl mx-auto">
             <svg className="w-12 h-12 text-slate-300 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
             </svg>
             <h3 className="text-lg font-bold text-slate-900">Pauta Vazia</h3>
             <p className="text-slate-500 mt-1">Nenhum artigo publicado recentemente nesta editoria.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10 gap-y-12">
            {articles.map(art => (
              <Link key={art.id} href={`/noticia/${art.slug}`} className="group flex flex-col h-full items-start">
                  
                  {/* Thumb / Fallback (Square edges, classic news feel) */}
                  <div className="w-full aspect-[4/3] bg-slate-100 overflow-hidden mb-4 relative border border-slate-200 transition-colors group-hover:border-red-700">
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-900/10 to-transparent z-10"></div>
                    <div className="absolute inset-0 flex items-center justify-center text-slate-300 transform group-hover:scale-105 transition-transform duration-500">
                      <svg className="w-12 h-12" fill="currentColor" viewBox="0 0 24 24"><path d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2v12a2 2 0 002 2z" /></svg>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 mb-3 w-full border-b-[2px] border-red-500/10 pb-2">
                    <span 
                      className="text-[12px] font-bold uppercase tracking-widest text-red-700"
                    >
                      {category.nome}
                    </span>
                  </div>

                  <h2 className="text-[22px] font-black text-slate-900 leading-[1.2] group-hover:text-red-700 transition-colors line-clamp-3 mb-3">
                    {art.titulo}
                  </h2>

                  {art.resumo && <p className="text-[16px] leading-snug text-slate-600 line-clamp-3 mb-4 flex-grow">{art.resumo}</p>}

                  <div className="mt-auto flex items-center gap-3 text-[11px] text-slate-500 font-bold uppercase tracking-widest pt-2 w-full">
                    <time>
                      {art.data_publicacao!.toLocaleDateString("pt-BR", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })}
                    </time>
                    <span className="w-1 h-1 bg-slate-300 hidden sm:block"></span>
                    <span className="hidden sm:inline-block truncate">
                       {art.autor?.nome || "Redação"}
                    </span>
                  </div>
              </Link>
            ))}
          </div>
        )}

      </div>
    </div>
  );
}
