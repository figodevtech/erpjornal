import Link from "next/link";
import { MoveLeft } from "lucide-react";

import { exigirAlgumaPermissao, temPermissao } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { ArticleStatus } from "@/lib/types/article-status";

import { KanbanBoard } from "../components/KanbanBoard";

export default async function ArticlesKanbanPage() {
  const session = await exigirAlgumaPermissao(["artigos:editar", "artigos:publicar"]);
  const podeCriar = temPermissao(session, "artigos:criar");

  const artigos = await prisma.artigo.findMany({
    include: {
      autor: true,
      categoria: true,
    },
    orderBy: {
      atualizadoEm: "desc",
    },
  });

  return (
    <div className="flex h-screen flex-col overflow-hidden">
      <div className="flex items-center justify-between border-b border-gray-200 bg-white px-8 py-4">
        <div className="flex items-center gap-4">
          <Link
            href="/erp/artigos"
            className="rounded-full p-2 text-gray-400 transition-colors hover:bg-gray-50 hover:text-gray-600"
          >
            <MoveLeft className="h-5 w-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-serif font-bold text-[#002045]">Editorial Workflow</h1>
            <p className="text-xs font-medium uppercase tracking-tight text-gray-400">
              Gestao Editorial de Materias
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {podeCriar && (
            <Link
              href="/erp/artigos/novo"
              className="rounded bg-[#002045] px-4 py-2 text-sm font-semibold text-white shadow-sm transition-all hover:shadow-md active:scale-95"
            >
              Nova Materia
            </Link>
          )}
        </div>
      </div>

      <div className="flex-1 overflow-auto">
        <KanbanBoard
          initialArticles={artigos.map((a) => ({
            ...a,
            autor: a.autor ? { ...a.autor, nome: a.autor.nome || "Redacao" } : null,
            criadoEm: a.criadoEm,
            status: (a.status as ArticleStatus) || ArticleStatus.pauta,
          }))}
        />
      </div>
    </div>
  );
}
