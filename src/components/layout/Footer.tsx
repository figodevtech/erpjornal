import Link from "next/link";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-slate-50 border-t border-slate-200 mt-20">
      <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          
          <div className="col-span-1 md:col-span-2">
            <Link href="/" className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 bg-indigo-600 text-white rounded-lg flex items-center justify-center font-bold text-sm">
                RG
              </div>
              <span className="font-bold text-xl tracking-tight text-slate-900">
                Revista Gestão
              </span>
            </Link>
            <p className="text-slate-500 text-sm leading-relaxed max-w-sm">
              Sua fonte definitiva sobre estratégia, governança e liderança. Nós trazemos as análises que moldam as decisões de amanhã.
            </p>
          </div>
          
          <div>
            <h3 className="text-sm font-semibold text-slate-900 tracking-wider uppercase mb-4">Links Úteis</h3>
            <ul className="space-y-3">
              <li><Link href="/sobre" className="text-sm text-slate-500 hover:text-indigo-600 transition-colors">Sobre Nós</Link></li>
              <li><Link href="/contato" className="text-sm text-slate-500 hover:text-indigo-600 transition-colors">Fale Conosco</Link></li>
              <li><Link href="/expediente" className="text-sm text-slate-500 hover:text-indigo-600 transition-colors">Expediente</Link></li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-sm font-semibold text-slate-900 tracking-wider uppercase mb-4">Acesso Interno</h3>
            <ul className="space-y-3">
              <li><Link href="/erp/login" className="text-sm text-slate-500 hover:text-indigo-600 transition-colors">Login Editorial</Link></li>
              <li><Link href="/politica-de-privacidade" className="text-sm text-slate-500 hover:text-indigo-600 transition-colors">Privacidade</Link></li>
            </ul>
          </div>
          
        </div>
        
        <div className="mt-12 pt-8 border-t border-slate-200/60 flex flex-col md:flex-row justify-between items-center">
          <p className="text-slate-400 text-sm">
            &copy; {currentYear} Revista Gestão. Todos os direitos reservados.
          </p>
          <div className="flex space-x-6 mt-4 md:mt-0">
            <a href="#" className="text-slate-400 hover:text-slate-600">
              <span className="sr-only">Twitter</span>
              <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24"><path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84"/></svg>
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
