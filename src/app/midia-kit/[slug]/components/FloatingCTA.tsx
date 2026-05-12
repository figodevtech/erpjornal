"use client";

import { useState, useEffect } from "react";
import { ArrowUp, MessageCircle } from "lucide-react";
import { MediaKitTheme } from "@/types/media-kit";

interface Props {
  theme: MediaKitTheme;
}

export default function FloatingCTA({ theme }: Props) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => setVisible(window.scrollY > 400);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  if (!visible) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-3">
      <a
        href="#section-contact"
        className="flex items-center gap-2 rounded-full px-5 py-3 text-sm font-bold shadow-2xl transition-all hover:scale-105 hover:shadow-3xl"
        style={{ backgroundColor: theme.primaryColor, color: "#fff" }}
      >
        <MessageCircle className="h-4 w-4" />
        <span className="hidden sm:inline">Fale com o Comercial</span>
      </a>
      <button
        onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
        className="flex h-10 w-10 items-center justify-center rounded-full border shadow-lg transition-all hover:scale-110"
        style={{
          backgroundColor: theme.backgroundColor,
          borderColor: `${theme.textColor}22`,
          color: theme.textColor,
        }}
        aria-label="Voltar ao topo"
      >
        <ArrowUp className="h-4 w-4" />
      </button>
    </div>
  );
}
