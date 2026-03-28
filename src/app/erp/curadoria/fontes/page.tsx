import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { Plus, Globe, Trash2, RefreshCcw, Calendar, MapPin, Activity, Link as LinkIcon } from "lucide-react";
import NextLink from "next/link";
import { RSSSourceForm } from "./components/RSSSourceForm";
import { HarvestButton } from "./components/HarvestButton";
import { StatusToggle } from "./components/StatusToggle";

export default async function FontesCuradoriaPage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/api/auth/signin");
  
  if (session.user.role !== "admin") {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <Globe className="w-16 h-16 text-gray-200 mb-4" />
        <h1 className="text-2xl font-black text-gray-900 uppercase tracking-widest">Acesso Restrito</h1>
        <p className="text-gray-500 max-w-sm mt-2 font-medium">
          Apenas administradores podem gerenciar fontes de coleta automatizada (RSS).
        </p>
      </div>
    );
  }

  const fontes = await prisma.rSSSource.findMany({
    orderBy: { created_at: "desc" },
    include: {
      _count: { select: { items: true } }
    }
  });

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black text-gray-900 tracking-tight uppercase">Fontes RSS</h1>
          <p className="text-sm text-gray-500 mt-1 font-medium">
            Gerencie os portais parceiros para curadoria automatizada.
          </p>
        </div>
        <RSSSourceForm />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {fontes.map((fonte) => (
          <div 
            key={fonte.id} 
            className="group relative bg-white border border-gray-200 rounded-[32px] overflow-hidden hover:shadow-2xl hover:border-gray-300 transition-all duration-500 shadow-sm"
          >
            {/* Overlay Glass Decor */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-gray-50 rounded-full -mr-16 -mt-16 group-hover:bg-indigo-50 transition-colors duration-700" />
            
            <div className="relative z-10 p-8 flex flex-col h-full">
              <div className="flex items-start justify-between mb-8">
                <div className="flex items-center gap-5">
                  <div className="w-16 h-16 rounded-[22px] bg-gray-900 flex items-center justify-center shadow-xl group-hover:rotate-3 transition-transform duration-500 shrink-0">
                    {fonte.logo ? (
                      <img src={fonte.logo} alt="" className="w-10 h-10 object-contain brightness-0 invert" />
                    ) : (
                      <Globe className="w-8 h-8 text-white" />
                    )}
                  </div>
                  <div>
                    <h3 className="text-xl font-black text-gray-900 uppercase tracking-tight leading-none mb-2">{fonte.name}</h3>
                    <div className="flex flex-wrap items-center gap-2">
                       <StatusToggle id={fonte.id} isActive={(fonte as any).is_active} />
                       <span className="text-[9px] font-black uppercase bg-indigo-50 text-indigo-600 px-2 py-1.5 rounded-xl tracking-[0.15em] border border-indigo-100">
                         {fonte.tone || 'Jornalístico'}
                       </span>
                       {fonte.regiao && (
                         <span className="flex items-center gap-1.5 text-[10px] font-bold text-gray-400 uppercase tracking-widest pl-2 border-l border-gray-100">
                           <MapPin className="w-3.5 h-3.5 text-red-500" /> {fonte.regiao} {fonte.estado && `(${fonte.estado})`}
                         </span>
                       )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                   <HarvestButton sourceId={fonte.id} />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-8">
                <div className="bg-gray-50/80 backdrop-blur-sm border border-gray-100 p-4 rounded-3xl">
                  <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-1.5">Acervo Local</span>
                  <div className="flex items-baseline gap-1">
                    <span className="text-3xl font-black text-gray-900 tracking-tighter">{fonte._count.items}</span>
                    <span className="text-[10px] font-bold text-gray-400 uppercase italic">matérias</span>
                  </div>
                </div>
                <div className="bg-gray-50/80 backdrop-blur-sm border border-gray-100 p-4 rounded-3xl">
                  <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-1.5">Ciclo Automático</span>
                  <div className="flex items-baseline gap-1">
                    <span className="text-3xl font-black text-gray-900 tracking-tighter">{fonte.cache_ttl}</span>
                    <span className="text-[10px] font-bold text-gray-400 uppercase italic">min</span>
                  </div>
                </div>
              </div>

              <div className="mt-auto pt-6 border-t border-gray-100 flex items-center justify-between">
                <div className="flex flex-col">
                  <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1">Status da Pulsação</span>
                  <div className="flex items-center gap-2 text-[11px] font-bold text-gray-600 uppercase tracking-tight">
                    <RefreshCcw className={`w-3.5 h-3.5 text-emerald-500 ${fonte.last_harvest ? '' : 'animate-spin'}`} />
                     <span className="truncate max-w-[150px]">
                        Última: {fonte.last_harvest ? new Date(fonte.last_harvest).toLocaleString('pt-BR', {day:'2-digit', month:'2-digit', hour:'2-digit', minute:'2-digit'}) : 'Inativa'}
                     </span>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <RSSSourceForm source={fonte} />
                </div>
              </div>

              {/* Feed URL Debug View - Modern Link Style */}
              <div className="mt-4 flex items-center gap-2 text-[10px] font-mono text-gray-400 truncate bg-gray-50/50 p-3 rounded-2xl border border-dashed border-gray-200 opacity-60 hover:opacity-100 transition-opacity">
                 <LinkIcon className="w-3.5 h-3.5 shrink-0" />
                 <span className="truncate">{fonte.feed_url}</span>
              </div>
            </div>
          </div>
        ))}

        {fontes.length === 0 && (
          <div className="lg:col-span-2 py-32 text-center rounded-[40px] border-2 border-dashed border-gray-200 bg-white/50">
            <Globe className="w-16 h-16 text-gray-200 mx-auto mb-4" />
            <h3 className="text-xl font-black text-gray-900 uppercase">Nenhum feed RSS</h3>
            <p className="text-gray-500 max-w-xs mx-auto mt-2 font-medium">
              Cadastre o link de um portal para começar a receber notícias filtradas.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

