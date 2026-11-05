"use client";

import { useEffect, useRef } from "react";

interface ViewCounterProps {
  slug: string;
}

/**
 * Registra a visualização da matéria uma única vez por montagem.
 * A rota aplica rate limit por IP; falhas são ignoradas (não afetam o leitor).
 */
export function ViewCounter({ slug }: ViewCounterProps) {
  const jaRegistrou = useRef(false);

  useEffect(() => {
    // Evita chamada dupla no StrictMode do desenvolvimento.
    if (jaRegistrou.current) return;
    jaRegistrou.current = true;

    fetch(`/api/articles/${encodeURIComponent(slug)}/view`, {
      method: "POST",
      keepalive: true,
    }).catch(() => {});
  }, [slug]);

  return null;
}
