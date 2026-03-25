import Link from "next/link";
import { getCachedCategories } from "@/lib/data/categories";

export default async function Header() {
  const categories = await getCachedCategories();

  return (
    <header className="sticky top-0 z-50 w-full border-b border-slate-200 bg-white/80 backdrop-blur-lg shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          
          {/* Logo (Provisória) */}
          <div className="flex-shrink-0 flex items-center">
            <Link href="/" className="group flex items-center gap-2 transition-transform active:scale-95">
              <div className="w-10 h-10 bg-indigo-600 text-white rounded-xl shadow-[0_4px_14px_0_rgb(79,70,229,0.39)] flex items-center justify-center font-bold text-xl tracking-tighter">
                RG
              </div>
              <span className="font-extrabold text-2xl tracking-tight text-slate-900 group-hover:text-indigo-600 transition-colors">
                Revista Gestão
              </span>
            </Link>
          </div>

          {/* Navegação Desktop (Categorias Dinâmicas cacheadas) */}
          <nav className="hidden md:flex space-x-6">
            <Link href="/" className="text-sm font-semibold text-slate-600 hover:text-indigo-600 transition-colors">
              Últimas
            </Link>
            {categories.map((cat) => (
              <Link 
                key={cat.id} 
                href={`/categoria/${cat.slug}`}
                className="text-sm font-medium text-slate-600 hover:text-indigo-600 transition-colors"
              >
                {cat.nome}
              </Link>
            ))}
          </nav>

          {/* Ações (Busca ou Login p/ Redatores) */}
          <div className="flex items-center space-x-4">
            <button className="text-slate-400 hover:text-slate-600 transition-colors p-2 rounded-full hover:bg-slate-100" aria-label="Pesquisar">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35M16.65 16.65A7.5 7.5 0 1110.5 3a7.5 7.5 0 016.15 13.65z" />
              </svg>
            </button>
            <Link 
              href="/erp/login" 
              className="hidden sm:inline-flex items-center justify-center px-4 py-2 border border-slate-200 text-sm font-medium rounded-lg text-slate-700 bg-white hover:bg-slate-50 hover:text-indigo-600 transition-colors shadow-sm"
            >
              Portal do Redator
            </Link>
          </div>

        </div>
      </div>
    </header>
  );
}
