import { prisma } from "@/lib/prisma";
import Link from "next/link";

/**
 * REGRAS DE PERFORMANCE DA VERCEL APLICADAS:
 * 1. ISR (Incremental Static Regeneration): Home page revalida de 60 em 60s, custando ZERO recursos de BD por minuto.
 * 2. Payload Optimizer: Extração do corpo_texto ignorada intencionalmente na query da listagem.
 * 3. Waterfall Eliminator: A home consome o banco diretamente de forma unificada no layout principal.
 */
export const revalidate = 60;

export default async function PortalHome() {
  const articles = await prisma.article.findMany({
    where: {
      status_id: "publicado",
      data_publicacao: { lte: new Date() }
    },
    orderBy: { data_publicacao: "desc" },
    take: 15,
    select: {
      id: true,
      titulo: true,
      resumo: true,
      slug: true,
      data_publicacao: true,
      og_image_url: true,
      categoria: {
        select: { nome: true, cor: true }
      },
      autor: {
        select: { nome: true }
      }
    }
  });

  const featured = articles.slice(0, 3);
  const recent = articles.slice(3);

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      
      {/* SEÇÃO DE DESTAQUES (M1-MVP-T2-ST1) */}
      <section className="mb-16">
        <h2 className="text-2xl font-extrabold text-slate-900 mb-6 flex items-center gap-2">
           <span className="w-2 h-6 bg-indigo-600 rounded-full shadow-[0_0_10px_rgba(79,70,229,0.5)]"></span> 
           Principais Destaques
        </h2>
        {featured.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
            
            {/* Notícia Principal (Hero Layout Premium) */}
            <Link href={`/noticia/${featured[0].slug}`} className="group relative block md:col-span-8 rounded-2xl overflow-hidden shadow-md ring-1 ring-slate-200/50 aspect-[16/10] md:aspect-auto md:h-[500px] transition-transform duration-300 hover:shadow-xl hover:-translate-y-1">
              {/* Background Layer Simulando Imagem */}
              <div className="absolute inset-0 bg-slate-200 flex items-center justify-center">
                 <svg className="w-24 h-24 text-slate-300 transform -rotate-12" fill="currentColor" viewBox="0 0 24 24"><path d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
              </div>
              <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/40 to-transparent transition-opacity group-hover:via-slate-900/50"></div>
              
              <div className="absolute bottom-0 p-6 md:p-8 w-full">
                {/* Badge da Categoria (M1-MVP-T2-ST3) */}
                {featured[0].categoria && (
                  <span className="inline-block px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-indigo-600 text-white mb-4 shadow-sm border border-indigo-500">
                    {featured[0].categoria.nome}
                  </span>
                )}
                <h3 className="text-2xl md:text-4xl font-extrabold text-white leading-tight mb-3 transition-colors group-hover:text-indigo-100 drop-shadow-md">
                  {featured[0].titulo}
                </h3>
                {featured[0].resumo && <p className="text-slate-200 text-sm md:text-lg line-clamp-2 md:line-clamp-3 max-w-3xl font-medium drop-shadow-sm">{featured[0].resumo}</p>}
                
                <div className="mt-5 flex items-center text-xs text-slate-300 gap-4 font-semibold uppercase tracking-wide">
                  {featured[0].autor?.nome && <span>{featured[0].autor.nome}</span>}
                  <span className="w-1.5 h-1.5 rounded-full bg-slate-500"></span>
                  <time>{featured[0].data_publicacao!.toLocaleDateString("pt-BR")}</time>
                </div>
              </div>
            </Link>

            {/* Hub Lateral - Notícias Secundárias (Bento Grid Style) */}
            <div className="md:col-span-4 flex flex-col gap-6">
              {featured.slice(1).map((art) => (
                <Link key={art.id} href={`/noticia/${art.slug}`} className="group relative block rounded-2xl overflow-hidden shadow-sm ring-1 ring-slate-200/50 flex-1 aspect-[16/9] md:aspect-auto transition-all duration-300 hover:shadow-lg hover:-translate-y-1">
                   <div className="absolute inset-0 bg-slate-200 flex items-center justify-center">
                     <svg className="w-12 h-12 text-slate-300" fill="currentColor" viewBox="0 0 24 24"><path d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                   </div>
                   <div className="absolute inset-0 bg-gradient-to-t from-slate-900/95 to-slate-900/10"></div>
                   
                   <div className="absolute bottom-0 p-5 w-full">
                    {art.categoria && (
                      <span className="inline-block px-2.5 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-slate-800/80 backdrop-blur-md text-slate-100 border border-slate-600 mb-3">
                        {art.categoria.nome}
                      </span>
                    )}
                    <h3 className="text-lg md:text-xl font-bold text-white leading-snug group-hover:text-indigo-200 transition-colors drop-shadow-sm">
                      {art.titulo}
                    </h3>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        ) : (
          <div className="py-24 text-center text-slate-500 bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200">
            <svg className="mx-auto h-12 w-12 text-slate-300 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" /></svg>
            <h3 className="text-sm font-semibold text-slate-900">Nenhum artigo publicado</h3>
            <p className="mt-1 text-sm text-slate-500">As publicações recentes da redação aparecerão aqui em breve.</p>
          </div>
        )}
      </section>

      {/* SEÇÃO RECENTES (M1-MVP-T2-ST2) - Padrão de Legibilidade UX-Pro-Max */}
      {recent.length > 0 && (
        <section>
          <div className="flex justify-between items-end border-b-2 border-slate-100 pb-4 mb-8">
            <h2 className="text-2xl font-extrabold text-slate-900 flex items-center gap-2">
              Últimas Notícias
            </h2>
            <Link href="/" className="text-sm font-bold text-indigo-600 hover:text-indigo-800 transition-colors uppercase tracking-wide">
              Arquivo Completo &rarr;
            </Link>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-12">
            {recent.map((art) => (
              <Link key={art.id} href={`/noticia/${art.slug}`} className="group flex flex-col items-start h-full">
                <div className="w-full aspect-[16/10] bg-slate-100 rounded-xl overflow-hidden mb-5 relative ring-1 ring-slate-900/5 shadow-sm transition-transform duration-300 group-hover:scale-[1.02]">
                  <div className="absolute inset-0 flex items-center justify-center text-slate-300">
                    <svg className="w-10 h-10" fill="currentColor" viewBox="0 0 24 24"><path d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                  </div>
                </div>
                
                {art.categoria && (
                  <span className="text-[11px] font-black uppercase tracking-widest text-indigo-600 mb-3">
                    {art.categoria.nome}
                  </span>
                )}
                
                <h3 className="text-[22px] font-bold text-slate-900 leading-tight group-hover:text-indigo-600 transition-colors line-clamp-3 mb-3">
                  {art.titulo}
                </h3>
                
                {art.resumo && <p className="text-[15px] leading-relaxed text-slate-600 line-clamp-2 mb-4 flex-grow">{art.resumo}</p>}
                
                <div className="mt-auto flex items-center text-[13px] text-slate-500 font-medium">
                  <time>{art.data_publicacao!.toLocaleDateString("pt-BR")}</time>
                  {art.autor && <><span className="mx-2 text-slate-300">&bull;</span><span>{art.autor.nome}</span></>}
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

    </div>
  );
}
