"use client";

import * as React from "react";
import { Moon, Sun, Monitor, ChevronDown } from "lucide-react";
import { useTheme } from "next-themes";

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

  const options = [
    { id: "light", label: "Claro", icon: Sun },
    { id: "dark", label: "Escuro", icon: Moon },
    { id: "system", label: "Sistema", icon: Monitor },
  ];

  const currentOption = options.find((opt) => opt.id === theme) || options[2];

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 text-gray-300 hover:text-white transition-all bg-transparent p-1 focus:outline-none group h-8 rounded-lg"
        aria-expanded={isOpen}
        aria-haspopup="true"
        aria-label="Selecionar tema"
      >
        <div className="flex items-center gap-1.5 pointer-events-none">
          <currentOption.icon className="h-3.5 w-3.5 text-red-700" />
          <span className="text-[10px] font-black uppercase tracking-[0.2em] hidden sm:inline">
            {currentOption.label}
          </span>
        </div>
        <ChevronDown 
          className={`w-3.5 h-3.5 text-gray-500 group-hover:text-white transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} 
        />
      </button>

      {/* DROPDOWN CUSTOMIZADO (ESTILO LOGIN) */}
      {isOpen && (
        <div className="absolute right-0 mt-3 w-40 bg-white dark:bg-gray-900 rounded-xl shadow-2xl z-[100] border border-gray-100 dark:border-gray-800 animate-in fade-in zoom-in duration-200 overflow-hidden transition-colors py-2">
          <div className="px-3 py-2 border-b border-gray-100 dark:border-gray-800 mb-1">
            <p className="text-[9px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest">Tema Visual</p>
          </div>
          {options.map((opt) => (
            <button
              key={opt.id}
              onClick={() => {
                setTheme(opt.id);
                setIsOpen(false);
              }}
              className={`flex w-full items-center gap-3 px-4 py-3 text-[11px] font-black uppercase tracking-widest transition-all ${
                theme === opt.id
                  ? "bg-red-700 text-white"
                  : "text-gray-600 dark:text-gray-400 hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-700 dark:hover:text-white"
              }`}
            >
              <opt.icon className={`h-3.5 w-3.5 ${theme === opt.id ? 'text-white' : 'text-red-700 opacity-60'}`} />
              {opt.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

