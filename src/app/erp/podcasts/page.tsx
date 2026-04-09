import Link from "next/link";
import { Calendar, Clock, Mic, Plus, Tag } from "lucide-react";

import { exigirAlgumaPermissao, temPermissao } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export default async function PodcastsERPPage() {
  const session = await exigirAlgumaPermissao(["podcasts:ler", "podcasts:criar", "podcasts:editar"]);
  const podeCriar = temPermissao(session, "podcasts:criar");
  const podeEditar = temPermissao(session, "podcasts:editar");

  const episodes = await (prisma as any).podcastEpisode.findMany({
    orderBy: { dataPub: "desc" },
  });

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-gray-900">Podcast: Podcasts</h1>
          <p className="mt-1 text-sm text-gray-500">{episodes.length} episodios no total.</p>
        </div>
        {podeCriar && (
          <Link
            href="/erp/podcasts/novo"
            className="flex items-center gap-2 rounded-xl bg-purple-600 px-5 py-2.5 text-sm font-bold text-white shadow-md transition-all hover:bg-purple-500"
          >
            <Plus className="h-4 w-4" />
            Novo Episodio
          </Link>
        )}
      </div>

      <div className="grid grid-cols-1 gap-4">
        {episodes.map((ep: any) => (
          <div
            key={ep.id}
            className="group flex items-center gap-6 rounded-2xl border border-gray-200 bg-white p-5 transition-all hover:shadow-md"
          >
            <div className="flex h-16 w-16 items-center justify-center rounded-xl bg-purple-100">
              {ep.urlCapa ? (
                <img src={ep.urlCapa} alt={ep.titulo} className="h-full w-full rounded-xl object-cover" />
              ) : (
                <Mic className="h-8 w-8 text-purple-600" />
              )}
            </div>

            <div className="min-w-0 flex-1">
              <div className="mb-1 flex items-center gap-2">
                <span
                  className={`rounded border px-2 py-0.5 text-[10px] font-bold uppercase ${
                    ep.status === "published"
                      ? "border-green-200 bg-green-50 text-green-700"
                      : "border-gray-200 bg-gray-50 text-gray-400"
                  }`}
                >
                  {ep.status}
                </span>
                <span className="text-gray-300">·</span>
                <span className="flex items-center gap-1 text-[10px] text-gray-400">
                  <Calendar className="h-3 w-3" /> {new Date(ep.dataPub).toLocaleDateString("pt-BR")}
                </span>
              </div>
              <h3 className="truncate font-bold text-gray-900 transition-colors group-hover:text-purple-600">
                {ep.titulo}
              </h3>
              <div className="mt-2 flex items-center gap-4 text-[11px] text-gray-400">
                <span className="flex items-center gap-1">
                  <Clock className="h-3 w-3" /> {Math.floor((ep.duracao || 0) / 60)} min
                </span>
                <span className="flex items-center gap-1">
                  <Tag className="h-3 w-3" /> {ep.tags.slice(0, 3).join(", ")}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {podeEditar && (
                <Link href={`/erp/podcasts/${ep.id}/editar`} className="p-2 text-xs font-bold text-purple-600 hover:text-purple-700">
                  Editar
                </Link>
              )}
            </div>
          </div>
        ))}

        {episodes.length === 0 && (
          <div className="rounded-3xl border-2 border-dashed border-gray-200 bg-gray-50/50 py-20 text-center">
            <Mic className="mx-auto mb-4 h-12 w-12 text-gray-200" />
            <p className="font-medium text-gray-400">Nenhum episodio de podcast ainda.</p>
          </div>
        )}
      </div>
    </div>
  );
}
