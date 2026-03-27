import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect, notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { ArrowLeft, Sparkles, Layout, FileText, Globe, CheckCircle2, XCircle } from "lucide-react";
import Link from "next/link";
import { ReviewForm } from "./components/ReviewForm";

export default async function CuradoriaReviewPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/api/auth/signin");
  
  const { id } = await params;

  const item = await prisma.rSSItemRaw.findUnique({
    where: { id },
    include: { 
      source: true,
      rewrite_logs: {
        orderBy: { created_at: "desc" },
        take: 1
      }
    }
  });

  if (!item) notFound();

  const latestLog = item.rewrite_logs[0];
  const aiData = (latestLog?.ai_response as any) || null;

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20">
      <div className="flex items-center justify-between">
        <Link 
          href="/erp/curadoria/dashboard" 
          className="flex items-center gap-2 text-xs font-black text-slate-400 uppercase tracking-widest hover:text-slate-900 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Voltar ao Dashboard
        </Link>
        <div className="flex items-center gap-3">
           <span className={`text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full border ${item.status === 'ai_generated' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-indigo-50 text-indigo-600 border-indigo-100'}`}>
             Status: {item.status.replace('_', ' ')}
           </span>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-10">
        
        {/* Lado Esquerdo: Original */}
        <div className="xl:col-span-4 space-y-6">
          <div className="bg-slate-50 border border-slate-200 rounded-[32px] p-8 sticky top-8">
            <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-6 flex items-center gap-2">
              <Globe className="w-4 h-4" /> Matéria Original
            </h3>
            
            <div className="space-y-4">
              <div className="bg-white p-4 rounded-2xl border border-slate-200">
                <span className="text-[10px] font-black text-indigo-500 uppercase tracking-widest block mb-1">Fonte</span>
                <p className="text-sm font-bold text-slate-900">{item.source.name}</p>
              </div>

              <h1 className="text-xl font-black text-slate-900 leading-tight">
                {item.original_title}
              </h1>

              <div className="text-sm text-slate-500 font-medium leading-relaxed bg-slate-100/50 p-4 rounded-2xl italic">
                {item.description?.replace(/<[^>]*>?/gm, '') || "Sem descrição original."}
              </div>

              <a 
                href={item.original_link} 
                target="_blank" 
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-[11px] font-black text-indigo-600 uppercase tracking-widest hover:underline"
              >
                Abrir link original <ArrowLeft className="w-3.5 h-3.5 rotate-180" />
              </a>
            </div>
          </div>
        </div>

        {/* Lado Direito: Editor / IA */}
        <div className="xl:col-span-8 space-y-8">
          <ReviewForm 
            item={item} 
            aiData={aiData} 
            user={session.user} 
          />
        </div>

      </div>
    </div>
  );
}
