import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { Globe, ArrowRight, X, Clock, ExternalLink, Sparkles, Filter } from "lucide-react";
import Link from "next/link";
import { selectRSSItem, rejectRSSItem } from "../actions";
import { SelectionCard } from "./components/SelectionCard";

export default async function CuradoriaDashboardPage({ searchParams }: { searchParams: Promise<{ source?: string }> }) {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/api/auth/signin");
  
  const { source } = await searchParams;

  const stats = {
    pending: await prisma.rSSItemRaw.count({ where: { status: "pending" } }),
    selected: await prisma.rSSItemRaw.count({ where: { status: "selected" } }),
    ai_generated: await prisma.rSSItemRaw.count({ where: { status: "ai_generated" } }),
  };

  const items = await prisma.rSSItemRaw.findMany({
    where: { 
      status: "pending",
      ...(source ? { source_id: source } : {})
    },
    include: { source: true },
    orderBy: { pub_date: "desc" },
    take: 50
  });

  const sources = await prisma.rSSSource.findMany({
    select: { id: true, name: true }
  });

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight uppercase italic">Dashboard de Curadoria</h1>
          <p className="text-sm text-slate-500 mt-1 font-medium">
            Selecione notícias dos portais parceiros para reescrita assistida.
          </p>
        </div>
      </div>

      {/* Stats Bar */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white border border-slate-200 p-6 rounded-[32px] flex items-center gap-5 shadow-sm">
          <div className="w-12 h-12 bg-slate-100 rounded-2xl flex items-center justify-center">
            <Clock className="w-6 h-6 text-slate-400" />
          </div>
          <div>
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Pendentes</span>
            <span className="text-2xl font-black text-slate-900">{stats.pending}</span>
          </div>
        </div>
        <div className="bg-indigo-50 border border-indigo-100 p-6 rounded-[32px] flex items-center gap-5 shadow-sm">
          <div className="w-12 h-12 bg-indigo-100 rounded-2xl flex items-center justify-center">
            <ArrowRight className="w-6 h-6 text-indigo-600" />
          </div>
          <div>
            <span className="text-[10px] font-black text-indigo-400 uppercase tracking-widest block">Aguardando IA</span>
            <span className="text-2xl font-black text-indigo-700">{stats.selected}</span>
          </div>
        </div>
        <div className="bg-emerald-50 border border-emerald-100 p-6 rounded-[32px] flex items-center gap-5 shadow-sm">
          <div className="w-12 h-12 bg-emerald-100 rounded-2xl flex items-center justify-center">
            <Sparkles className="w-6 h-6 text-emerald-600" />
          </div>
          <div>
            <span className="text-[10px] font-black text-emerald-400 uppercase tracking-widest block">Reescritas</span>
            <span className="text-2xl font-black text-emerald-700">{stats.ai_generated}</span>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-4 bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
        <div className="flex items-center gap-2 text-xs font-black text-slate-400 uppercase tracking-widest px-2">
          <Filter className="w-4 h-4" /> Filtros:
        </div>
        <Link 
          href="/erp/curadoria/dashboard" 
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${!source ? 'bg-slate-900 text-white shadow-lg' : 'bg-slate-50 text-slate-400 hover:bg-slate-100'}`}
        >
          Todos
        </Link>
        {sources.map(s => (
          <Link 
            key={s.id}
            href={`/erp/curadoria/dashboard?source=${s.id}`}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${source === s.id ? 'bg-slate-900 text-white shadow-lg' : 'bg-slate-50 text-slate-400 hover:bg-slate-100'}`}
          >
            {s.name}
          </Link>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 2xl:grid-cols-3 gap-6">
        {items.map((item) => (
          <SelectionCard key={item.id} item={item} />
        ))}
        
        {items.length === 0 && (
          <div className="md:col-span-2 2xl:col-span-3 py-32 text-center rounded-[40px] border-2 border-dashed border-slate-200 bg-white/50">
            <X className="w-16 h-16 text-slate-200 mx-auto mb-4" />
            <h3 className="text-xl font-black text-slate-900 uppercase">Sem notícias pendentes</h3>
            <p className="text-slate-500 max-w-xs mx-auto mt-2 font-medium">
              Aguarde a próxima coleta automática ou dispare manualmente nas configurações.
            </p>
          </div>
        )}
      </div>

      {/* RECENTEMENTE PUBLICADOS (TASK 8) */}
      <div className="pt-12 border-t border-slate-200">
         <h2 className="text-xl font-black text-slate-900 uppercase tracking-tight mb-6">Recentemente Publicados</h2>
         
         <div className="bg-white border border-slate-200 rounded-[32px] overflow-hidden shadow-sm">
            <table className="w-full text-left">
               <thead className="bg-slate-50 border-b border-slate-100">
                  <tr className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                     <th className="px-6 py-4">Matéria</th>
                     <th className="px-6 py-4">Fonte</th>
                     <th className="px-6 py-4">Revisor</th>
                     <th className="px-6 py-4">Data</th>
                     <th className="px-6 py-4 text-right">Ações</th>
                  </tr>
               </thead>
               <tbody className="divide-y divide-slate-100">
                  {(await prisma.article.findMany({
                     where: { rss_item_id: { not: null } },
                     include: { categoria: true },
                     orderBy: { created_at: "desc" },
                     take: 10
                  })).map(art => (
                     <tr key={art.id} className="hover:bg-slate-50/50 transition-colors">
                        <td className="px-6 py-4">
                           <p className="text-sm font-bold text-slate-900 leading-tight line-clamp-1">{art.titulo}</p>
                           <p className="text-[10px] text-indigo-500 font-black uppercase tracking-widest mt-0.5">{art.categoria?.nome}</p>
                        </td>
                        <td className="px-6 py-4 text-xs font-medium text-slate-500">{art.external_author}</td>
                        <td className="px-6 py-4 text-xs font-medium text-slate-500 italic">{art.human_reviewer}</td>
                        <td className="px-6 py-4 text-xs font-medium text-slate-400">{new Date(art.created_at).toLocaleDateString()}</td>
                        <td className="px-6 py-4 text-right space-x-2">
                           <Link href={`/erp/artigos/${art.id}`} className="text-indigo-600 hover:text-indigo-700 font-bold text-xs uppercase underline">Editar</Link>
                        </td>
                     </tr>
                  ))}
               </tbody>
            </table>
         </div>
      </div>
    </div>
  );
}
