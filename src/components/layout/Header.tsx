import Link from "next/link";
import { getCachedCategories } from "@/lib/data/categories";

export default async function Header() {
  const categories = await getCachedCategories();

  return (
    <header className="sticky top-0 z-50 w-full bg-white shadow-sm border-b-[4px] border-red-700">
      {/* Top News Ticker / Date bar (optional, makes it look more native) */}
      <div className="hidden md:flex bg-slate-900 text-slate-300 text-[11px] py-1.5 px-4 sm:px-6 lg:px-8 justify-between items-center font-bold tracking-widest uppercase">
        <span>Atualizado: {new Date().toLocaleDateString("pt-BR")}</span>
        <div className="flex gap-6">
          <Link href="/sobre" className="hover:text-white transition-colors">Institucional</Link>
          <Link href="/contato" className="hover:text-white transition-colors">Fale Conosco</Link>
          <Link href="/assine" className="text-red-400 hover:text-red-300 transition-colors">Assine</Link>
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
            {categories.map((cat) => (
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
            <Link 
              href="/erp/login" 
              className="hidden sm:inline-flex items-center justify-center px-4 py-2 bg-slate-900 text-[11px] font-black uppercase tracking-widest text-white hover:bg-red-700 transition-colors"
            >
              Redação
            </Link>
          </div>

        </div>
      </div>
    </header>
  );
}
