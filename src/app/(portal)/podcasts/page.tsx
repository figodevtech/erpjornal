import PortalSectionHeader from "@/components/portal/PortalSectionHeader";
import { isModuleEnabled } from "@/lib/config/modules";
import { prisma } from "@/lib/prisma";
import { Clock, Mic, Play } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";

export const metadata = {
  title: "Podcasts | Revista Gestao",
  description: "Ouça as principais analises e noticias politicas da semana em nosso podcast oficial.",
};

export default async function PodcastsPage() {
  if (!isModuleEnabled("podcasts")) {
    notFound();
  }

  const episodes = await (prisma as any).podcastEpisode.findMany({
    where: { status: "published" },
    orderBy: { dataPub: "desc" },
  });

  return (
    <main className="mx-auto max-w-4xl px-4 py-12 md:py-16">
      <PortalSectionHeader
        eyebrow="Multiformatos"
        title={
          <>
            RG<span className="text-red-700">.</span>Podcasts
          </>
        }
        description="As analises de bastidores que voce ja le, agora para ouvir em qualquer lugar."
        badge={
          <div className="rounded-2xl border border-gray-200 bg-white px-4 py-3 text-right shadow-sm dark:border-gray-800 dark:bg-gray-900">
            <span className="block text-2xl font-black text-gray-950 dark:text-gray-50">{episodes.length}</span>
            <span className="text-[10px] font-black uppercase tracking-widest text-gray-500">Episodios</span>
          </div>
        }
      />

      <div className="mt-10 space-y-6">
        {episodes.map((ep: any, index: number) => (
          <Link
            key={ep.id}
            href={`/podcasts/${ep.slug}`}
            className="group flex flex-col gap-6 border-b-2 border-gray-100 bg-white p-6 transition-all hover:border-red-700/30 hover:bg-gray-50 md:flex-row md:rounded-3xl md:border-2"
          >
            <div className="relative flex h-32 w-full shrink-0 items-center justify-center overflow-hidden bg-gray-900 shadow-lg md:w-32 md:rounded-2xl">
              {ep.urlCapa ? (
                <img src={ep.urlCapa} alt={ep.titulo} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110" />
              ) : (
                <Mic className="h-10 w-10 text-white opacity-40" />
              )}
              <div className="absolute inset-0 flex items-center justify-center bg-red-700/0 transition-all group-hover:bg-red-700/20">
                <Play className="h-0 w-0 fill-white text-white drop-shadow-md transition-all duration-300 group-hover:h-10 group-hover:w-10" />
              </div>
            </div>

            <div className="flex flex-1 flex-col justify-center">
              <div className="mb-2 flex flex-wrap items-center gap-2">
                <span className="rounded-full border border-red-100 bg-red-50 px-2 py-0.5 text-[10px] font-black uppercase tracking-widest text-red-700">
                  EP {String(index + 1).padStart(2, "0")}
                </span>
                <span className="text-gray-300">•</span>
                <span className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-widest text-gray-500">
                  <Clock className="h-3 w-3" /> {Math.floor((ep.duracao || 0) / 60)} min
                </span>
                <span className="text-gray-300">•</span>
                <span className="text-[10px] font-bold uppercase tracking-widest text-gray-500">
                  {new Date(ep.dataPub).toLocaleDateString("pt-BR", { day: "numeric", month: "long" })}
                </span>
              </div>

              <h2 className="mb-2 text-xl font-black leading-tight text-red-900 transition-colors duration-500 group-hover:text-red-950 dark:text-red-100 md:text-2xl">
                {ep.titulo}
              </h2>
              <p className="line-clamp-2 text-sm leading-relaxed text-gray-600 md:line-clamp-1">{ep.descricao}</p>
            </div>
          </Link>
        ))}

        {episodes.length === 0 && (
          <div className="rounded-3xl border-2 border-dashed border-gray-200 bg-gray-50 py-20 text-center text-gray-500">
            <h3 className="text-xl font-bold text-gray-900">Nenhum episodio disponivel</h3>
            <p className="mt-2 text-sm">Estamos preparando as proximas analises. Volte em breve.</p>
          </div>
        )}
      </div>
    </main>
  );
}
