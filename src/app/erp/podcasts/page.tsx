import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { Mic, Play, Plus, Clock, Tag, Calendar } from "lucide-react";

export default async function PodcastsERPPage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/api/auth/signin");

  const episodes = await (prisma as any).podcastEpisode.findMany({
    orderBy: { data_pub: "desc" },
  });

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Podcast: Podcasts</h1>
          <p className="text-sm text-gray-500 mt-1">
            {episodes.length} episódios no total.
          </p>
        </div>
        <Link
          href="/erp/podcasts/novo"
          className="flex items-center gap-2 bg-purple-600 text-white font-bold px-5 py-2.5 rounded-xl hover:bg-purple-500 transition-all shadow-md text-sm"
        >
          <Plus className="w-4 h-4" />
          Novo Episódio
        </Link>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {episodes.map((ep: any) => (
          <div key={ep.id} className="bg-white border border-gray-200 rounded-2xl p-5 hover:shadow-md transition-all flex items-center gap-6 group">
            <div className="w-16 h-16 rounded-xl bg-purple-100 flex items-center justify-center shrink-0">
               {ep.capa_url ? (
                 <img src={ep.capa_url} alt={ep.titulo} className="w-full h-full object-cover rounded-xl" />
               ) : (
                 <Mic className="w-8 h-8 text-purple-600" />
               )}
            </div>
            
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded border ${ep.status === "published" ? "bg-green-50 text-green-700 border-green-200" : "bg-gray-50 text-gray-400 border-gray-200"}`}>
                  {ep.status}
                </span>
                <span className="text-gray-300">·</span>
                <span className="text-[10px] text-gray-400 flex items-center gap-1">
                   <Calendar className="w-3 h-3" /> {new Date(ep.data_pub).toLocaleDateString("pt-BR")}
                </span>
              </div>
              <h3 className="font-bold text-gray-900 group-hover:text-purple-600 transition-colors truncate">{ep.titulo}</h3>
              <div className="flex items-center gap-4 mt-2 text-[11px] text-gray-400">
                 <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3" /> {Math.floor((ep.duracao || 0) / 60)} min
                 </span>
                 <span className="flex items-center gap-1">
                    <Tag className="w-3 h-3" /> {ep.tags.slice(0, 3).join(", ")}
                 </span>
              </div>
            </div>

            <div className="flex items-center gap-2">
               <Link href={`/erp/podcasts/${ep.id}/editar`} className="text-xs font-bold text-purple-600 hover:text-purple-700 p-2">
                 Editar
               </Link>
            </div>
          </div>
        ))}

        {episodes.length === 0 && (
          <div className="py-20 text-center rounded-3xl border-2 border-dashed border-gray-200 bg-gray-50/50">
             <Mic className="w-12 h-12 text-gray-200 mx-auto mb-4" />
             <p className="text-gray-400 font-medium">Nenhum episódio de podcast ainda.</p>
          </div>
        )}
      </div>
    </div>
  );
}

