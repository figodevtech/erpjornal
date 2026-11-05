"use client";

import { useEffect, useState } from "react";

import { criarClienteSupabaseBrowser } from "@/lib/supabase/browser";

export type SessaoPortal = {
  user?: {
    id: string;
    name: string | null;
    email: string | null;
    role: string;
    permissoes?: string[];
  };
} | null;

// Uma única requisição compartilhada entre os componentes da página
// (o Header renderiza o AuthPortal duas vezes: desktop e mobile).
let sessaoEmCache: Promise<SessaoPortal> | null = null;

export function carregarSessaoPortal(forcar = false): Promise<SessaoPortal> {
  if (!sessaoEmCache || forcar) {
    sessaoEmCache = fetch("/api/auth/me", { cache: "no-store" })
      .then(async (resposta) => (resposta.ok ? ((await resposta.json()).sessao as SessaoPortal) : null))
      .catch(() => null);
  }
  return sessaoEmCache;
}

/**
 * Sessão do leitor carregada no navegador.
 *
 * Mantém as páginas do portal estáticas (ISR): o servidor não lê cookies para
 * desenhar o Header. `undefined` = ainda carregando; `null` = sem sessão.
 */
export function useSessaoPortal(): SessaoPortal | undefined {
  const [sessao, setSessao] = useState<SessaoPortal | undefined>(undefined);

  useEffect(() => {
    let ativo = true;
    carregarSessaoPortal().then((valor) => ativo && setSessao(valor));

    const { data } = criarClienteSupabaseBrowser().auth.onAuthStateChange((evento) => {
      if (evento === "SIGNED_IN" || evento === "SIGNED_OUT" || evento === "USER_UPDATED") {
        carregarSessaoPortal(true).then((valor) => ativo && setSessao(valor));
      }
    });

    return () => {
      ativo = false;
      data.subscription.unsubscribe();
    };
  }, []);

  return sessao;
}
