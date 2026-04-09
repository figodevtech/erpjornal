import SearchFilters from "@/components/search/SearchFilters";
import PortalSectionHeader from "@/components/portal/PortalSectionHeader";
import { prisma } from "@/lib/prisma";
import { SearchService } from "@/lib/services/search-service";
import Image from "next/image";
import Link from "next/link";
import { Calendar, ChevronRight, Search, User } from "lucide-react";
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

  const [categories, authors] = await Promise.all([
    prisma.categoria.findMany({ select: { id: true, nome: true, slug: true }, orderBy: { nome: "asc" } }),
    prisma.usuario.findMany({
      where: { artigosAutor: { some: {} } },
      select: { id: true, nome: true },
      orderBy: { nome: "asc" },
    }),
  ]);

  if (!query && !author && !category) {
    return (
      <main className="min-h-screen w-full bg-white text-gray-900 transition-colors duration-300 dark:bg-gray-950 dark:text-gray-100">
        <div className="mx-auto max-w-7xl px-4 py-32 text-center animate-in fade-in slide-in-from-bottom-5">
          <div className="mx-auto mb-8 flex h-24 w-24 items-center justify-center rounded-full border-2 border-gray-200 bg-gray-100 dark:border-gray-800 dark:bg-gray-900">
            <Search className="h-10 w-10 text-gray-300" strokeWidth={1} />
          </div>
          <h1 className="mb-6 text-4xl font-black uppercase leading-none tracking-tighter text-gray-900 dark:text-gray-100 md:text-6xl">
            Explore o acervo da <br />
            <span className="text-red-700">Revista Gestao</span>
          </h1>
          <p className="mx-auto max-w-2xl text-xl font-medium text-gray-600 dark:text-gray-400">
            Busque por noticias, temas, articulistas, politicos e tendencias que moldam o Brasil e o mundo.
          </p>
        </div>
      </main>
    );
  }

  const { results: allResults } = await SearchService.search({
    query: query || "",
    category,
    author,
    sortBy: sortBy as any,
    dateRange: dateRange as any,
    type: ["noticia"],
    limit: 100,
  });

  const artigos = allResults.filter((r) => r.type === "noticia");

  const highlight = (text: string) => {
    if (!query) return text;
    const parts = text.split(new RegExp(`(${query})`, "gi"));
    return (
      <>
        {parts.map((part, i) =>
          part.toLowerCase() === query.toLowerCase() ? (
            <mark key={i} className="rounded-sm bg-red-100 px-0.5 text-red-950 dark:bg-red-900/40 dark:text-red-100">
              {part}
            </mark>
          ) : (
            part
          ),
        )}
      </>
    );
  };

  const selectedAuthorName = author
    ? authors.find((a) => a.id === author)?.nome || "Autor"
    : null;

  return (
    <main className="min-h-screen w-full bg-white text-gray-900 transition-colors duration-300 dark:bg-gray-950 dark:text-gray-100">
      <PortalSectionHeader
        eyebrow="Busca"
        title={
          query ? (
            <>
              Resultados para <span className="italic text-red-700">"{query}"</span>
            </>
          ) : category ? (
            <>
              Editoria <span className="italic text-red-700">{category}</span>
            </>
          ) : selectedAuthorName ? (
            <>
              Materias de <span className="italic text-red-700">{selectedAuthorName}</span>
            </>
          ) : (
            <>
              Explorando <span className="italic text-red-700">arquivos</span>
            </>
          )
        }
        description="Filtre o acervo editorial por editoria, autor e relevancia para encontrar rapidamente o que importa."
        badge={
          <div className="rounded-2xl border border-gray-200 bg-white px-4 py-3 text-right shadow-sm dark:border-gray-800 dark:bg-gray-900">
            <span className="block text-2xl font-black text-gray-950 dark:text-gray-50">{artigos.length}</span>
            <span className="text-[10px] font-black uppercase tracking-widest text-gray-500">Ocorrencias</span>
          </div>
        }
      >
        <nav className="mb-1 flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-gray-500">
          <Link href="/">Home</Link>
          <ChevronRight className="h-3 w-3" />
          <span className="text-red-700">Busca</span>
        </nav>

        <div className="flex flex-wrap items-center gap-3">
          {category && (
            <span className="rounded-full bg-red-700 px-3 py-1 text-[10px] font-black uppercase tracking-widest text-white">
              Editoria: {category}
            </span>
          )}
          {selectedAuthorName && (
            <span className="flex items-center gap-1.5 rounded-full bg-gray-900 px-3 py-1 text-[10px] font-black uppercase tracking-widest text-white dark:bg-white dark:text-gray-900">
              <User className="h-3 w-3" />
              {selectedAuthorName}
            </span>
          )}
        </div>
      </PortalSectionHeader>

      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-12 lg:flex-row">
          <Suspense fallback={<div className="h-96 w-72 rounded-2xl bg-gray-100 animate-pulse dark:bg-gray-900" />}>
            <SearchFilters
              categories={categories.map((c) => ({ id: c.id, nome: c.nome, slug: c.slug }))}
              authors={authors.filter((a) => !!a.nome).map((a) => ({ id: a.id, nome: a.nome! }))}
            />
          </Suspense>

          <div className="flex-1">
            {artigos.length === 0 ? (
              <div className="rounded-[2rem] border-2 border-dashed border-gray-200 bg-gray-50 py-24 text-center dark:border-gray-800 dark:bg-gray-900/20">
                <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-white shadow-sm dark:bg-gray-800">
                  <Search className="h-8 w-8 text-gray-300" />
                </div>
                <h3 className="text-2xl font-black uppercase tracking-tight text-gray-900 dark:text-gray-100">
                  Nenhuma pauta encontrada
                </h3>
                <p className="mx-auto mt-2 max-w-md text-gray-600 dark:text-gray-400">
                  Nao encontramos correspondencias para sua busca com os filtros selecionados.
                </p>
                <div className="mt-10 flex flex-wrap justify-center gap-4">
                  <Link
                    href="/"
                    className="rounded-xl bg-gray-900 px-8 py-3 text-xs font-black uppercase tracking-widest text-white transition-all active:scale-95 hover:scale-105 dark:bg-white dark:text-gray-900"
                  >
                    Ir para a home
                  </Link>
                  <Link
                    href="/busca"
                    className="rounded-xl bg-red-700 px-8 py-3 text-xs font-black uppercase tracking-widest text-white transition-all active:scale-95 hover:scale-105"
                  >
                    Limpar filtros
                  </Link>
                </div>
              </div>
            ) : (
              <div className="space-y-12">
                {artigos.map((art) => (
                  <article
                    key={art.id}
                    className="group relative flex flex-col gap-8 border-b border-gray-100 pb-12 last:border-0 last:pb-0 dark:border-gray-800 md:flex-row"
                  >
                    <Link
                      href={`/noticia/${art.slug}`}
                      className="relative h-48 flex-shrink-0 overflow-hidden rounded-xl border border-gray-200 bg-gray-100 dark:border-gray-800 dark:bg-gray-900 md:h-56 md:w-72 lg:w-80"
                    >
                      {art.image ? (
                        <Image
                          src={art.image}
                          alt={art.title}
                          fill
                          className="object-cover transition-transform duration-700 group-hover:scale-105"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center text-gray-200 transition-transform group-hover:scale-110 dark:text-gray-800">
                          <Search className="h-12 w-12" />
                        </div>
                      )}
                      {art.metadata?.categoria && (
                        <div className="absolute left-4 top-4 z-10">
                          <span className="rounded bg-red-700 px-3 py-1 text-[10px] font-black uppercase tracking-[0.2em] text-white shadow-xl">
                            {art.metadata.categoria}
                          </span>
                        </div>
                      )}
                    </Link>

                    <div className="flex flex-1 flex-col pt-1">
                      <div className="mb-4 flex items-center gap-4 text-[10px] font-black uppercase tracking-widest text-gray-400">
                        <div className="flex items-center gap-1.5">
                          <Calendar className="h-3 w-3 text-red-700" />
                          {art.date ? new Date(art.date).toLocaleDateString("pt-BR") : "Data indisponivel"}
                        </div>
                        <div className="flex items-center gap-1.5">
                          <User className="h-3 w-3 text-red-700" />
                          Por {art.metadata?.autor || "Redacao"}
                        </div>
                      </div>

                      <Link href={`/noticia/${art.slug}`}>
                        <h2 className="mb-4 line-clamp-3 text-2xl font-black leading-[1.1] text-gray-950 transition-colors duration-300 group-hover:text-red-700 dark:text-gray-100 md:text-3xl">
                          {highlight(art.title)}
                        </h2>
                      </Link>

                      {art.subtitle && (
                        <p className="mb-6 line-clamp-2 text-[15px] font-medium leading-relaxed text-gray-700 dark:text-gray-400 md:text-[17px]">
                          {highlight(art.subtitle)}
                        </p>
                      )}

                      <div className="mt-auto flex items-center gap-6">
                        <Link
                          href={`/noticia/${art.slug}`}
                          className="flex items-center gap-2 text-[11px] font-black uppercase tracking-widest text-red-700 group/btn"
                        >
                          Ler materia completa
                          <ChevronRight className="h-4 w-4 transition-transform group-hover/btn:translate-x-1" />
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
