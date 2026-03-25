import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { Mic, Play, Clock, ChevronRight } from "lucide-react";

export const metadata = {
  title: "Podcasts | Revista Gestão",
  description: "Ouça as principais análises e notícias políticas da semana em nosso podcast oficial.",
};

export default async function PodcastsPage() {
  const episodes = await (prisma as any).podcastEpisode.findMany({
    where: { status: "published" },
    orderBy: { data_pub: "desc" },
  });

  return (
    <main className="max-w-4xl mx-auto px-4 py-12 md:py-20 animate-in fade-in duration-700">
      <div className="mb-16 text-center">
        <span className="text-[11px] font-black uppercase tracking-[0.3em] text-red-700 mb-3 block">Multiformatos</span>
        <h1 className="text-5xl md:text-7xl font-black tracking-tighter text-slate-900 leading-none">RG<span className="text-red-700">.</span>Podcasts</h1>
        <p className="text-slate-500 mt-6 text-lg max-w-xl mx-auto font-medium">As análises de bastidores que você já lê, agora para ouvir em qualquer lugar.</p>
      </div>

      <div className="space-y-6">
        {episodes.map((ep: any) => (
          <Link
            key={ep.id}
            href={`/podcasts/${ep.slug}`}
            className="group flex flex-col md:flex-row gap-6 p-6 bg-white border-b-2 md:border-b-0 md:rounded-3xl md:border-2 border-slate-100 hover:border-red-700/30 hover:bg-slate-50 transition-all"
          >
            {/* Capa */}
            <div className="w-full md:w-32 h-32 md:rounded-2xl bg-slate-900 flex items-center justify-center shrink-0 overflow-hidden relative shadow-lg">
               {ep.capa_url ? (
                 <img src={ep.capa_url} alt={ep.titulo} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
               ) : (
                 <Mic className="w-10 h-10 text-white opacity-40" />
               )}
               <div className="absolute inset-0 bg-red-700/0 group-hover:bg-red-700/20 transition-all flex items-center justify-center">
                  <Play className="w-0 h-0 group-hover:w-10 group-hover:h-10 text-white fill-white transition-all duration-300 drop-shadow-md" />
               </div>
            </div>

            <div className="flex-1 flex flex-col justify-center">
               <div className="flex flex-wrap items-center gap-2 mb-2">
                 <span className="text-[10px] font-black uppercase tracking-widest text-red-700 bg-red-50 border border-red-100 px-2 py-0.5 rounded-full">
                    S{Math.floor(Math.random()*10) + 1}E{Math.floor(Math.random()*20) + 1}
                 </span>
                 <span className="text-slate-300">·</span>
                 <span className="text-[10px] font-bold text-slate-400 flex items-center gap-1 uppercase tracking-widest">
                    <Clock className="w-3 h-3" /> {Math.floor((ep.duracao || 0) / 60)} MIN
                 </span>
                 <span className="text-slate-300">·</span>
                 <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                    {new Date(ep.data_pub).toLocaleDateString("pt-BR", { day:'numeric', month:'long' })}
                 </span>
               </div>
               <h2 className="text-xl md:text-2xl font-black text-slate-900 group-hover:tracking-tight transition-all mb-2 leading-tight">
                 {ep.titulo}
               </h2>
               <p className="text-sm text-slate-500 line-clamp-2 md:line-clamp-1 leading-relaxed">
                 {ep.descricao}
               </p>
            </div>

            <div className="self-end md:self-center">
               <div className="w-12 h-12 rounded-full border-2 border-slate-100 flex items-center justify-center group-hover:border-red-700 group-hover:bg-red-700 transition-all">
                  <ChevronRight className="w-6 h-6 text-slate-300 group-hover:text-white" />
               </div>
            </div>
          </Link>
        ))}

        {episodes.length === 0 && (
          <div className="py-20 text-center text-slate-400 bg-slate-50 rounded-3xl border-2 border-dashed border-slate-200">
             <h3 className="text-xl font-bold">Nenhum episódio disponível</h3>
             <p className="mt-2 text-sm">Estamos preparando as próximas análises. Volte em breve.</p>
          </div>
        )}
      </div>
    </main>
  );
}
