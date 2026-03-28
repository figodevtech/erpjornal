import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { Plus, Globe, Trash2, RefreshCcw, Calendar, MapPin } from "lucide-react";
import Link from "next/link";
import { RSSSourceForm } from "./components/RSSSourceForm";
import { HarvestButton } from "./components/HarvestButton";

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

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {fontes.map((fonte) => (
          <div 
            key={fonte.id} 
            className="bg-white border boundary-red border-gray-200 rounded-[28px] p-6 hover:shadow-xl transition-all group overflow-hidden relative shadow-sm"
          >
            <div className="absolute top-0 right-0 w-24 h-24 bg-gray-50 rounded-full -mr-12 -mt-12 group-hover:bg-indigo-50 transition-colors" />
            
            <div className="relative z-10">
              <div className="flex items-start justify-between mb-6">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-2xl bg-gray-900 flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform">
                    {fonte.logo ? (
                      <img src={fonte.logo} alt="" className="w-10 h-10 object-contain inv-white" />
                    ) : (
                      <Globe className="w-7 h-7 text-white" />
                    )}
                  </div>
                  <div>
                    <h3 className="text-xl font-black text-gray-900 uppercase tracking-tight">{fonte.name}</h3>
                    <div className="flex items-center gap-2 mt-1">
                       <span className="text-[10px] font-black uppercase bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded tracking-widest whitespace-nowrap">
                         {fonte.tone || 'Jornalístico'}
                       </span>
                       {fonte.regiao && (
                         <span className="flex items-center gap-1 text-[10px] font-bold text-gray-400">
                           <MapPin className="w-3 h-3" /> {fonte.regiao} {fonte.estado && `(${fonte.estado})`}
                         </span>
                       )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                   <HarvestButton sourceId={fonte.id} />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="bg-gray-50 p-3 rounded-2xl">
                  <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-1">Itens Coletados</span>
                  <span className="text-2xl font-black text-gray-900">{fonte._count.items}</span>
                </div>
                <div className="bg-gray-50 p-3 rounded-2xl">
                  <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-1">Status TTL</span>
                  <span className="text-sm font-bold text-gray-600">{fonte.cache_ttl} min</span>
                </div>
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                <div className="flex items-center gap-2 text-[11px] font-bold text-gray-400 uppercase tracking-wider">
                  <Calendar className="w-3.5 h-3.5" />
                  Última Coleta: {fonte.last_harvest ? fonte.last_harvest.toLocaleDateString('pt-BR', {day:'2-digit', month:'2-digit', hour:'2-digit', minute:'2-digit'}) : 'Nunca'}
                </div>
                
                <div className="flex items-center gap-3">
                  <RSSSourceForm source={fonte} />
                  {/* Delete logic here if needed */}
                </div>
              </div>

              <p className="mt-4 text-[11px] font-mono text-gray-400 break-all bg-gray-50 p-2 rounded-lg border border-gray-100 italic">
                {fonte.feed_url}
              </p>
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

