"use client";

import * as React from "react";
import { Moon, Sun, Monitor, ChevronDown } from "lucide-react";
import { useTheme } from "@/app/providers";

export default function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);
  const [isOpen, setIsOpen] = React.useState(false);
  const menuRef = React.useRef<HTMLDivElement>(null);

  // Evita hidratação incorreta
  React.useEffect(() => {
    setMounted(true);
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  if (!mounted) {
    return <div className="w-24 h-8 bg-gray-800/50 animate-pulse rounded-lg" />;
  }

  const options: Array<{ id: "light" | "dark" | "system"; label: string; icon: typeof Sun }> = [
    { id: "light", label: "Claro", icon: Sun },
    { id: "dark", label: "Escuro", icon: Moon },
    { id: "system", label: "Sistema", icon: Monitor },
  ];

  const currentOption = options.find((opt) => opt.id === theme) || options[2];

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="group flex h-8 items-center gap-2 rounded-lg bg-transparent p-1 text-slate-100 transition-all hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-red-500/70"
        aria-expanded={isOpen}
        aria-haspopup="true"
        aria-label="Selecionar tema"
      >
        <div className="pointer-events-none flex items-center gap-1.5">
          <currentOption.icon className="h-4 w-4 text-red-500" />
          <span className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-100 group-hover:text-white">
            {currentOption.label}
          </span>
        </div>
        <ChevronDown
          className={`h-4 w-4 text-slate-300 transition-transform duration-200 group-hover:text-white ${isOpen ? "rotate-180" : ""}`}
        />
      </button>

      {/* DROPDOWN CUSTOMIZADO (ESTILO LOGIN) */}
      {isOpen && (
        <div className="absolute right-0 z-[100] mt-3 w-44 overflow-hidden rounded-xl border border-gray-200 bg-white py-2 shadow-2xl transition-colors animate-in fade-in zoom-in duration-200 dark:border-gray-700 dark:bg-gray-900">
          <div className="mb-1 border-b border-gray-200 px-3 py-2 dark:border-gray-700">
            <p className="text-[10px] font-black uppercase tracking-widest text-gray-200 dark:text-gray-200">
              Tema Visual
            </p>
          </div>
          {options.map((opt) => (
            <button
              key={opt.id}
              onClick={() => {
                setTheme(opt.id);
                setIsOpen(false);
              }}
              className={`flex w-full items-center gap-3 px-4 py-3 text-[12px] font-black uppercase tracking-widest transition-all ${
                theme === opt.id
                  ? "bg-red-700 text-white"
                  : "text-gray-900 hover:bg-red-50 hover:text-red-800 dark:text-gray-100 dark:hover:bg-red-900/30 dark:hover:text-white"
              }`}
            >
              <opt.icon className={`h-3.5 w-3.5 ${theme === opt.id ? "text-white" : "text-red-700 dark:text-red-400"}`} />
              {opt.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
