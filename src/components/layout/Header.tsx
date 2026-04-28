import Link from "next/link";
import Image from "next/image";
import { getCachedCategories } from "@/lib/data/categories";
import { obterSessao } from "@/lib/auth";

import AuthPortal from "@/components/auth/AuthPortal";
import ThemeToggle from "./ThemeToggle";
import SearchBar from "./SearchBar";
import { isModuleEnabled } from "@/lib/config/modules";


export default async function Header() {
  const session = await obterSessao();
  const categories = await getCachedCategories();

  const podcastsEnabled = isModuleEnabled("podcasts");
  const videosEnabled = isModuleEnabled("videos");

  return (
    <header className="dark sticky top-0 z-50 w-full bg-[#0f172a] shadow-md border-b-[4px] border-red-700 transition-colors duration-300">
      {/* 1. TOP BAR */}
      <div className="hidden md:flex bg-slate-950 text-slate-300 text-[11px] py-1.5 px-4 sm:px-6 lg:px-8 justify-between items-center font-bold tracking-widest uppercase border-b border-slate-800/50">
        <span suppressHydrationWarning>Atualizado: {new Date().toLocaleDateString("pt-BR")}</span>
        <div className="flex gap-6 items-center">
          <Link href="/sobre" className="text-slate-300 hover:text-white transition-colors hover:underline underline-offset-4">Institucional</Link>
          <Link href="/contato" className="text-slate-300 hover:text-white transition-colors hover:underline underline-offset-4">Fale Conosco</Link>
          <ThemeToggle />
          <AuthPortal session={session} />
        </div>
      </div>

      {/* 2. MAIN BAR */}
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-[80px]">

          <div className="flex-shrink-0 flex items-center">
            <Link href="/" className="group flex items-center gap-2 outline-none focus-visible:ring-2 focus-visible:ring-red-700/50 rounded-lg p-1" aria-label="Revista Gestão - Início">
              <Image
                src="/logo.png"
                alt="Revista Gestão Logo"
                width={180}
                height={50}
                className="h-18 md:h-24 w-auto object-contain drop-shadow-[0_2px_12px_rgba(255,255,255,0.25)] transition-all duration-300 group-hover:scale-105 group-hover:drop-shadow-[0_4px_16px_rgba(255,255,255,0.35)]"
                priority
              />
            </Link>
          </div>

          <nav className="hidden lg:flex flex-1 justify-center space-x-8">
            <Link href="/regiao/nacional" className="text-[15px] font-black text-slate-100 hover:text-red-500 hover:underline underline-offset-4 decoration-2 decoration-red-600 transition-all uppercase tracking-tight focus-visible:text-red-500 outline-none">
              Brasil
            </Link>
            <Link href="/regiao/internacional" className="text-[15px] font-black text-slate-100 hover:text-red-500 hover:underline underline-offset-4 decoration-2 decoration-red-600 transition-all uppercase tracking-tight focus-visible:text-red-500 outline-none">
              Mundo
            </Link>
            {podcastsEnabled && (
              <Link href="/podcasts" className="text-[15px] font-black text-slate-100 hover:text-red-500 hover:underline underline-offset-4 decoration-2 decoration-red-600 transition-all uppercase tracking-tight focus-visible:text-red-500 outline-none">
                Podcasts
              </Link>
            )}
            {videosEnabled && (
              <Link href="/videos" className="text-[15px] font-black text-slate-100 hover:text-red-500 hover:underline underline-offset-4 decoration-2 decoration-red-600 transition-all uppercase tracking-tight focus-visible:text-red-500 outline-none">
                Vídeos
              </Link>
            )}
            {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
            {categories.slice(0, 5).map((cat: any) => (
              <Link
                key={cat.id}
                href={`/categoria/${cat.slug}`}
                className="text-[14px] font-bold text-slate-100 hover:text-red-500 hover:underline underline-offset-4 decoration-2 decoration-red-600 transition-all uppercase tracking-tight focus-visible:text-red-500 outline-none shrink-0"
              >
                {cat.nome}
              </Link>
            ))}
          </nav>

          <div className="flex items-center space-x-2">
            <SearchBar />
            <div className="md:hidden flex items-center gap-2">
              <ThemeToggle />
              <AuthPortal session={session} />
            </div>
          </div>

        </div>
      </div>
    </header>
  );
}

