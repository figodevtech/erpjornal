import { prisma } from "@/lib/prisma";
import Link from "next/link";
import Image from "next/image";
import { Search, ChevronRight, Clock, User, Tag, Calendar } from "lucide-react";
import { SearchService } from "@/lib/services/search-service";
import SearchFilters from "@/components/search/SearchFilters";
import { Suspense } from "react";

export const dynamic = "force-dynamic";

interface SearchPageProps {
  searchParams: Promise<{ 
    q?: string; 
    category?: string; 
    author?: string; 
    sortBy?: string;
    dateRange?: string;
  }>;
}

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const params = await searchParams;
  const { q: query, category, author, sortBy = "relevance", dateRange = "all" } = params;

  // 1. Fetch de Metadados para Filtros
  const [categories, authors] = await Promise.all([
    prisma.category.findMany({ select: { id: true, nome: true, slug: true }, orderBy: { nome: "asc" } }),
    prisma.user.findMany({ 
      where: { articles_authored: { some: {} } },
      select: { id: true, nome: true },
      orderBy: { nome: "asc" }
    }),
  ]);

  if (!query && !author && !category) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-32 text-center animate-in fade-in slide-in-from-bottom-5">
        <div className="w-24 h-24 bg-gray-100 dark:bg-gray-900 rounded-full flex items-center justify-center mx-auto mb-8 border-2 border-gray-200 dark:border-gray-800">
          <Search className="w-10 h-10 text-gray-300" strokeWidth={1} />
        </div>
        <h1 className="text-4xl md:text-6xl font-black text-gray-900 dark:text-gray-100 tracking-tighter uppercase leading-none mb-6">
          Explore o acervo da <br />
          <span className="text-red-700">Revista Gestão</span>
        </h1>
        <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto font-medium">
          Busque por notícias, temas, articulistas, políticos e tendências que moldam o Brasil e o Mundo.
        </p>
      </div>
    );
  }

  // 2. Execução da Busca Unificada via Serviço
  const { results: allResults } = await SearchService.search({
    query: query || "",
    category,
    author,
    sortBy: sortBy as any,
    dateRange: dateRange as any,
    limit: 100
  });

  // Filtrar apenas notícias para a listagem principal da página
  const articles = allResults.filter(r => r.type === "noticia");

  const highlight = (text: string) => {
    if (!query) return text;
    const parts = text.split(new RegExp(`(${query})`, "gi"));
    return (
      <>
        {parts.map((part, i) => (
          part.toLowerCase() === query.toLowerCase() ? (
            <mark key={i} className="bg-red-100 dark:bg-red-900/40 text-red-950 dark:text-red-100 px-0.5 rounded-sm">
              {part}
            </mark>
          ) : part
        ))}
      </>
    );
  };

  return (
    <main className="w-full bg-white dark:bg-gray-950 min-h-screen">
      {/* Header Contextual */}
      <div className="bg-gray-50 dark:bg-gray-900/30 border-b border-gray-200 dark:border-gray-800 py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
           <nav className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-gray-500 mb-6">
             <Link href="/">Home</Link>
             <ChevronRight className="w-3 h-3" />
             <span className="text-red-700">Busca</span>
           </nav>
           <h1 className="text-4xl md:text-6xl font-black text-gray-900 dark:text-gray-100 tracking-tighter uppercase leading-none">
             {query ? (
               <>Resultados para <span className="text-red-700 italic">"{query}"</span></>
             ) : (
               <>Explorando <span className="text-red-700 italic">Arquivos</span></>
             )}
           </h1>
           <div className="flex items-center gap-6 mt-6">
             <div className="flex items-center gap-2">
               <span className="text-2xl font-black text-gray-900 dark:text-gray-100">{articles.length}</span>
               <span className="text-[11px] font-black uppercase tracking-widest text-gray-500">Ocorrências</span>
             </div>
             {category && (
               <div className="bg-red-700 text-white px-3 py-1 text-[10px] font-black uppercase tracking-widest rounded-full">
                 Editoria: {category}
               </div>
             )}
           </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex flex-col lg:flex-row gap-12">
          
          {/* Barra Lateral de Filtros */}
          <Suspense fallback={<div className="w-72 h-96 bg-gray-100 dark:bg-gray-900 animate-pulse rounded-2xl" />}>
            <SearchFilters 
              categories={categories.map(c => ({ id: c.id, nome: c.nome, slug: c.slug }))} 
              authors={authors.map(a => ({ id: a.id, nome: a.nome }))} 
            />
          </Suspense>

          {/* Lista de Resultados */}
          <div className="flex-1">
            {articles.length === 0 ? (
              <div className="py-24 text-center bg-gray-50 dark:bg-gray-900/20 border-2 border-dashed border-gray-200 dark:border-gray-800 rounded-[2rem]">
                <div className="w-20 h-20 bg-white dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-6 shadow-sm">
                  <Search className="w-8 h-8 text-gray-300" />
                </div>
                <h3 className="text-2xl font-black text-gray-900 dark:text-gray-100 uppercase tracking-tight">Nenhuma pauta encontrada</h3>
                <p className="text-gray-600 dark:text-gray-400 mt-2 max-w-md mx-auto">
                  Não encontramos correspondências para sua busca com os filtros selecionados. Tente ajustar os critérios ou buscar termos mais genéricos.
                </p>
                <div className="flex flex-wrap justify-center gap-4 mt-10">
                  <Link href="/" className="px-8 py-3 bg-gray-900 dark:bg-white text-white dark:text-gray-900 text-xs font-black uppercase tracking-widest rounded-xl transition-all hover:scale-105 active:scale-95">Ir para a Home</Link>
                </div>
              </div>
            ) : (
              <div className="space-y-12">
                {articles.map((art) => (
                  <article key={art.id} className="group relative flex flex-col md:flex-row gap-8 pb-12 border-b border-gray-100 dark:border-gray-800 last:border-0 last:pb-0">
                    <Link href={`/noticia/${art.slug}`} className="md:w-72 lg:w-80 h-48 sm:h-56 bg-gray-100 dark:bg-gray-900 rounded-xl overflow-hidden relative border border-gray-200 dark:border-gray-800 flex-shrink-0">
                      {art.image ? (
                        <Image 
                          src={art.image} 
                          alt={art.title}
                          fill
                          className="object-cover group-hover:scale-105 transition-transform duration-700"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-200 dark:text-gray-800 transform group-hover:scale-110 transition-transform">
                          <Search className="w-12 h-12" />
                        </div>
                      )}
                      {art.metadata?.categoria && (
                        <div className="absolute top-4 left-4 z-10">
                          <span className="bg-red-700 text-white text-[10px] font-black uppercase tracking-[0.2em] px-3 py-1 rounded shadow-xl">
                            {art.metadata.categoria}
                          </span>
                        </div>
                      )}
                    </Link>

                    <div className="flex-1 flex flex-col pt-1">
                      <div className="flex items-center gap-4 mb-4 text-[10px] font-black uppercase tracking-widest text-gray-400">
                        <div className="flex items-center gap-1.5">
                          <Calendar className="w-3 h-3 text-red-700" />
                          {art.date ? art.date.toLocaleDateString("pt-BR") : "Data indisponível"}
                        </div>
                        <div className="flex items-center gap-1.5">
                          <User className="w-3 h-3 text-red-700" />
                          Por {art.metadata?.autor || "Redação"}
                        </div>
                      </div>

                      <Link href={`/noticia/${art.slug}`}>
                        <h2 className="text-2xl md:text-3xl font-black text-gray-950 dark:text-gray-100 leading-[1.1] group-hover:text-red-700 transition-colors duration-300 mb-4 line-clamp-3">
                          {highlight(art.title)}
                        </h2>
                      </Link>

                      {art.subtitle && (
                        <p className="text-[15px] md:text-[17px] text-gray-700 dark:text-gray-400 leading-relaxed font-medium line-clamp-2 mb-6">
                          {highlight(art.subtitle)}
                        </p>
                      )}

                      <div className="mt-auto flex items-center gap-6">
                        <Link 
                          href={`/noticia/${art.slug}`}
                          className="text-[11px] font-black uppercase tracking-widest text-red-700 flex items-center gap-2 group/btn"
                        >
                          Ler matéria completa
                          <ChevronRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
                        </Link>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </div>

        </div>
      </div>
    </main>
  );
}
