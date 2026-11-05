"use client";

import { useSyncExternalStore } from "react";

const semAssinatura = () => () => {};

/**
 * `true` depois da hidratação no navegador, `false` no servidor e na hidratação.
 * Substitui o padrão `useEffect(() => setMounted(true), [])`, que causa uma
 * renderização extra em cascata (regra react-hooks/set-state-in-effect).
 */
export function useMontado(): boolean {
  return useSyncExternalStore(
    semAssinatura,
    () => true,
    () => false
  );
}
