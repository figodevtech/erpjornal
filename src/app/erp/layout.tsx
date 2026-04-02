import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import SignOutButton from "@/components/auth/SignOutButton";
import { isModuleEnabled } from "@/lib/config/modules";


export default async function ERPLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession(authOptions);
  if (!session) {
    redirect("/login");
  }

  const podcastsEnabled = isModuleEnabled("podcasts");
  const mediaEnabled = isModuleEnabled("videos"); // "midia" in ERP corresponds to "videos" module in config

  return (
    <div className="flex min-h-screen flex-col md:flex-row bg-gray-50">
      <aside className="w-full md:w-64 bg-gray-900 text-white p-6 md:min-h-screen">
        <h2 className="text-2xl font-black tracking-tight mb-8">Gestão ERP</h2>
        <nav className="flex flex-col gap-2">
          <Link href="/" className="mb-4 flex items-center gap-2 text-[11px] font-black uppercase tracking-widest text-gray-400 hover:text-white transition-colors border border-gray-700/50 p-2 rounded bg-gray-800/20">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={3} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Voltar ao Portal
          </Link>
          <Link href="/erp" className="hover:bg-gray-800 p-2 rounded transition-colors text-white font-bold flex items-center gap-2">
            <svg className="w-4 h-4 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>
            Painel Principal
          </Link>
          <div className="h-px bg-gray-800 my-2" />
          <Link href="/erp/artigos" className="hover:bg-gray-800 p-2 rounded transition-colors text-gray-300 hover:text-white font-medium">Artigos</Link>
          <Link href="/erp/politicos" className="hover:bg-gray-800 p-2 rounded transition-colors text-gray-300 hover:text-white font-medium">Políticos</Link>
          {mediaEnabled && (
            <Link href="/erp/midia" className="hover:bg-gray-800 p-2 rounded transition-colors text-gray-300 hover:text-white font-medium">Biblioteca de Mídia</Link>
          )}
          <Link href="/erp/fontes" className="hover:bg-gray-800 p-2 rounded transition-colors text-gray-300 hover:text-white font-medium">Fontes</Link>
          {podcastsEnabled && (
            <Link href="/erp/podcasts" className="hover:bg-gray-800 p-2 rounded transition-colors text-gray-300 hover:text-white font-medium">Podcasts</Link>
          )}
          <div className="h-px bg-gray-800 my-2" />

          <div className="px-2 py-1 text-[10px] font-black text-gray-500 uppercase tracking-widest italic">Inteligência</div>
          <Link href="/erp/curadoria/dashboard" className="hover:bg-indigo-500/20 p-2 rounded transition-colors text-indigo-400 hover:text-indigo-300 font-black uppercase text-xs tracking-widest flex items-center gap-2">
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
            Curadoria RSS
          </Link>
          <Link href="/erp/curadoria/fontes" className="hover:bg-gray-800 p-2 rounded transition-colors text-gray-300 hover:text-white font-medium text-xs pl-8">Gerenciar Feeds</Link>
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

