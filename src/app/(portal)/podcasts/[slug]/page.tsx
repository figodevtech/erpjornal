import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import PodcastPlayer from "@/components/portal/PodcastPlayer";
import Link from "next/link";
import { ArrowLeft, Share2 } from "lucide-react";

export async function generateMetadata({ params }: { params: { slug: string } }) {
  const ep = (await (prisma as any).podcastEpisode.findUnique({ where: { slug: params.slug } }));
  if (!ep) return { title: "Episódio Não Encontrado" };
  return { title: `${ep.titulo} | Podcast RG`, description: ep.descricao };
}

export default async function EpisodePage({ params }: { params: { slug: string } }) {
  const ep = (await (prisma as any).podcastEpisode.findUnique({ where: { slug: params.slug } }));
  if (!ep || ep.status !== "published") notFound();

  return (
    <article className="max-w-3xl mx-auto px-4 py-12 md:py-20 animate-in fade-in slide-in-from-bottom-6 duration-700">
      <Link href="/podcasts" className="inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-gray-400 hover:text-red-700 transition-colors mb-4">
        <ArrowLeft className="w-4 h-4" /> Voltar para Podcasts
      </Link>

      <div className="space-y-4 mb-12">
        <div className="flex gap-2">
           <span className="text-[11px] font-black uppercase tracking-widest text-red-700 bg-red-100 px-3 py-1 rounded-full">Policial</span>
           <span className="text-[11px] font-black uppercase tracking-widest text-gray-500 bg-gray-100 px-3 py-1 rounded-full">Bastidores</span>
        </div>
        <h1 className="text-4xl md:text-6xl font-black md:tracking-tighter tracking-tight text-gray-900 leading-none">
          {ep.titulo}
        </h1>
        <div className="flex items-center gap-4 text-[11px] font-bold text-gray-400 tracking-widest uppercase">
           <span>Publicado: {new Date(ep.data_pub).toLocaleDateString("pt-BR", { day:'numeric', month:'long', year:'numeric' })}</span>
           <span className="text-gray-200">|</span>
           <span>Revista Gestão Oficial</span>
        </div>
      </div>

      <PodcastPlayer audioUrl={ep.audio_url} titulo={ep.titulo} />

      <div className="mt-12 space-y-8">
        <div className="prose prose-gray max-w-none">
           <h3 className="text-xl font-bold text-gray-900 border-l-[4px] border-red-700 pl-4 mb-4">Sobre este episódio</h3>
           <p className="text-gray-600 text-lg leading-relaxed whitespace-pre-wrap">{ep.descricao}</p>
        </div>

        <div className="pt-8 border-t border-gray-100 flex flex-col md:flex-row items-center justify-between gap-6">
           <div className="flex items-center gap-4">
              <span className="text-xs font-black uppercase tracking-widest text-gray-400">Compartilhar</span>
              <div className="flex items-center gap-3">
                 <button className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-all text-gray-600">
                    <Share2 className="w-5 h-5" />
                 </button>
              </div>
           </div>
           
           <div className="flex items-center gap-4">
              <span className="text-xs font-black uppercase tracking-widest text-red-500">Ouça também em:</span>
              <div className="flex gap-4 grayscale opacity-60 hover:grayscale-0 hover:opacity-100 transition-all">
                 <img src="https://upload.wikimedia.org/wikipedia/commons/1/19/Spotify_logo_without_text.svg" className="w-6 h-6" alt="Spotify" />
                 <img src="https://upload.wikimedia.org/wikipedia/commons/e/e7/Podcasts_%28iOS%29.svg" className="w-6 h-6" alt="Apple Podcasts" />
              </div>
           </div>
        </div>
      </div>
    </article>
  );
}

