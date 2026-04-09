"use client";

import { useEffect, useRef } from "react";
import { incrementArticleViews } from "@/app/actions/analytics";

interface ViewCounterProps {
  artigoId: string;
}

/**
 * Componente que dispara o incremento de visualizações de forma atômica no Redis.
 * É um componente invisível que roda apenas no lado do cliente uma única vez.
 */
export function ViewCounter({ artigoId }: ViewCounterProps) {
  const hasCalled = useRef(false);

  useEffect(() => {
    // Evita chamadas duplicadas no Modo de Desenvolvimento StrictMode
    if (hasCalled.current) return;
    
    // Incrementa a visualização no Redis
    incrementArticleViews(artigoId);
    
    hasCalled.current = true;
  }, [artigoId]);

  return null;
}
