"use client";

import { useState } from "react";
import { ExternalLink, Sparkles, X, Clock, User } from "lucide-react";
import { selectRSSItem, rejectRSSItem } from "../../actions";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

export function SelectionCard({ item }: { item: any }) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleSelect() {
    setLoading(true);
    try {
      await selectRSSItem(item.id);
      toast.success("Notícia selecionada!");
      // Redireciona para a página de revisão (será criada)
      router.push(`/erp/curadoria/review/${item.id}`);
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleReject() {
    if(!confirm("Rejeitar esta notícia?")) return;
    setLoading(true);
    try {
      await rejectRSSItem(item.id);
      toast.info("Notícia descartada");
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="bg-white border border-gray-200 rounded-[32px] overflow-hidden flex flex-col hover:shadow-xl transition-all group group relative shadow-sm">
      <div className="h-44 bg-gray-100 relative overflow-hidden shrink-0 pointer-events-none">
        {item.thumbnail ? (
          <img src={item.thumbnail} alt="" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-300">
             <svg className="w-12 h-12" fill="currentColor" viewBox="0 0 24 24"><path d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
          </div>
        )}
        <div className="absolute top-4 left-4">
           <span className="bg-gray-900/80 backdrop-blur-md text-white text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-full shadow-lg border border-white/10">
             {item.source.name}
           </span>
        </div>
      </div>

      <div className="p-6 flex flex-col flex-1">
        <div className="flex items-center gap-3 text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3">
           <span className="flex items-center gap-1 whitespace-nowrap"><Clock className="w-3 h-3" /> {new Date(item.pub_date).toLocaleDateString('pt-BR')}</span>
           <span className="flex items-center gap-1 line-clamp-1"><User className="w-3 h-3 text-gray-300" /> {item.original_author}</span>
        </div>

        <h3 className="text-xl font-black text-gray-900 leading-tight mb-3 group-hover:text-indigo-600 transition-colors line-clamp-2">
          {item.original_title}
        </h3>

        <p className="text-sm text-gray-500 font-medium mb-6 line-clamp-3 leading-relaxed">
          {item.description?.replace(/<[^>]*>?/gm, '')}
        </p>

        <div className="mt-auto space-y-3">
          <div className="flex gap-2">
            <button
              onClick={handleSelect}
              disabled={loading}
              className="flex-1 bg-gray-900 text-white font-black uppercase tracking-widest py-4 rounded-2xl hover:bg-gray-800 transition-all flex items-center justify-center gap-2 text-xs shadow-lg active:scale-[0.98] disabled:opacity-50"
            >
              <Sparkles className="w-4 h-4 text-indigo-400" />
              Selecionar p/ Reescrita
            </button>
            <button
              onClick={handleReject}
              disabled={loading}
              className="px-5 py-4 border border-gray-200 rounded-2xl text-gray-400 hover:bg-rose-50 hover:text-rose-500 hover:border-rose-100 transition-all active:scale-95 disabled:opacity-50"
            >
               <X className="w-5 h-5" />
            </button>
          </div>
          
          <a 
            href={item.original_link} 
            target="_blank" 
            rel="noopener noreferrer"
            className="w-full py-2 flex items-center justify-center gap-2 text-[10px] font-black text-gray-400 uppercase tracking-widest hover:text-indigo-600 transition-colors"
          >
            <ExternalLink className="w-3.5 h-3.5" /> Ver Original
          </a>
        </div>
      </div>
    </div>
  );
}

