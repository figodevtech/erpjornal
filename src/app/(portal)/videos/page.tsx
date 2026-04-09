import ShortVideoCard from "@/components/portal/ShortVideoCard";
import PortalSectionHeader from "@/components/portal/PortalSectionHeader";
import { isModuleEnabled } from "@/lib/config/modules";
import { prisma } from "@/lib/prisma";
import { Film, TrendingUp } from "lucide-react";
import { notFound } from "next/navigation";

export const metadata = {
  title: "RG.Curtos | Videos Rapidos de Politica",
  description: "Assista aos bastidores e analises rapidas da politica nacional em formato de videos curtos.",
};

export default async function VideosPage() {
  if (!isModuleEnabled("videos")) {
    notFound();
  }

  const videos = await (prisma as any).shortVideo.findMany({
    where: { status: "published" },
    orderBy: { dataPub: "desc" },
  });

  return (
    <main className="min-h-screen bg-[#fafafa] py-12 md:py-16">
      <div className="mx-auto max-w-7xl px-4 md:px-8">
        <PortalSectionHeader
          eyebrow="Multiformatos"
          title={
            <>
              RG<span className="text-red-700">.</span>Curtos
            </>
          }
          description="A politica brasileira em doses rapidas. Bastidores, analises e fatos em menos de 60 segundos."
          badge={
            <div className="rounded-2xl border border-gray-200 bg-white px-4 py-3 text-right shadow-sm">
              <span className="block text-2xl font-black text-gray-950">{videos.length}</span>
              <span className="text-[10px] font-black uppercase tracking-widest text-gray-500">Videos</span>
            </div>
          }
        />

        <div className="mb-16 mt-10 flex items-center justify-between border-b-4 border-gray-900/5 pb-6">
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gray-900 text-white shadow-2xl">
              <TrendingUp className="h-7 w-7" />
            </div>
            <h2 className="text-3xl font-black uppercase tracking-tighter text-gray-900">Em alta agora</h2>
          </div>
          <div className="hidden gap-2 md:flex">
            <div className="h-2 w-2 rounded-full bg-red-700" />
            <div className="h-2 w-2 rounded-full bg-gray-200" />
            <div className="h-2 w-2 rounded-full bg-gray-200" />
          </div>
        </div>

        <div className="flex flex-col gap-16">
          <div className="flex snap-x snap-mandatory gap-8 overflow-x-auto px-4 pb-12 -mx-4 md:grid md:grid-cols-2 md:overflow-visible lg:grid-cols-4 xl:grid-cols-4">
            {videos.map((video: any) => (
              <div key={video.id} className="w-[85vw] grow-0 shrink-0 snap-center md:w-full">
                <ShortVideoCard video={video} />
              </div>
            ))}
          </div>

          {videos.length === 0 && (
            <div className="rounded-[56px] border-4 border-dashed border-gray-100 bg-white py-40 text-center shadow-inner">
              <Film className="mx-auto mb-8 h-20 w-20 text-gray-100" />
              <h3 className="text-3xl font-black uppercase tracking-tighter text-gray-300">Silencio no set...</h3>
              <p className="mt-4 text-lg font-medium italic text-gray-400">Estamos preparando os proximos videos curtos. Fique ligado.</p>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
