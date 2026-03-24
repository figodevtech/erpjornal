import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import ArticleForm from "../components/ArticleForm";
import Link from "next/link";
import { redirect } from "next/navigation";

export default async function NovoArtigoPage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/api/auth/signin");

  const categories = await prisma.category.findMany({
    select: { id: true, nome: true },
    orderBy: { nome: "asc" }
  });

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center gap-4">
        <Link 
          href="/erp/artigos" 
          className="text-slate-400 hover:text-slate-900 bg-white hover:bg-slate-100 p-2 rounded-full shadow-sm transition-all border border-slate-200"
          aria-label="Voltar para a listagem"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
        </Link>
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Nova Matéria</h1>
          <p className="text-sm text-slate-500 mt-1">Preencha os dados e escolha o fluxo de publicação.</p>
        </div>
      </div>

      <ArticleForm categories={categories} userRole={session.user.role} />
    </div>
  );
}
