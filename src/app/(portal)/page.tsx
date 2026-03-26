import { prisma } from "@/lib/prisma";
import Link from "next/link";
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import Image from "next/image"; 
import NewsletterForm from "@/components/portal/NewsletterForm";

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
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      
      {/* Manchetes Principais - Estilo G1/CNN */}
      <section className="mb-12 border-b-2 border-slate-200 pb-12">
        
        {featured.length > 0 ? (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
            
            {/* MANCHETE 1 (Giant) */}
            <div className="lg:col-span-8 flex flex-col">
              <Link href={`/noticia/${featured[0].slug}`} className="group flex flex-col items-start w-full">
                
                <div className="w-full aspect-video bg-slate-200 mb-5 relative overflow-hidden transition-all duration-500">
                  <div className="absolute inset-0 bg-slate-100 flex items-center justify-center group-hover:scale-105 transition-transform duration-700">
                    <svg className="w-16 h-16 text-slate-300" fill="currentColor" viewBox="0 0 24 24"><path d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                  </div>
                </div>

                {featured[0].categoria && (
                  <span className="text-[14px] font-black uppercase tracking-widest text-red-700 mb-2">
                    {featured[0].categoria.nome}
                  </span>
                )}
                
                <h1 className="text-[32px] md:text-[48px] font-black text-slate-900 leading-[1.05] tracking-tight group-hover:text-red-700 transition-colors mb-4 line-clamp-3">
                  {featured[0].titulo}
                </h1>
                
                {featured[0].resumo && (
                  <p className="text-[18px] md:text-[22px] text-slate-600 font-medium leading-snug mb-5 max-w-4xl line-clamp-2">
                    {featured[0].resumo}
                  </p>
                )}
                
                <div className="text-[13px] font-bold text-slate-400 uppercase tracking-widest mt-auto">
                  Por {featured[0].autor?.nome || "Redação"} &bull; {featured[0].data_publicacao!.toLocaleDateString("pt-BR")}
                </div>
              </Link>
            </div>

            {/* MANCHETES SECUNDÁRIAS (Stacked right side) */}
            <div className="lg:col-span-4 flex flex-col gap-6 lg:border-l border-slate-200 lg:pl-10">
              {featured.slice(1).map((art) => (
                <Link key={art.id} href={`/noticia/${art.slug}`} className="group flex flex-col items-start pb-6 border-b border-slate-200 last:border-0 last:pb-0">
                  
                  {art.categoria && (
                     <span className="text-[12px] font-black uppercase tracking-widest text-red-700 mb-2 block w-full">
                       {art.categoria.nome}
                     </span>
                  )}
                  
                  <h2 className="text-[24px] font-black text-slate-900 leading-tight group-hover:text-red-700 transition-colors mb-4 line-clamp-4">
                    {art.titulo}
                  </h2>
                  
                  <div className="w-full aspect-[16/9] bg-slate-100 mb-4 relative overflow-hidden group-hover:opacity-90 transition-opacity">
                    <div className="absolute inset-0 flex items-center justify-center">
                      <svg className="w-8 h-8 text-slate-300" fill="currentColor" viewBox="0 0 24 24"><path d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                    </div>
                  </div>

                  <div className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mt-auto">
                    {art.data_publicacao!.toLocaleDateString("pt-BR")}
                  </div>
                </Link>
              ))}
            </div>
            
          </div>
        ) : (
          <div className="py-24 text-center text-slate-500 bg-slate-50 border border-slate-200">
             <h3 className="text-xl font-bold text-slate-900">Nenhuma Pauta Aberta</h3>
             <p className="mt-2 text-slate-600">A equipe de jornalismo está apurando os próximos fatos.</p>
          </div>
        )}
      </section>

      {/* Seção de Newsletter (M1-PLUS-T3-ST3) */}
      <section className="mb-20">
        <NewsletterForm origem="home" />
      </section>

      {/* FEED DE NOTÍCIAS ("ÚLTIMAS" estilo Timeline de Portal) */}
      {recent.length > 0 && (
        <section>
          <div className="flex justify-between items-center bg-slate-100 px-5 py-3 border-l-[6px] border-red-700 mb-10">
            <h2 className="text-[20px] font-black text-slate-900 tracking-wide my-0 uppercase">
              As mais recentes e Plantão
            </h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10 gap-y-12">
            {recent.map((art) => (
              <Link key={art.id} href={`/noticia/${art.slug}`} className="group flex flex-col items-start h-full">
                
                <div className="w-full aspect-[4/3] bg-slate-100 overflow-hidden mb-4 border border-slate-200 group-hover:border-red-700 transition-colors duration-300">
                  <div className="w-full h-full flex items-center justify-center text-slate-300 transform group-hover:scale-105 transition-transform duration-500">
                    <svg className="w-10 h-10" fill="currentColor" viewBox="0 0 24 24"><path d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                  </div>
                </div>
                
                {art.categoria && (
                  <span className="text-[12px] font-bold uppercase tracking-widest text-red-700 mb-2 block w-full border-b-[2px] border-red-500/10 pb-2">
                    {art.categoria.nome}
                  </span>
                )}
                
                <h3 className="text-[22px] font-black text-slate-900 leading-[1.2] group-hover:text-red-700 transition-colors mb-3">
                  {art.titulo}
                </h3>
                
                {art.resumo && (
                  <p className="text-[16px] leading-snug text-slate-600 line-clamp-3 mb-4">
                    {art.resumo}
                  </p>
                )}
                
                <div className="mt-auto text-[11px] text-slate-500 font-bold tracking-widest uppercase">
                  {art.data_publicacao!.toLocaleDateString("pt-BR", { day: "2-digit", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit" })}
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

    </div>
  );
}
