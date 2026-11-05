"use client";

import * as React from "react";

type ThemeOption = "light" | "dark" | "system";
type ResolvedTheme = "light" | "dark";

type ThemeContextValue = {
  theme: ThemeOption;
  resolvedTheme: ResolvedTheme;
  setTheme: (theme: ThemeOption) => void;
};

const ThemeContext = React.createContext<ThemeContextValue | null>(null);
const STORAGE_KEY = "theme";

// Preferências lidas como "fontes externas" (useSyncExternalStore): sem setState em
// useEffect e sem guardar o tema antigo num closure. Antes, quem trocava para
// "escuro" voltava a seguir o sistema quando o esquema do sistema operacional mudava.
const ouvintesDoTema = new Set<() => void>();

function lerTemaSalvo(): ThemeOption {
  const salvo = window.localStorage.getItem(STORAGE_KEY);
  return salvo === "light" || salvo === "dark" || salvo === "system" ? salvo : "system";
}

function assinarTema(aviso: () => void) {
  ouvintesDoTema.add(aviso);
  window.addEventListener("storage", aviso); // outras abas
  return () => {
    ouvintesDoTema.delete(aviso);
    window.removeEventListener("storage", aviso);
  };
}

const CONSULTA_ESCURO = "(prefers-color-scheme: dark)";

function sistemaEstaEscuro() {
  return window.matchMedia(CONSULTA_ESCURO).matches;
}

function assinarEsquemaDoSistema(aviso: () => void) {
  const consulta = window.matchMedia(CONSULTA_ESCURO);
  consulta.addEventListener("change", aviso);
  return () => consulta.removeEventListener("change", aviso);
}

function aplicarNoDocumento(tema: ResolvedTheme) {
  const root = document.documentElement;
  root.classList.toggle("dark", tema === "dark");
  root.style.colorScheme = tema;
}

export function Providers({ children }: { children: React.ReactNode }) {
  const theme = React.useSyncExternalStore<ThemeOption>(assinarTema, lerTemaSalvo, () => "system");
  const sistemaEscuro = React.useSyncExternalStore(assinarEsquemaDoSistema, sistemaEstaEscuro, () => false);
  const resolvedTheme: ResolvedTheme = theme === "system" ? (sistemaEscuro ? "dark" : "light") : theme;

  // Efeito só sincroniza o DOM (sistema externo); não altera estado do React.
  React.useEffect(() => {
    aplicarNoDocumento(resolvedTheme);
  }, [resolvedTheme]);

  const setTheme = React.useCallback((nextTheme: ThemeOption) => {
    window.localStorage.setItem(STORAGE_KEY, nextTheme);
    ouvintesDoTema.forEach((aviso) => aviso());
  }, []);

  const value = React.useMemo(
    () => ({
      theme,
      resolvedTheme,
      setTheme,
    }),
    [resolvedTheme, setTheme, theme]
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const context = React.useContext(ThemeContext);

  if (!context) {
    throw new Error("useTheme deve ser usado dentro de Providers.");
  }

  return context;
}
