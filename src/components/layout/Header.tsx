import Link from "next/link";
import { getCachedCategories } from "@/lib/data/categories";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { LogIn } from "lucide-react";
import UserMenu from "@/components/auth/UserMenu";

export default async function Header() {
  const session = await getServerSession(authOptions);
  const categories = await getCachedCategories();

  return (
    <header className="sticky top-0 z-50 w-full bg-white shadow-sm border-b-[4px] border-red-700">
      {/* Top News Ticker / Date bar */}
      <div className="hidden md:flex bg-slate-900 text-slate-300 text-[11px] py-1.5 px-4 sm:px-6 lg:px-8 justify-between items-center font-bold tracking-widest uppercase">
        <span suppressHydrationWarning>Atualizado: {new Date().toLocaleDateString("pt-BR")}</span>
        <div className="flex gap-6 items-center">
          <Link href="/sobre" className="hover:text-white transition-colors">Institucional</Link>
          <Link href="/contato" className="hover:text-white transition-colors">Fale Conosco</Link>
          
          {session ? (
            <div className="flex items-center gap-1.5">
              <UserMenu user={session.user} />
            </div>
          ) : (
            <Link href="/login" className="flex items-center gap-1.5 bg-red-700 text-white px-3 py-1 -my-1 rounded-sm hover:bg-red-600 transition-colors">
              <LogIn className="w-3.5 h-3.5" />
              <span>Login</span>
            </Link>
          )}
        </div>
      </div>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-[72px]">
          
          <div className="flex-shrink-0 flex items-center">
            <Link href="/" className="group flex items-center gap-2">
              <div className="w-10 h-10 bg-red-700 text-white flex items-center justify-center font-black text-2xl tracking-tighter">
                RG
              </div>
              <span className="font-black text-[28px] tracking-tighter text-slate-900 group-hover:text-red-700 transition-colors">
                gestão
              </span>
            </Link>
          </div>

          <nav className="hidden lg:flex space-x-6">
            <Link href="/" className="text-[14px] font-black text-red-700 hover:underline underline-offset-4 decoration-2 decoration-red-700 transition-all uppercase tracking-tight">
              Capa
            </Link>
            <Link href="/regiao/nacional" className="text-[14px] font-black text-slate-800 hover:text-red-700 hover:underline underline-offset-4 decoration-2 decoration-red-700 transition-all uppercase tracking-tight">
              Brasil
            </Link>
            <Link href="/regiao/internacional" className="text-[14px] font-black text-slate-800 hover:text-red-700 hover:underline underline-offset-4 decoration-2 decoration-red-700 transition-all uppercase tracking-tight">
              Mundo
            </Link>
            <Link href="/regiao/sp" className="text-[14px] font-black text-slate-800 hover:text-red-700 hover:underline underline-offset-4 decoration-2 decoration-red-700 transition-all uppercase tracking-tight">
              São Paulo
            </Link>
            <Link href="/podcasts" className="text-[14px] font-black text-slate-800 hover:text-red-700 hover:underline underline-offset-4 decoration-2 decoration-red-700 transition-all uppercase tracking-tight">
              Podcasts
            </Link>
            {categories.map((cat: any) => (
              <Link 
                key={cat.id} 
                href={`/categoria/${cat.slug}`}
                className="text-[14px] font-black text-slate-800 hover:text-red-700 hover:underline underline-offset-4 decoration-2 decoration-red-700 transition-all uppercase tracking-tight"
              >
                {cat.nome}
              </Link>
            ))}
          </nav>

          <div className="flex items-center space-x-4">
            <button className="text-slate-900 hover:text-red-700 transition-colors p-2" aria-label="Pesquisar">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth={3} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35M16.65 16.65A7.5 7.5 0 1110.5 3a7.5 7.5 0 016.15 13.65z" />
              </svg>
            </button>
            {session && ["admin", "editor", "reporter", "juridico"].includes(session.user?.role as string) && (
              <Link 
                href="/erp" 
                className="hidden sm:inline-flex items-center justify-center px-4 py-2 bg-slate-900 text-[11px] font-black uppercase tracking-widest text-white hover:bg-red-700 transition-colors"
              >
                Painel ERP
              </Link>
            )}
          </div>

        </div>
      </div>
    </header>
  );
}
