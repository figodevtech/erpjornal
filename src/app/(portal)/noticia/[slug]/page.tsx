import { notFound, permanentRedirect } from "next/navigation";
import Link from "next/link";
import { Metadata } from "next";
import Image from "next/image";

import { BadgeCheck, Crown } from "lucide-react";
import NewsletterForm from "@/components/portal/NewsletterForm";
import AdSlot, { hasActiveAds } from "@/components/portal/AdSlot";
import CorpoPremium from "@/components/portal/CorpoPremium";
import TTSPlayer from "@/components/portal/TTSPlayer";
import { ViewCounter } from "@/components/portal/ViewCounter";
import { obterVisualizacoes } from "@/lib/analytics/visualizacoes";
import { buscarArtigoPublicado, buscarSlugAtual } from "@/lib/data/artigos";
import { formatarData, formatarHora } from "@/lib/datas";
import { sanitizarHtmlArtigo } from "@/lib/html/sanitize";
import { dividirParaAnuncio, trechoInicial } from "@/lib/html/trechos";
import { absoluteUrl } from "@/lib/site-url";

// Página estática regenerada a cada 5 min (ISR). Nada aqui lê cookies/sessão:
// o acesso a matérias exclusivas é resolvido no navegador (CorpoPremium).
export const revalidate = 300;
// ISR por caminho: cada página é gerada na primeira visita e reaproveitada até a
// próxima revalidação (sem isto a rota renderiza a cada requisição).
export async function generateStaticParams() {
  return [];
}

/** Domínio legível de um link de fonte (sem quebrar a página se a URL for inválida). */
function dominioDe(url: string) {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return url;
  }
}

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  // Mesmo filtro da página: rascunhos e agendadas não podem vazar título/resumo.
  const artigo = await buscarArtigoPublicado(slug);

  if (!artigo) return { title: "Artigo não encontrado" };

  return {
    title: `${artigo.titulo} | Revista Gestão`,
    description: artigo.resumo || "Leia esta matéria na Revista Gestão.",
    openGraph: {
      title: artigo.titulo,
      description: artigo.resumo || "",
      type: "article",
      publishedTime: artigo.dataPublicacao?.toISOString(),
      url: absoluteUrl(`/noticia/${artigo.slug}`),
    }
  };
}

export default async function NoticiaPage({ params }: PageProps) {
  const { slug } = await params;

  // Só matérias publicadas e já no ar (agendadas ficam ocultas até a hora marcada).
  const artigo = await buscarArtigoPublicado(slug);

  if (!artigo) {
    // Slug alterado depois da publicação: 301 para o endereço atual (preserva SEO e links).
    const slugAtual = await buscarSlugAtual(slug);
    if (slugAtual) permanentRedirect(`/noticia/${slugAtual}`);
    notFound();
  }

  // Contagem de leituras (atualizada a cada regeneração da página).
  const realTimeViews = await obterVisualizacoes(artigo.id);
  // Defesa em profundidade: o HTML já é sanitizado ao gravar, e de novo ao exibir.
  const corpoTextoSanitizado = sanitizarHtmlArtigo(artigo.corpoTexto);

  const isPremium = artigo.ehPremium;
  // Matéria exclusiva: o HTML estático leva só o trecho inicial, nunca o corpo completo.
  const corpoPublico = isPremium ? null : dividirParaAnuncio(corpoTextoSanitizado);
  const adPageType = artigo.revistaId ? "revista" : "noticia";
  const isRevistaArticle = Boolean(artigo.revistaId);
  const hasLateralAds = await hasActiveAds(adPageType, "lateral");
  const shouldCreditRssImage =
    Boolean(artigo.urlImagemOg) &&
    Boolean(artigo.itemRss?.thumbnail) &&
    artigo.urlImagemOg === artigo.itemRss?.thumbnail;

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

      <div className="mx-auto w-full max-w-[1000px] px-4 pt-6 sm:px-6 lg:px-8">
        <AdSlot pagina={adPageType} posicao="topo" />
      </div>

      <div
        className={`mx-auto w-full gap-10 px-4 sm:px-6 lg:px-8 ${
          hasLateralAds
            ? "grid max-w-7xl xl:grid-cols-[minmax(0,1000px)_260px] xl:items-start"
            : "max-w-[1000px]"
        }`}
      >
      <article className="min-w-0 pt-8 font-serif md:pt-14">
        
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
                {artigo.dataPublicacao && (
                  <time
                    dateTime={artigo.dataPublicacao.toISOString()}
                    className="article-meta text-[13px] font-black uppercase tracking-widest flex items-center gap-2 mt-1"
                  >
                    {/* Horário de Brasília: o servidor (Vercel) roda em UTC. */}
                    {formatarData(artigo.dataPublicacao, { day: "2-digit", month: "long", year: "numeric" })} às{" "}
                    {formatarHora(artigo.dataPublicacao)}
                  </time>
                )}
                {artigo.autorExterno && (
                  <p className="mt-2 flex items-center gap-2 text-[13px] font-bold uppercase tracking-tight text-black dark:text-gray-100">
                    <span className="rounded bg-gray-200 px-2 py-0.5 text-[11px] text-black dark:bg-gray-800 dark:text-gray-100">
                      Fonte Original:
                    </span>
                    <span className="font-black text-black dark:text-white">
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
        {corpoPublico && (
          <div className="max-w-[760px] mx-auto font-sans">
            <TTSPlayer htmlContent={corpoTextoSanitizado} title={artigo.titulo} />
          </div>
        )}

        {/* Hero Image */}
        <figure className="mb-12 w-full">
          <div className="group relative aspect-video overflow-hidden border border-gray-300 bg-gray-100 transition-all dark:border-gray-800 dark:bg-gray-900 md:aspect-[21/9]">
            {artigo.urlImagemOg ? (
              <Image 
                src={artigo.urlImagemOg} 
                alt={artigo.titulo}
                fill
                sizes="(max-width: 768px) 100vw, 1000px"
                className="object-cover transition-transform duration-1000 group-hover:scale-105"
                priority
              />
            ) : (
              <div className="absolute inset-0 flex items-center justify-center bg-gray-100/50 text-gray-400 dark:bg-gray-900/50 dark:text-gray-700">
                 <svg className="w-16 h-16 transform group-hover:scale-110 transition-transform duration-500" fill="currentColor" viewBox="0 0 24 24"><path d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
              </div>
            )}
          </div>
          {shouldCreditRssImage && (
            <figcaption className="mt-2 font-sans text-[11px] font-bold uppercase tracking-widest text-gray-500 dark:text-gray-400">
              Imagem: {artigo.itemRss?.source.name}
            </figcaption>
          )}
        </figure>

        <div className="mb-12 font-sans">
          <AdSlot pagina={adPageType} posicao="apos_imagem" />
        </div>

        {/* Corpo do Texto */}
        <div className={`
          article-prose
          w-full max-w-[760px] mx-auto 
          prose prose-gray dark:prose-invert prose-lg md:prose-xl
          prose-p:text-gray-950 dark:prose-p:text-gray-100 prose-p:leading-[1.8] prose-p:mb-7
          prose-li:text-gray-950 dark:prose-li:text-gray-100
          prose-strong:text-gray-950 dark:prose-strong:text-gray-50
          prose-em:text-gray-900 dark:prose-em:text-gray-100
          prose-h2:text-gray-950 dark:prose-h2:text-gray-100 prose-h2:font-black prose-h2:mt-12 prose-h2:mb-6
          prose-blockquote:border-red-700 prose-blockquote:italic prose-blockquote:text-gray-800 dark:prose-blockquote:text-gray-200
          prose-a:text-red-700 prose-a:no-underline hover:prose-a:underline
          ${isRevistaArticle ? "[&_p]:text-justify [&_p]:hyphens-auto [&_p]:leading-[1.9] [&_p]:tracking-normal" : ""}
        `}>
          {corpoPublico ? (
            <>
              <div dangerouslySetInnerHTML={{ __html: corpoPublico.antes }} />
              <div className="not-prose my-12 font-sans">
                <AdSlot pagina={adPageType} posicao="meio" />
              </div>
              {corpoPublico.depois && <div dangerouslySetInnerHTML={{ __html: corpoPublico.depois }} />}
            </>
          ) : (
            <CorpoPremium
              slug={artigo.slug}
              titulo={artigo.titulo}
              trechoHtml={trechoInicial(corpoTextoSanitizado)}
              anuncioMeio={<AdSlot pagina={adPageType} posicao="meio" />}
            />
          )}
        </div>

        {artigo.checagensFato.length > 0 && (
          <aside
            className="mx-auto mt-12 w-full max-w-[760px] rounded-2xl border border-emerald-200 bg-emerald-50 p-6 font-sans dark:border-emerald-900 dark:bg-emerald-950/40"
            aria-label="Checagem de fatos"
          >
            <p className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-emerald-800 dark:text-emerald-300">
              <BadgeCheck className="h-4 w-4" /> Fatos checados
            </p>
            <ul className="mt-3 space-y-1.5 text-sm text-emerald-900 dark:text-emerald-100">
              {artigo.checagensFato.flatMap((checagem) =>
                [checagem.urlFonte, checagem.urlDocumento]
                  .filter((url): url is string => Boolean(url))
                  .map((url) => (
                    <li key={`${checagem.id}-${url}`} className="truncate">
                      <a href={url} target="_blank" rel="noopener noreferrer nofollow" className="underline underline-offset-2">
                        {dominioDe(url)}
                      </a>
                    </li>
                  ))
              )}
            </ul>
          </aside>
        )}

        {(artigo.tags.length > 0 || artigo.artigosPoliticos.length > 0) && (
          <div className="mx-auto mt-12 w-full max-w-[760px] space-y-6 font-sans">
            {artigo.artigosPoliticos.length > 0 && (
              <section aria-labelledby="citados-na-materia">
                <h2 id="citados-na-materia" className="mb-3 text-xs font-black uppercase tracking-widest text-gray-500">
                  Citados nesta matéria
                </h2>
                <ul className="flex flex-wrap gap-2">
                  {artigo.artigosPoliticos.map(({ politico, papel }) => (
                    <li key={politico.slug}>
                      <Link
                        href={`/politico/${politico.slug}`}
                        className="inline-flex flex-col rounded-lg border border-gray-200 px-3 py-2 transition-colors hover:border-red-700 dark:border-gray-800"
                      >
                        <span className="text-sm font-bold">{politico.nome}</span>
                        {(papel || politico.cargo) && (
                          <span className="text-xs text-gray-500 dark:text-gray-400">{papel || politico.cargo}</span>
                        )}
                      </Link>
                    </li>
                  ))}
                </ul>
              </section>
            )}
            {artigo.tags.length > 0 && (
              <nav aria-label="Tags da matéria">
                <ul className="flex flex-wrap gap-2">
                  {artigo.tags.map(({ tag }) => (
                    <li key={tag.slug}>
                      <Link
                        href={`/tag/${tag.slug}`}
                        className="inline-block rounded-full bg-gray-100 px-3 py-1 text-xs font-bold uppercase tracking-wider text-gray-700 transition-colors hover:bg-red-700 hover:text-white dark:bg-gray-900 dark:text-gray-300"
                      >
                        #{tag.nome}
                      </Link>
                    </li>
                  ))}
                </ul>
              </nav>
            )}
          </div>
        )}

        <div className="mt-12 w-full max-w-[760px] mx-auto font-sans">
          <AdSlot pagina={adPageType} posicao="feed" />
        </div>

        {/* Newsletter CTA at the end of artigo (M1-PLUS-T3-ST3) */}
        <div className="mt-16 w-full max-w-[760px] mx-auto font-sans">
          <NewsletterForm origem={`noticia_${artigo.slug}`} />
        </div>

        {/* View Counter Client Injector (M3-PLUS-T1-ST2) */}
        <ViewCounter slug={artigo.slug} />

      </article>

      {hasLateralAds && (
        <aside className="hidden space-y-8 pt-14 xl:block">
          <AdSlot pagina={adPageType} posicao="lateral" />
        </aside>
      )}
      </div>
    </div>
  );
}

