import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import SignOutButton from "@/components/auth/SignOutButton";

export default async function ERPLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession(authOptions);
  if (!session) {
    redirect("/login");
  }

  return (
    <div className="flex min-h-screen flex-col md:flex-row bg-gray-50">
      <aside className="w-full md:w-64 bg-slate-900 text-white p-6 md:min-h-screen">
        <h2 className="text-2xl font-black tracking-tight mb-8">Gestão ERP</h2>
        <nav className="flex flex-col gap-2">
          <Link href="/" className="mb-4 flex items-center gap-2 text-[11px] font-black uppercase tracking-widest text-slate-400 hover:text-white transition-colors border border-slate-700/50 p-2 rounded bg-slate-800/20">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={3} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Voltar ao Portal
          </Link>
          <div className="h-px bg-slate-800 my-2" />
          <Link href="/erp/artigos" className="hover:bg-slate-800 p-2 rounded transition-colors text-slate-300 hover:text-white font-medium">Artigos</Link>
          <Link href="/erp/politicos" className="hover:bg-slate-800 p-2 rounded transition-colors text-slate-300 hover:text-white font-medium">Políticos</Link>
          <Link href="/erp/midia" className="hover:bg-slate-800 p-2 rounded transition-colors text-slate-300 hover:text-white font-medium">Biblioteca de Mídia</Link>
          <Link href="/erp/fontes" className="hover:bg-slate-800 p-2 rounded transition-colors text-slate-300 hover:text-white font-medium">Fontes</Link>
          <Link href="/erp/podcasts" className="hover:bg-slate-800 p-2 rounded transition-colors text-slate-300 hover:text-white font-medium">Podcasts</Link>
          <SignOutButton className="w-full text-left hover:bg-red-500/10 text-red-400 p-2 rounded transition-colors font-medium mt-auto" />
        </nav>
      </aside>
      <main className="flex-1 p-6 md:p-10">
        <div className="max-w-6xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
}
