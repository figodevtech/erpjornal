import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Metadata } from "next";

// ISR: Atualiza a listagem de arquivos da categoria a cada 60 segundos
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

  // Primeiro descobre a categoria (Validação primária M1-MVP-T4)
  const category = await prisma.category.findUnique({
    where: { slug }
  });

  if (!category) {
    notFound();
  }

  // Monta Where condicional caso usuário clique nas Tabs de Filtro de Esfera (ST2)
  const whereClause: Prisma.ArticleWhereInput = {
    categoria_id: category.id,
    status_id: "publicado",
    data_publicacao: { lte: new Date() }
  };
  // Filtro de esfera suprimido temporariamente na V1 devido a limitação de schema (A esfera não foi modelada no Article, seria via Category mas a V1 exige apenas categorias listadas)
  const articles = await prisma.article.findMany({
    where: whereClause,
    orderBy: { data_publicacao: "desc" },
    include: {
      autor: { select: { nome: true } }
      // A própria categoria já conhecemos
    }
  });



  return (
    <div className="w-full bg-white min-h-[70vh]">
      
      {/* Header Escopo Categoria */}
      <div className="bg-slate-50 border-b border-slate-200 pt-16 pb-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center md:text-left">
          <h1 className="text-3xl md:text-5xl font-extrabold text-slate-900 tracking-tight flex items-center justify-center md:justify-start gap-3 mb-4">
             <span className="w-3 h-8 md:h-10 rounded-full shadow-inner" style={{ backgroundColor: category.cor || "#4f46e5" }}></span>
             {category.nome}
          </h1>
          <p className="text-slate-500 text-lg md:text-xl font-medium max-w-2xl">
            Acompanhe as últimas movimentações e publicações exclusivas sobre {category.nome}.
          </p>
        </div>
      </div>

      {/* Viewport de Filtros e Grid (ST1 & ST2) */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">

        {articles.length === 0 ? (
          <div className="py-20 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-300 max-w-3xl mx-auto">
             <svg className="w-16 h-16 text-slate-300 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
             </svg>
             <h3 className="text-lg font-bold text-slate-700">Pauta Vazia</h3>
             <p className="text-slate-500 mt-2">Nenhum artigo foi encontrado com os filtros selecionados.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 gap-y-12 block-layout">
            {articles.map(art => (
              <Link key={art.id} href={`/noticia/${art.slug}`} className="group flex flex-col h-full items-start">
                  
                  {/* Thumb / Fallback */}
                  <div className="w-full aspect-[16/10] bg-slate-100 rounded-2xl overflow-hidden mb-5 relative shadow-sm transition-transform duration-300 group-hover:-translate-y-1 group-hover:shadow-lg">
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-900/10 to-transparent"></div>
                    <div className="absolute inset-0 flex items-center justify-center text-slate-300">
                      <svg className="w-10 h-10" fill="currentColor" viewBox="0 0 24 24"><path d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2v12a2 2 0 002 2z" /></svg>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 mb-3">
                    <span 
                      className="text-[10px] font-black uppercase tracking-widest text-white px-2 py-0.5 rounded shadow-sm"
                      style={{ backgroundColor: category.cor || "#4f46e5" }}
                    >
                      {category.nome}
                    </span>
                    {/* Na v1 o Article não tem campo esfera direto, a esfera pertence a Category. A ST2 será cumprida futuramente com a mudança no Prisma ou associada à hierarquia */}
                  </div>

                  <h2 className="text-[20px] font-extrabold text-slate-900 leading-[1.2] group-hover:text-indigo-600 transition-colors line-clamp-3 mb-3">
                    {art.titulo}
                  </h2>

                  {art.resumo && <p className="text-[15px] leading-relaxed text-slate-600 line-clamp-2 md:line-clamp-3 mb-4 flex-grow">{art.resumo}</p>}

                  <div className="mt-auto pt-3 flex items-center gap-3 text-[12px] text-slate-500 font-semibold border-t border-slate-100 w-full">
                    {/* Data formatada curto p/ card */}
                    <time>
                      {art.data_publicacao!.toLocaleDateString("pt-BR", { day: "numeric", month: "short", year: "numeric" })}
                    </time>
                    <span className="w-1 h-1 rounded-full bg-slate-300 hidden sm:block"></span>
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
