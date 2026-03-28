"use client";

import { useState, useTransition } from "react";
import { Sparkles, Save, CheckCircle2, XCircle, RotateCcw, Layout } from "lucide-react";
import { rewriteWithAI, approveAndPublish, rejectRSSItem } from "../../../actions";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import RichTextEditor from "@/components/ui/RichTextEditor";

export function ReviewForm({ item, aiData, user }: { item: any; aiData: any; user: any }) {
  const [isPending, startTransition] = useTransition();
  const [loadingIA, setLoadingIA] = useState(false);
  const router = useRouter();

  // Estados dos campos finais
  const [titulo, setTitulo] = useState(aiData?.ai_title || item.original_title);
  const [resumo, setResumo] = useState(aiData?.ai_lead || "");
  const [corpo, setCorpo] = useState(aiData?.ai_body || "");

  async function handleAI() {
    setLoadingIA(true);
    try {
      const res = await rewriteWithAI(item.id);
      if (res.success) {
        setTitulo(res.aiResponse.ai_title);
        setResumo(res.aiResponse.ai_lead);
        setCorpo(res.aiResponse.ai_body);
        toast.success("IA gerou uma nova versÃ£o!");
      }
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setLoadingIA(false);
    }
  }

  async function handlePublish(e: React.FormEvent) {
    e.preventDefault();
    if (!confirm("Confirmar publicaÃ§Ã£o deste artigo reescrito?")) return;
    
    startTransition(async () => {
      try {
        const res = await approveAndPublish(item.id, { titulo, resumo, corpo_texto: corpo });
        if (res.success) {
          toast.success("Artigo publicado com sucesso!");
          router.push(`/erp/artigos`);
        }
      } catch (err: any) {
        toast.error(err.message);
      }
    });
  }

  return (
    <form onSubmit={handlePublish} className="space-y-8 animate-in fade-in duration-1000">
      
      {/* BotÃ£o Gatilho IA */}
      <div className="flex flex-col md:flex-row items-center justify-between p-6 bg-gray-900 rounded-[32px] text-white shadow-xl shadow-indigo-500/10 relative overflow-hidden group border border-white/10">
        <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 rounded-full -mr-32 -mt-32 blur-3xl group-hover:bg-indigo-500/20 transition-all" />
        <div className="relative z-10 text-center md:text-left">
          <h3 className="text-xl font-black uppercase tracking-tight flex items-center justify-center md:justify-start gap-2">
            <Sparkles className="w-6 h-6 text-indigo-400" /> Reescrita IA (Gemini)
          </h3>
          <p className="text-white/50 text-xs font-bold uppercase tracking-widest mt-1">Gere uma versÃ£o original e exclusiva do conteÃºdo</p>
        </div>
        <button
          type="button"
          onClick={handleAI}
          disabled={loadingIA}
          className="mt-6 md:mt-0 bg-white text-gray-900 font-black uppercase tracking-widest px-8 py-5 rounded-2xl hover:bg-indigo-500 hover:text-white transition-all flex items-center gap-3 shadow-lg active:scale-95 disabled:opacity-50 text-xs relative z-10"
        >
          {loadingIA ? "Coletando inteligÃªncia..." : "Reescrever com IA"}
          <RotateCcw className={`w-4 h-4 ${loadingIA ? 'animate-spin' : ''}`} />
        </button>
      </div>

      <div className="bg-white border border-gray-200 rounded-[40px] p-6 md:p-10 shadow-sm space-y-8">
        
        {/* TÃ­tulo Final */}
        <div className="space-y-2">
          <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-2">TÃ­tulo Redesign</label>
          <input 
            value={titulo}
            onChange={(e) => setTitulo(e.target.value)}
            className="w-full bg-gray-50 border-2 border-gray-100 rounded-3xl p-6 text-2xl font-black text-gray-900 focus:bg-white focus:border-indigo-500 outline-none transition-all placeholder:text-gray-300"
            placeholder="TÃ­tulo final da matÃ©ria..."
          />
        </div>

        {/* Resumo/Lead */}
        <div className="space-y-2">
          <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-2">Lead (Resumo)</label>
          <textarea 
            rows={3}
            value={resumo}
            onChange={(e) => setResumo(e.target.value)}
            className="w-full bg-gray-50 border-2 border-gray-100 rounded-3xl p-6 text-sm font-bold text-gray-600 focus:bg-white focus:border-indigo-500 outline-none transition-all resize-none italic"
            placeholder="Breve resumo atraente..."
          />
        </div>

        <div className="space-y-2">
          <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-2">Corpo da MatÃ©ria</label>
          <RichTextEditor 
            content={corpo} 
            onChange={setCorpo} 
          />
        </div>

        <div className="pt-8 border-t border-gray-100 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-4">
             <div className="w-12 h-12 rounded-2xl bg-gray-900 flex items-center justify-center shadow-lg">
                <span className="text-white text-sm font-black uppercase tracking-tighter">{user.name?.[0] || 'E'}</span>
             </div>
             <div>
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Revisor Humano</p>
                <p className="text-sm font-black text-gray-900 uppercase">Portal &bull; {user.name || 'Editor'}</p>
             </div>
          </div>

          <div className="flex items-center gap-3 shrink-0 w-full md:w-auto">
             <button
                type="button"
                onClick={async () => {
                  if(confirm("Rejeitar? Este item sumirÃ¡ do dashboard.")) {
                    await rejectRSSItem(item.id);
                    toast.info("Rejeitado");
                    router.push('/erp/curadoria/dashboard');
                  }
                }}
                className="flex-1 md:flex-none flex items-center justify-center gap-2 px-6 py-4 rounded-2xl border border-gray-200 text-gray-400 font-black uppercase tracking-widest text-[10px] hover:bg-rose-50 hover:text-rose-500 hover:border-rose-100 transition-all"
             >
                <XCircle className="w-4 h-4" /> Rejeitar
             </button>
             
             <button
                type="submit"
                disabled={isPending}
                className="flex-[2] md:flex-none flex items-center justify-center gap-3 px-10 py-5 rounded-[24px] bg-emerald-600 text-white font-black uppercase tracking-[0.15em] text-xs hover:bg-emerald-500 transition-all shadow-xl shadow-emerald-500/20 active:scale-95 disabled:opacity-50"
             >
                <CheckCircle2 className="w-5 h-5" />
                {isPending ? "Publicando..." : "Publicar MatÃ©ria"}
             </button>
          </div>
        </div>

      </div>
      
      {/* RodapÃ© Legal AutomÃ¡tico Preview */}
      <div className="p-8 bg-gray-900 rounded-[40px] text-white/50 border border-white/10 italic text-xs space-y-1 relative overflow-hidden">
        <div className="absolute top-0 right-0 p-8 text-white/5 opacity-20">
           <Layout className="w-32 h-32" />
        </div>
        <p className="text-white/80 font-black uppercase tracking-[0.2em] mb-4 flex items-center gap-2 text-[10px]">
          <span className="w-2 h-2 bg-indigo-500 rounded-full animate-pulse" />
          Preview do RodapÃ© de Autoria (Portal)
        </p>
        <p className="border-t border-white/5 pt-4">---</p>
        <p>ðŸ”— Baseado em matÃ©ria original do portal <strong>{item.source.name}</strong></p>
        <p>ðŸ“… Publicado originalmente em {new Date(item.pub_date).toLocaleDateString('pt-BR')} Ã s {new Date(item.pub_date).toLocaleTimeString('pt-BR', {hour:'2-digit', minute:'2-digit'})}</p>
        <p>âœï¸ ConteÃºdo reescrito via IA e revisado por <strong>{user.name || 'RedaÃ§Ã£o'}</strong></p>
        <p>ðŸ“° Revista GestÃ£o - Sua Fonte ConfiÃ¡vel</p>
        <p>---</p>
      </div>

    </form>
  );
}

