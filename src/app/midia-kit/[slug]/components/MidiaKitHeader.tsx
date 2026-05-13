"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { Menu, X } from "lucide-react";
import { MediaKitTheme } from "@/types/media-kit";

interface Props {
  theme: MediaKitTheme;
  navItems: { id: string; label: string }[];
  kitName: string;
}

export default function MidiaKitHeader({ theme, navItems }: Omit<Props, "kitName">) {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 60);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  function scrollToSection(sectionId: string) {
    const el = document.getElementById(`section-${sectionId}`);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
      setMenuOpen(false);
    }
  }

  return (
    <header
      className={`sticky top-0 z-50 transition-all duration-300 ${
        scrolled ? "shadow-lg backdrop-blur-xl" : ""
      }`}
      style={{
        backgroundColor: scrolled ? `${theme.backgroundColor}ee` : "transparent",
      }}
    >
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
        <Link href="/" className="shrink-0" aria-label="Voltar ao portal">
          <Image
            src="/logo.png"
            alt="Revista Gestão"
            width={140}
            height={38}
            className="h-9 w-auto"
            priority
          />
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden items-center gap-1 lg:flex">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => scrollToSection(item.id)}
              className="rounded-lg px-3 py-2 text-[13px] font-bold uppercase tracking-wider transition-colors hover:bg-black/5"
              style={{ color: theme.textColor }}
            >
              {item.label}
            </button>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          <a
            href="#section-contact"
            className="hidden rounded-xl px-5 py-2.5 text-sm font-bold transition-all hover:shadow-lg sm:inline-flex"
            style={{
              backgroundColor: theme.primaryColor,
              color: "#fff",
            }}
          >
            Solicitar Proposta
          </a>

          {/* Mobile menu toggle */}
          <button
            className="lg:hidden rounded-lg p-2 transition-colors hover:bg-black/5"
            onClick={() => setMenuOpen(!menuOpen)}
            style={{ color: theme.textColor }}
            aria-label="Menu"
          >
            {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Nav */}
      {menuOpen && (
        <div
          className="border-t px-6 py-4 lg:hidden"
          style={{ backgroundColor: theme.backgroundColor, borderColor: `${theme.textColor}11` }}
        >
          <div className="flex flex-col gap-1">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => scrollToSection(item.id)}
                className="rounded-lg px-4 py-3 text-left text-sm font-bold uppercase tracking-wider transition-colors hover:bg-black/5"
                style={{ color: theme.textColor }}
              >
                {item.label}
              </button>
            ))}
            <a
              href="#section-contact"
              onClick={() => setMenuOpen(false)}
              className="mt-2 rounded-xl px-4 py-3 text-center text-sm font-bold transition-all"
              style={{ backgroundColor: theme.primaryColor, color: "#fff" }}
            >
              Solicitar Proposta
            </a>
          </div>
        </div>
      )}
    </header>
  );
}
