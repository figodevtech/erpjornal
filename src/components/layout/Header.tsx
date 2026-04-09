import Link from "next/link";
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
    <header className="sticky top-0 z-50 w-full bg-white dark:bg-gray-950 shadow-sm border-b-[4px] border-red-700 transition-colors duration-300">
      {/* 1. TOP BAR */}
      <div className="hidden md:flex bg-gray-900 dark:bg-black text-gray-300 text-[11px] py-1.5 px-4 sm:px-6 lg:px-8 justify-between items-center font-bold tracking-widest uppercase">
        <span suppressHydrationWarning>Atualizado: {new Date().toLocaleDateString("pt-BR")}</span>
        <div className="flex gap-6 items-center">
          <Link href="/sobre" className="hover:text-white transition-colors">Institucional</Link>
          <Link href="/contato" className="hover:text-white transition-colors">Fale Conosco</Link>
          <ThemeToggle />
          <AuthPortal session={session} />
        </div>
      </div>

      {/* 2. MAIN BAR */}
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-[72px]">

          <div className="flex-shrink-0 flex items-center">
            <Link href="/" className="group flex items-center gap-2 outline-none focus-visible:ring-2 focus-visible:ring-red-700/50 rounded-lg p-1" aria-label="Revista Gestão - Início">
              <div className="w-10 h-10 bg-red-700 text-white flex items-center justify-center font-black text-2xl tracking-tighter" aria-hidden="true">
                RG
              </div>
              <span className="font-black text-[28px] tracking-tighter text-gray-900 dark:text-gray-100 group-hover:text-red-700 transition-colors">
                gestão
              </span>
            </Link>
          </div>

          <nav className="hidden lg:flex flex-1 justify-center space-x-8">
            <Link href="/regiao/nacional" className="text-[14px] font-black text-gray-950 dark:text-gray-100 hover:text-red-700 hover:underline underline-offset-4 decoration-2 decoration-red-700 transition-all uppercase tracking-tight focus-visible:text-red-700 outline-none">
              Brasil
            </Link>
            <Link href="/regiao/internacional" className="text-[14px] font-black text-gray-950 dark:text-gray-100 hover:text-red-700 hover:underline underline-offset-4 decoration-2 decoration-red-700 transition-all uppercase tracking-tight focus-visible:text-red-700 outline-none">
              Mundo
            </Link>
            {podcastsEnabled && (
              <Link href="/podcasts" className="text-[14px] font-black text-gray-950 dark:text-gray-100 hover:text-red-700 hover:underline underline-offset-4 decoration-2 decoration-red-700 transition-all uppercase tracking-tight">
                Podcasts
              </Link>
            )}
            {videosEnabled && (
              <Link href="/videos" className="text-[14px] font-black text-gray-950 dark:text-gray-100 hover:text-red-700 hover:underline underline-offset-4 decoration-2 decoration-red-700 transition-all uppercase tracking-tight focus-visible:text-red-700 outline-none">
                Vídeos
              </Link>
            )}
            {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
            {categories.slice(0, 5).map((cat: any) => (
              <Link
                key={cat.id}
                href={`/categoria/${cat.slug}`}
                className="text-[13px] font-bold text-gray-900 dark:text-gray-100 hover:text-red-700 hover:underline underline-offset-4 decoration-2 decoration-red-700 transition-all uppercase tracking-tight shrink-0"
              >
                {cat.nome}
              </Link>
            ))}
          </nav>

          <div className="flex items-center space-x-2">
            <SearchBar />
            <div className="md:hidden">
              <AuthPortal session={session} />
            </div>
          </div>

        </div>
      </div>
    </header>
  );
}

