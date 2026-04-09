"use client";

import { useState } from "react";
import { RefreshCcw } from "lucide-react";
import { harvestFeed } from "../../actions";
import { toast } from "sonner";

export function HarvestButton({ sourceId }: { sourceId: string }) {
  const [loading, setLoading] = useState(false);
  const [limit, setLimit] = useState(10);

  async function handleHarvest() {
    setLoading(true);
    try {
      const res = await harvestFeed(sourceId, limit);
      if (res.count > 0) {
        toast.success(`${res.count} novos itens coletados. (Limite: ${limit})`);
      } else {
        toast.info(
          "Nenhum item novo foi importado. Isso acontece quando o feed ja foi lido antes ou nao expoe itens com link/guid valido."
        );
      }
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex h-[42px] items-center overflow-hidden rounded-xl border border-gray-100 bg-white shadow-sm">
      <div className="bg-gray-50 px-3 h-full flex items-center border-r border-gray-100">
        <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Limite</span>
      </div>
      <select 
        value={limit}
        onChange={(e) => setLimit(Number(e.target.value))}
        className="bg-transparent text-[10px] font-black uppercase text-indigo-600 px-3 h-full outline-none cursor-pointer border-r border-gray-50 hover:bg-gray-50 transition-colors"
      >
        <option value={5}>5</option>
        <option value={10}>10</option>
        <option value={20}>20</option>
        <option value={50}>50</option>
      </select>

      <button
        onClick={handleHarvest}
        disabled={loading}
        title="Coletar agora"
        className="flex h-full items-center justify-center gap-2 px-4 text-[10px] font-black uppercase tracking-widest text-indigo-600 transition-all hover:bg-slate-900 hover:text-white active:bg-indigo-700 disabled:opacity-50"
      >
        <RefreshCcw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
        <span>Coletar</span>
      </button>
    </div>
  );
}

