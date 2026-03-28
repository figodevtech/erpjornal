import { prisma } from "@/lib/prisma";
import ShortVideoCard from "@/components/portal/ShortVideoCard";
import { Film, TrendingUp, PlayCircle, Zap, ShieldCheck } from "lucide-react";

export const metadata = {
  title: "RG.Curtos | Vídeos Rápidos de Política",
  description: "Assista aos bastidores e análises rápidas da política nacional em formato de vídeos curtos.",
};

export default async function VideosPage() {
  const videos = await (prisma as any).shortVideo.findMany({
    where: { status: "published" },
    orderBy: { data_pub: "desc" },
  });

  return (
    <main className="min-h-screen bg-[#fafafa] py-12 md:py-24 animate-in fade-in slide-in-from-bottom-4 duration-1000">
      <div className="max-w-7xl mx-auto px-4 md:px-8">
        
        {/* Header Section */}
        <div className="mb-24 text-center">
          <div className="inline-flex items-center gap-2 px-5 py-2 bg-red-50 border border-red-100 rounded-full mb-8 shadow-sm">
            <span className="w-2.5 h-2.5 bg-red-700 rounded-full animate-pulse" />
            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-red-700">Multiformatos</span>
          </div>
          <h1 className="text-7xl md:text-9xl font-black tracking-tighter text-gray-900 leading-[0.85] mb-8">
            RG<span className="text-red-700">.</span>CURTOS
          </h1>
          <p className="text-gray-500 mt-10 text-xl md:text-2xl max-w-2xl mx-auto font-medium leading-relaxed tracking-tight">
            A política brasileira em doses rápidas. Bastidores, análises e fatos em menos de 60 segundos.
          </p>
        </div>

        {/* Categories Bar */}
        <div className="flex gap-4 mb-20 overflow-x-auto no-scrollbar pb-4 md:justify-center">
           {["Todos", "Eleições 2026", "Economia", "Bastidores", "Entrevistas"].map((cat, idx) => (
             <button 
               key={idx} 
               className={`px-8 py-3 rounded-full text-xs font-black uppercase tracking-widest transition-all whitespace-nowrap border-2 ${idx === 0 ? "bg-gray-900 border-gray-900 text-white shadow-xl scale-105" : "bg-white border-gray-100 text-gray-400 hover:border-red-700/30 hover:text-red-700"}`}
             >
               {cat}
             </button>
           ))}
        </div>

        {/* Content Section */}
        <div className="flex flex-col gap-16">
          
          <div className="flex items-center justify-between border-b-4 border-gray-900/5 pb-6">
             <div className="flex items-center gap-4">
                <div className="w-14 h-14 bg-gray-900 rounded-2xl flex items-center justify-center text-white shadow-2xl rotate-3">
                  <TrendingUp className="w-7 h-7" />
                </div>
                <h2 className="text-3xl font-black tracking-tighter text-gray-900 uppercase">Em Alta Agora</h2>
             </div>
             <div className="hidden md:flex gap-2">
                <div className="w-2 h-2 rounded-full bg-red-700" />
                <div className="w-2 h-2 rounded-full bg-gray-200" />
                <div className="w-2 h-2 rounded-full bg-gray-200" />
             </div>
          </div>

          <div className="flex overflow-x-auto pb-12 gap-8 no-scrollbar snap-x snap-mandatory md:grid md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-4 md:overflow-visible px-4 -mx-4">
            {videos.map((video: any) => (
              <div key={video.id} className="snap-center grow-0 shrink-0 w-[85vw] md:w-full">
                <ShortVideoCard video={video} />
              </div>
            ))}
          </div>

          {videos.length === 0 && (
            <div className="py-40 text-center bg-white rounded-[56px] border-4 border-dashed border-gray-100 shadow-inner">
              <Film className="w-20 h-20 text-gray-100 mx-auto mb-8 animate-bounce duration-1000" />
              <h3 className="text-3xl font-black text-gray-300 tracking-tighter uppercase">Silêncio no Set...</h3>
              <p className="text-gray-400 mt-4 text-lg font-medium italic">Estamos preparando os próximos vídeos curtos. Fique ligado!</p>
            </div>
          )}
        </div>

        {/* Footer Features Section */}
        <div className="mt-32 grid grid-cols-1 md:grid-cols-3 gap-10">
           {[
             { title: "Pílulas de Análise", desc: "Comentários diretos dos nossos especialistas sobre o fato central do dia.", icon: <PlayCircle className="w-6 h-6" /> },
             { title: "Fato ou Fake", desc: "Checagem rápida de boatos e declarações polêmicas em formato visual.", icon: <ShieldCheck className="w-6 h-6" /> },
             { title: "Exclusivo RG", desc: "Imagens inéditas e flagras dos bastidores do poder em Brasília.", icon: <Zap className="w-6 h-6" /> }
           ].map((item, i) => (
             <div key={i} className="p-10 bg-white rounded-[40px] border-2 border-gray-50 shadow-sm hover:shadow-2xl hover:-trangray-y-2 transition-all cursor-default group overflow-hidden relative">
                <div className="absolute top-0 right-0 w-32 h-32 bg-gray-50 rounded-full -mr-16 -mt-16 group-hover:bg-red-50 transition-colors" />
                <div className="w-14 h-14 bg-red-700 rounded-[20px] flex items-center justify-center text-white mb-8 group-hover:scale-110 transition-transform shadow-lg relative z-10">
                  {item.icon}
                </div>
                <h4 className="text-2xl font-black text-gray-900 mb-3 tracking-tighter uppercase relative z-10">{item.title}</h4>
                <p className="text-gray-500 text-sm font-medium leading-relaxed relative z-10">
                  {item.desc}
                </p>
             </div>
           ))}
        </div>

      </div>
    </main>
  );
}

