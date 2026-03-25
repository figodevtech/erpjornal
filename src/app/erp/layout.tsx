import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";

export default async function ERPLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession(authOptions);
  if (!session) {
    redirect("/api/auth/signin");
  }

  return (
    <div className="flex min-h-screen flex-col md:flex-row bg-gray-50">
      <aside className="w-full md:w-64 bg-slate-900 text-white p-6 md:min-h-screen">
        <h2 className="text-2xl font-black tracking-tight mb-8">Gestão ERP</h2>
        <nav className="flex flex-col gap-2">
          <Link href="/erp/artigos" className="hover:bg-slate-800 p-2 rounded transition-colors text-slate-300 hover:text-white font-medium">Artigos</Link>
          <Link href="/erp/politicos" className="hover:bg-slate-800 p-2 rounded transition-colors text-slate-300 hover:text-white font-medium">Políticos</Link>
          <Link href="/erp/midia" className="hover:bg-slate-800 p-2 rounded transition-colors text-slate-300 hover:text-white font-medium">Biblioteca de Mídia</Link>
          <Link href="/erp/fontes" className="hover:bg-slate-800 p-2 rounded transition-colors text-slate-300 hover:text-white font-medium">Fontes</Link>
          <Link href="/erp/podcasts" className="hover:bg-slate-800 p-2 rounded transition-colors text-slate-300 hover:text-white font-medium">Podcasts</Link>
          <form action="/api/auth/signout" method="POST">
            <button type="submit" className="w-full text-left hover:bg-red-500/10 text-red-400 p-2 rounded transition-colors font-medium mt-auto">Sair</button>
          </form>
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
