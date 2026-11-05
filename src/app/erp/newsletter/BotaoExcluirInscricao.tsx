"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";
import { toast } from "sonner";

import { excluirInscricaoNewsletter } from "./actions";

export default function BotaoExcluirInscricao({ id, email }: { id: string; email: string }) {
  const router = useRouter();
  const [excluindo, setExcluindo] = useState(false);

  async function excluir() {
    const confirmado = window.confirm(
      `Apagar definitivamente os dados de ${email}?\n\nUse só a pedido do titular (LGPD). Para parar os envios, o próprio leitor usa o link "Não quero mais receber".`
    );
    if (!confirmado) return;
    setExcluindo(true);
    try {
      const resultado = await excluirInscricaoNewsletter(id);
      if (!resultado.ok) {
        toast.error(resultado.error);
        return;
      }
      toast.success("Dados apagados.");
      router.refresh();
    } finally {
      setExcluindo(false);
    }
  }

  return (
    <button
      type="button"
      onClick={() => void excluir()}
      disabled={excluindo}
      className="rounded p-1.5 text-gray-400 hover:bg-rose-50 hover:text-rose-600 disabled:opacity-50"
      aria-label={`Apagar os dados de ${email}`}
      title="Apagar dados (pedido do titular)"
    >
      <Trash2 className="h-4 w-4" />
    </button>
  );
}
