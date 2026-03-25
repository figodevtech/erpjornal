import { prisma } from "@/lib/prisma";
import { KanbanBoard } from "../components/KanbanBoard";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { MoveLeft } from "lucide-react";
import Link from "next/link";

export default async function ArticlesKanbanPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user) redirect("/auth/login");

  const articles = await prisma.article.findMany({
    include: {
      autor: true,
      categoria: true,
    },
    orderBy: {
      updated_at: "desc",
    },
  });

  return (
    <div className="flex flex-col h-screen overflow-hidden">
      {/* Editorial Header */}
      <div className="bg-white border-b border-slate-200 px-8 py-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link 
            href="/erp/artigos"
            className="p-2 hover:bg-slate-50 rounded-full text-slate-400 hover:text-slate-600 transition-colors"
          >
            <MoveLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-serif font-bold text-[#002045]">
              Editorial Workflow
            </h1>
            <p className="text-xs text-slate-400 font-sans tracking-tight uppercase font-medium">
              Gestão Editorial de Matérias
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/erp/artigos/novo"
            className="px-4 py-2 bg-[#002045] text-white text-sm font-semibold rounded shadow-sm hover:shadow-md transition-all active:scale-95"
          >
            Nova Matéria
          </Link>
        </div>
      </div>

      <div className="flex-1 overflow-auto">
        <KanbanBoard initialArticles={articles.map(a => ({
          ...a,
          created_at: a.created_at,
          status_id: a.status_id || "pauta"
        }))} />
      </div>
    </div>
  );
}
