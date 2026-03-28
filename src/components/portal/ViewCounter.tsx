"use client";

import { useEffect, useRef } from "react";
import { incrementArticleViews } from "@/app/actions/analytics";

interface ViewCounterProps {
  articleId: string;
}

/**
 * Componente que dispara o incremento de visualizações de forma atômica no Redis.
 * É um componente invisível que roda apenas no lado do cliente uma única vez.
 */
export function ViewCounter({ articleId }: ViewCounterProps) {
  const hasCalled = useRef(false);

  useEffect(() => {
    // Evita chamadas duplicadas no Modo de Desenvolvimento StrictMode
    if (hasCalled.current) return;
    
    // Incrementa a visualização no Redis
    incrementArticleViews(articleId);
    
    hasCalled.current = true;
  }, [articleId]);

  return null;
}
