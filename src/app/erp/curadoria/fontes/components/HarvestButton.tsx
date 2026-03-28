"use client";

import { useState } from "react";
import { RefreshCcw } from "lucide-react";
import { harvestFeed } from "../../actions";
import { toast } from "sonner";

export function HarvestButton({ sourceId }: { sourceId: string }) {
  const [loading, setLoading] = useState(false);

  async function handleHarvest() {
    setLoading(true);
    try {
      const res = await harvestFeed(sourceId);
      toast.success(`${res.count} novos itens coletados!`);
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      onClick={handleHarvest}
      disabled={loading}
      title="Coletar agora"
      className="p-2.5 bg-indigo-50 text-indigo-600 rounded-xl hover:bg-indigo-600 hover:text-white transition-all active:scale-90 disabled:opacity-50"
    >
      <RefreshCcw className={`w-5 h-5 ${loading ? "animate-spin" : ""}`} />
    </button>
  );
}

