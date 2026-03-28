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
      toast.success(`${res.count} novos itens coletados! (Limite: ${limit})`);
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex items-center bg-white border border-gray-100 rounded-xl shadow-sm overflow-hidden h-[42px]">
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
        title="Disparar Coleta"
        className="px-4 h-full text-indigo-600 hover:bg-slate-900 hover:text-white transition-all active:bg-indigo-700 disabled:opacity-50 flex items-center justify-center"
      >
        <RefreshCcw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
      </button>
    </div>
  );
}

