"use client";

import { useState } from "react";
import { toggleRSSSourceStatus } from "../../actions";
import { toast } from "sonner";
import { Power, PowerOff } from "lucide-react";

export function StatusToggle({ id, isActive }: { id: string, isActive: boolean }) {
  const [loading, setLoading] = useState(false);

  async function handleToggle() {
    setLoading(true);
    const safeStatus = isActive ?? true; 
    try {
      await toggleRSSSourceStatus(id, safeStatus);
      toast.success(isActive ? "Coleta Automática Desativada" : "Coleta Automática Ativada");
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      onClick={handleToggle}
      disabled={loading}
      className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border transition-all font-black uppercase text-[9px] tracking-widest ${
        isActive 
          ? "bg-emerald-50 border-emerald-100 text-emerald-600 hover:bg-emerald-600 hover:text-white" 
          : "bg-gray-50 border-gray-100 text-gray-400 hover:bg-slate-900 hover:text-white"
      } disabled:opacity-50`}
      title={isActive ? "Desativar Varredura" : "Ativar Varredura"}
    >
      {isActive ? <Power className="w-3.5 h-3.5" /> : <PowerOff className="w-3.5 h-3.5" />}
      {isActive ? "Robô ON" : "Robô OFF"}
    </button>
  );
}
