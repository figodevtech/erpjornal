import Link from "next/link";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-slate-900 border-t-8 border-red-700 mt-20 text-white">
      <div className="max-w-7xl mx-auto py-16 px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-12">
          
          <div className="col-span-1 md:col-span-5">
            <Link href="/" className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-red-700 text-white flex items-center justify-center font-black text-xl tracking-tighter">
                RG
              </div>
              <span className="font-black text-3xl tracking-tighter text-white">
                gestão
              </span>
            </Link>
            <p className="text-slate-400 text-[15px] leading-relaxed max-w-sm mb-6 font-medium">
              O portal de notícias focado em gestão pública e privada, governança, bastidores políticos e economia do Brasil.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="w-10 h-10 bg-slate-800 flex items-center justify-center hover:bg-red-700 transition-colors rounded-sm text-white">
                <span className="sr-only">Twitter</span>
                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24"><path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84"/></svg>
              </a>
               <a href="#" className="w-10 h-10 bg-slate-800 flex items-center justify-center hover:bg-red-700 transition-colors rounded-sm text-white">
                <span className="sr-only">Facebook</span>
                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24"><path fillRule="evenodd" d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" clipRule="evenodd" /></svg>
              </a>
            </div>
          </div>
          
          <div className="col-span-1 md:col-span-3">
            <h3 className="text-[13px] font-black text-white tracking-widest uppercase mb-5 border-l-4 border-red-700 pl-3">Editorias</h3>
            <ul className="space-y-3">
              <li><Link href="/categoria/executivo" className="text-[15px] font-medium text-slate-400 hover:text-white transition-colors">Executivo</Link></li>
              <li><Link href="/categoria/legislativo" className="text-[15px] font-medium text-slate-400 hover:text-white transition-colors">Legislativo</Link></li>
              <li><Link href="/categoria/judiciario" className="text-[15px] font-medium text-slate-400 hover:text-white transition-colors">Judiciário</Link></li>
              <li><Link href="/categoria/negocios" className="text-[15px] font-medium text-slate-400 hover:text-white transition-colors">Negócios</Link></li>
            </ul>
          </div>

          <div className="col-span-1 md:col-span-4">
            <h3 className="text-[13px] font-black text-white tracking-widest uppercase mb-5 border-l-4 border-slate-700 pl-3">Corporativo</h3>
            <ul className="space-y-3">
              <li><Link href="/sobre" className="text-[15px] font-medium text-slate-400 hover:text-white transition-colors">Sobre Nós</Link></li>
              <li><Link href="/expediente" className="text-[15px] font-medium text-slate-400 hover:text-white transition-colors">Expediente</Link></li>
              <li><Link href="/politica-de-privacidade" className="text-[15px] font-medium text-slate-400 hover:text-white transition-colors">Política de Privacidade</Link></li>
              <li><Link href="/erp/login" className="text-[14px] font-black text-red-500 hover:text-red-400 transition-colors uppercase mt-4 block tracking-widest">Central do Redator</Link></li>
            </ul>
          </div>
          
        </div>
        
        <div className="mt-16 pt-8 border-t border-slate-800 flex flex-col md:flex-row justify-between items-center bg-slate-900">
          <p className="text-slate-500 text-[13px] font-medium">
            &copy; {currentYear} Grupo Revista Gestão. Todos os direitos reservados.
          </p>
          <div className="mt-4 md:mt-0">
             <span className="text-slate-600 text-[11px] font-black uppercase tracking-widest">Desde 2024</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
