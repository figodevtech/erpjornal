import NewsletterForm from "@/components/portal/NewsletterForm";
import { prisma } from "@/lib/prisma";
import { ArticleStatus } from "@/lib/types/article-status";
import Image from "next/image";
import Link from "next/link";

export const revalidate = 60;

export default async function PortalHome() {
  const artigosBrutos = await prisma.artigo.findMany({
    where: {
      status: ArticleStatus.publicado,
      OR: [
        { dataPublicacao: { lte: new Date(Date.now() + 60000) } },
        { dataPublicacao: null },
      ],
    },
    orderBy: { criadoEm: "desc" },
    take: 30,
    select: {
      id: true,
      titulo: true,
      resumo: true,
      slug: true,
      dataPublicacao: true,
      criadoEm: true,
      urlImagemOg: true,
      categoria: {
        select: { nome: true, cor: true },
      },
      autor: {
        select: { nome: true },
      },
    },
  });

  const artigos = artigosBrutos
    .map((artigo) => ({
      ...artigo,
      dataExibicao: artigo.dataPublicacao ?? artigo.criadoEm,
    }))
    .sort((a, b) => b.dataExibicao.getTime() - a.dataExibicao.getTime())
    .slice(0, 15);

  const featured = artigos.slice(0, 3);
  const recent = artigos.slice(3);

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <section className="mb-12 border-b-2 border-gray-200 pb-12 dark:border-gray-800">
        {featured.length > 0 ? (
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-12 lg:gap-12">
            <div className="flex flex-col lg:col-span-8">
              <Link href={`/noticia/${featured[0].slug}`} className="group flex w-full flex-col items-start">
                <div className="relative mb-5 aspect-video w-full overflow-hidden border border-gray-200 bg-gray-200 transition-all duration-500 dark:border-gray-800 dark:bg-gray-800">
                  {featured[0].urlImagemOg ? (
                    <Image
                      src={featured[0].urlImagemOg}
                      alt={featured[0].titulo}
                      fill
                      sizes="(max-width: 768px) 100vw, 800px"
                      className="object-cover transition-transform duration-700 group-hover:scale-105"
                      priority
                    />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center bg-gray-100 transition-transform duration-700 group-hover:scale-105 dark:bg-gray-900">
                      <svg className="h-16 w-16 text-gray-300 dark:text-gray-700" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </div>
                  )}
                </div>

                {featured[0].categoria && (
                  <span className="mb-2 text-[14px] font-black uppercase tracking-widest text-red-700">
                    {featured[0].categoria.nome}
                  </span>
                )}

                <h1 className="card-headline mb-4 line-clamp-3 text-[32px] font-black leading-[1.05] tracking-tight transition-colors duration-500 md:text-[48px]">
                  {featured[0].titulo}
                </h1>

                {featured[0].resumo && (
                  <p className="portal-summary mb-5 max-w-4xl line-clamp-2 text-[18px] font-semibold leading-snug md:text-[22px]">
                    {featured[0].resumo}
                  </p>
                )}

                <div className="mt-auto text-[13px] font-bold uppercase tracking-widest text-gray-800 dark:text-gray-400">
                  Por {featured[0].autor?.nome || "Redacao"} • {featured[0].dataExibicao.toLocaleDateString("pt-BR")}
                </div>
              </Link>
            </div>

            <div className="flex flex-col gap-6 lg:col-span-4 lg:border-l lg:border-gray-200 lg:pl-10 dark:lg:border-gray-800">
              {featured.slice(1).map((art) => (
                <Link
                  key={art.id}
                  href={`/noticia/${art.slug}`}
                  className="group flex flex-col items-start border-b border-gray-200 pb-6 last:border-0 last:pb-0 dark:border-gray-800"
                >
                  {art.categoria && (
                    <span className="mb-2 block w-full text-[12px] font-black uppercase tracking-widest text-red-700">
                      {art.categoria.nome}
                    </span>
                  )}

                  <h2 className="card-headline mb-4 line-clamp-4 text-[24px] font-black leading-tight transition-colors duration-500">
                    {art.titulo}
                  </h2>

                  <div className="relative mb-4 aspect-[16/9] w-full overflow-hidden border border-gray-200 bg-gray-100 transition-opacity group-hover:opacity-90 dark:border-gray-800 dark:bg-gray-900">
                    {art.urlImagemOg ? (
                      <Image
                        src={art.urlImagemOg}
                        alt={art.titulo}
                        fill
                        sizes="(max-width: 768px) 100vw, 400px"
                        className="object-cover transition-transform duration-700 group-hover:scale-105"
                      />
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <svg className="h-8 w-8 text-gray-300 dark:text-gray-700" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                      </div>
                    )}
                  </div>

                  <div className="mt-auto text-[11px] font-bold uppercase tracking-widest text-gray-800 dark:text-gray-500">
                    {art.dataExibicao.toLocaleDateString("pt-BR")}
                  </div>
                </Link>
              ))}
            </div>
          </div>
        ) : (
          <div className="border border-gray-200 bg-gray-50 py-24 text-center text-gray-500 dark:border-gray-800 dark:bg-gray-900/50">
            <h3 className="text-xl font-bold text-gray-900 dark:text-gray-50">Nenhuma pauta aberta</h3>
            <p className="mt-2 text-gray-700 dark:text-gray-300">
              A equipe de jornalismo esta apurando os proximos fatos.
            </p>
          </div>
        )}
      </section>

      <section className="mb-20">
        <NewsletterForm origem="home" />
      </section>

      {recent.length > 0 && (
        <section>
          <div className="mb-10 flex items-center justify-between border-l-[6px] border-red-700 bg-gray-100 px-5 py-3 dark:bg-gray-900">
            <h2 className="my-0 text-[20px] font-black uppercase tracking-wide text-gray-900 dark:text-gray-100">
              As mais recentes e plantao
            </h2>
          </div>

          <div className="grid grid-cols-1 gap-10 gap-y-12 md:grid-cols-2 lg:grid-cols-3">
            {recent.map((art) => (
              <Link key={art.id} href={`/noticia/${art.slug}`} className="group flex h-full flex-col items-start">
                <div className="relative mb-4 aspect-[4/3] w-full overflow-hidden border border-gray-200 bg-gray-100 transition-colors duration-300 group-hover:border-red-700 dark:border-gray-800 dark:bg-gray-900">
                  {art.urlImagemOg ? (
                    <Image
                      src={art.urlImagemOg}
                      alt={art.titulo}
                      fill
                      sizes="(max-width: 768px) 100vw, 300px"
                      className="object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-gray-300 transition-transform duration-500 group-hover:scale-105 dark:text-gray-700">
                      <svg className="h-10 w-10" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </div>
                  )}
                </div>

                {art.categoria && (
                  <div className="mb-4 flex items-center gap-2">
                    <span className="rounded-sm border border-red-900 bg-red-800 px-3 py-1 text-[11px] font-black uppercase tracking-widest text-white dark:border-red-900/30 dark:bg-red-700/80">
                      {art.categoria.nome}
                    </span>
                  </div>
                )}

                <h3 className="card-headline mb-3 text-[22px] font-black leading-[1.2] transition-colors duration-500">
                  {art.titulo}
                </h3>

                {art.resumo && (
                  <p className="portal-summary mb-4 line-clamp-3 text-[16px] font-medium leading-snug">
                    {art.resumo}
                  </p>
                )}

                <div className="mt-auto text-[11px] font-bold uppercase tracking-widest text-gray-800 dark:text-gray-400">
                  {art.dataExibicao.toLocaleDateString("pt-BR", {
                    day: "2-digit",
                    month: "long",
                    year: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
