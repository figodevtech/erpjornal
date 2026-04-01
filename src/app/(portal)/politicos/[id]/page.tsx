import { prisma } from "@/lib/prisma";
import { ArticleStatus } from "@/lib/types/article-status";
import { notFound } from "next/navigation";
import Link from "next/link";
import { UserCircle, Calendar, ArrowRight, MapPin } from "lucide-react";

export default async function PoliticoProfilePage({ params }: { params: { id: string } }) {
  const resolvedParams = await params;
  const id = resolvedParams.id;

  const politico = await prisma.politician.findUnique({
    where: { id },
    include: {
      artigos: {
        where: { status_id: ArticleStatus.publicado },
        orderBy: { created_at: "desc" },
        include: { categoria: true }
      }
    }
  });

  if (!politico) notFound();

  return (
    <div className="max-w-5xl mx-auto px-4 py-12 space-y-12 animate-in fade-in duration-700 transition-colors">
      {/* Bio Header */}
      <section className="bg-white dark:bg-gray-900/50 border border-gray-200 dark:border-gray-800 rounded-3xl p-8 shadow-sm flex flex-col md:flex-row gap-8 items-center md:items-start text-center md:text-left relative overflow-hidden group transition-all">
        <div className="absolute top-0 right-0 w-32 h-32 bg-gray-50 dark:bg-gray-800 rotate-45 trangray-x-16 -trangray-y-16 group-hover:bg-indigo-50 dark:group-hover:bg-indigo-900/20 transition-colors" />
        
        <div className="w-32 h-32 md:w-48 md:h-48 bg-gray-100 dark:bg-gray-800 rounded-2xl flex-shrink-0 flex items-center justify-center text-gray-300 dark:text-gray-700 relative z-10 border-4 border-white dark:border-gray-800 shadow-xl overflow-hidden">
           {politico.foto_url ? (
             <img src={politico.foto_url} alt={politico.nome} className="w-full h-full object-cover" />
           ) : (
             <UserCircle className="w-24 h-24" />
           )}
        </div>

        <div className="flex-1 space-y-4 relative z-10">
           <div className="space-y-1">
             <div className="flex flex-wrap items-center gap-2 justify-center md:justify-start">
               <span className="bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full border border-indigo-200 dark:border-indigo-800">
                 Perfil Político
               </span>
               <span className="bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full border border-gray-200 dark:border-gray-700">
                 {politico.partido}
               </span>
             </div>
             <h1 className="text-4xl md:text-5xl font-black text-gray-950 dark:text-gray-50 tracking-tight leading-none">
               {politico.nome}
             </h1>
             <p className="text-xl font-medium text-gray-700 dark:text-gray-400 italic">{politico.cargo}</p>
           </div>

           <div className="flex flex-wrap items-center gap-4 text-gray-600 dark:text-gray-400 text-sm py-2 justify-center md:justify-start">
             <div className="flex items-center gap-1.5 bg-gray-50 dark:bg-gray-800 px-3 py-1.5 rounded-xl border border-gray-200 dark:border-gray-700">
               <MapPin className="w-4 h-4 text-rose-500" />
               <span className="font-bold">{politico.regiao}{politico.estado ? ` - ${politico.estado}` : ""}</span>
             </div>
             <div className="flex items-center gap-1.5 bg-gray-50 dark:bg-gray-800 px-3 py-1.5 rounded-xl border border-gray-200 dark:border-gray-700">
               <Calendar className="w-4 h-4 text-indigo-500" />
               <span>Atualizado em {new Date(politico.updated_at).toLocaleDateString("pt-BR")}</span>
             </div>
           </div>

           <p className="text-gray-800 dark:text-gray-300 leading-relaxed max-w-2xl text-lg">
             {politico.biografia || "Nenhuma biografia disponível."}
           </p>
        </div>
      </section>

      {/* Articles History */}
      <section className="space-y-8">
        <div className="flex items-center gap-4">
          <h2 className="text-2xl font-black text-gray-950 dark:text-gray-50 tracking-tighter uppercase italic border-l-4 border-red-600 pl-4 bg-gray-100/50 dark:bg-gray-900/50 py-2 pr-8 rounded-r-xl">
            Histórico de Notícias
          </h2>
          <div className="flex-1 h-px bg-gray-200 dark:bg-gray-800" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {politico.artigos.map((artigo) => (
            <Link 
              key={artigo.id} 
              href={`/noticia/${artigo.slug}`}
              className="group bg-white dark:bg-gray-900/40 border border-gray-200 dark:border-gray-800 rounded-2xl p-6 shadow-sm hover:shadow-xl hover:trangray-y-[-4px] transition-all duration-300"
            >
              <div className="space-y-4">
                <span className="text-[10px] font-black text-indigo-600 dark:text-indigo-300 uppercase tracking-widest bg-indigo-50 dark:bg-indigo-900/20 px-2.5 py-1 rounded-full border border-indigo-100 dark:border-indigo-800">
                  {artigo.categoria?.nome || "Política"}
                </span>
                <h3 className="text-xl font-bold text-gray-950 dark:text-gray-100 group-hover:text-red-600 transition-colors leading-snug">
                  {artigo.titulo}
                </h3>
                <p className="text-gray-700 dark:text-gray-400 text-sm line-clamp-2 leading-relaxed">
                  {artigo.resumo}
                </p>
                <div className="flex items-center justify-between pt-4 border-t border-gray-100 dark:border-gray-800">
                  <span className="text-[11px] text-gray-500 dark:text-gray-500 font-medium">
                    {new Date(artigo.created_at).toLocaleDateString("pt-BR")}
                  </span>
                  <div className="text-indigo-600 font-bold text-xs flex items-center gap-1 group-hover:gap-2 transition-all">
                    Ler matéria completa <ArrowRight className="w-3 h-3" />
                  </div>
                </div>
              </div>
            </Link>
          ))}
          {politico.artigos.length === 0 && (
            <div className="col-span-full py-20 text-center bg-gray-50 dark:bg-gray-900/30 rounded-3xl border border-dashed border-gray-300 dark:border-gray-700">
               <UserCircle className="w-12 h-12 text-gray-300 dark:text-gray-700 mx-auto mb-4" />
               <p className="text-gray-600 dark:text-gray-400 font-medium italic">Nenhuma notícia vinculada a este político no momento.</p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}

