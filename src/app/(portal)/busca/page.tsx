import { prisma } from "@/lib/prisma";
import Link from "next/link";
import Image from "next/image";
import { Search } from "lucide-react";

export const dynamic = "force-dynamic";

interface SearchPageProps {
  searchParams: Promise<{ q?: string }>;
}

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const { q: query } = await searchParams;

  if (!query) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center">
        <Search className="w-16 h-16 text-gray-300 mx-auto mb-6" />
        <h1 className="text-3xl font-black text-gray-900 dark:text-gray-100 uppercase tracking-tighter">
          O que você está procurando?
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">
          Digite um termo na busca acima para encontrar notícias.
        </p>
      </div>
    );
  }

  const articles = await prisma.article.findMany({
    where: {
      status_id: "publicado",
      OR: [
        { titulo: { contains: query, mode: "insensitive" } },
        { resumo: { contains: query, mode: "insensitive" } },
        { corpo_texto: { contains: query, mode: "insensitive" } },
      ],
    },
    orderBy: { data_publicacao: "desc" },
    select: {
      id: true,
      titulo: true,
      slug: true,
      resumo: true,
      og_image_url: true,
      data_publicacao: true,
      categoria: { select: { nome: true, slug: true } },
      autor: { select: { nome: true } },
    },
    take: 50,
  });

  return (
    <div className="w-full bg-background min-h-[70vh]">
      {/* Header Busca */}
      <div className="bg-gray-100 dark:bg-gray-900/50 border-b-4 border-red-700 pt-12 pb-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl md:text-5xl font-black text-gray-950 dark:text-gray-100 tracking-tight flex items-center gap-4 mb-2 uppercase">
            <Search className="w-10 h-10 text-red-700" />
            Resultados para: <span className="text-red-700 italic">"{query}"</span>
          </h1>
          <p className="text-gray-800 dark:text-gray-300 text-lg font-bold">
            {articles.length === 0 
              ? "Nenhum resultado encontrado para sua pesquisa." 
              : `Encontramos ${articles.length} ${articles.length === 1 ? 'resultado' : 'resultados'}.`}
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {articles.length === 0 ? (
          <div className="py-20 text-center bg-gray-50 dark:bg-gray-900/30 border border-dashed border-gray-300 dark:border-gray-800 rounded-3xl max-w-3xl mx-auto">
            <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100">Ops! Não encontramos nada.</h3>
            <p className="text-gray-600 dark:text-gray-400 mt-2">
              Tente utilizar palavras-chave diferentes ou mais genéricas.
            </p>
            <Link 
              href="/"
              className="mt-6 inline-block bg-red-700 text-white font-black uppercase text-xs px-8 py-3 rounded-xl hover:bg-red-800 transition-all shadow-lg"
            >
              Voltar para a Home
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
            {articles.map((art) => (
              <Link key={art.id} href={`/noticia/${art.slug}`} className="group flex flex-col h-full items-start">
                <div className="w-full aspect-[16/9] bg-gray-200 dark:bg-gray-800 mb-4 relative overflow-hidden border border-gray-200 dark:border-gray-800 group-hover:border-red-700 transition-colors duration-300">
                  {art.og_image_url ? (
                    <Image 
                      src={art.og_image_url} 
                      alt={art.titulo}
                      fill
                      sizes="(max-width: 768px) 100vw, 400px"
                      className="object-cover group-hover:scale-105 transition-transform duration-700"
                    />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center text-gray-400 group-hover:scale-105 transition-transform duration-700">
                      <Search className="w-12 h-12 opacity-20" />
                    </div>
                  )}
                  {art.categoria && (
                    <div className="absolute top-4 left-4 z-20">
                      <span className="bg-red-700 text-white text-[10px] font-black uppercase tracking-widest px-2 py-1 shadow-lg">
                        {art.categoria.nome}
                      </span>
                    </div>
                  )}
                </div>

                <h2 className="text-xl font-black text-gray-950 dark:text-gray-100 leading-tight group-hover:text-red-700 transition-colors duration-300 line-clamp-3 mb-3">
                  {art.titulo}
                </h2>
                
                {art.resumo && (
                  <p className="text-sm text-gray-700 dark:text-gray-400 line-clamp-3 mb-4 flex-grow">
                    {art.resumo}
                  </p>
                )}

                <div className="mt-auto flex items-center gap-3 text-[10px] text-gray-500 font-bold uppercase tracking-widest pt-2 border-t border-gray-100 dark:border-gray-900 w-full">
                  <time>
                    {art.data_publicacao?.toLocaleDateString("pt-BR", { 
                      day: "2-digit", month: "short", year: "numeric" 
                    })}
                  </time>
                  <span className="w-1 h-1 bg-gray-300 rounded-full"></span>
                  <span>{art.autor?.nome || "Redação"}</span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
