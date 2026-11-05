import Link from "next/link";
import { MoveLeft } from "lucide-react";

import { exigirAlgumaPermissao, temPermissao } from "@/lib/auth";
import { ETAPAS_FLUXO } from "@/lib/editorial/status";
import { prisma } from "@/lib/prisma";

import { KanbanBoard } from "../components/KanbanBoard";

export default async function ArticlesKanbanPage() {
  const session = await exigirAlgumaPermissao(["artigos:editar", "artigos:publicar"]);
  const podeCriar = temPermissao(session, "artigos:criar");

  // Só os campos que o card usa: antes ia o artigo inteiro (corpo HTML incluído) e
  // todos os dados do autor (e-mail etc.) para o navegador.
  const campos = {
    id: true,
    titulo: true,
    status: true,
    criadoEm: true,
    autor: { select: { nome: true } },
    categoria: { select: { nome: true, cor: true } },
  } as const;

  const [emAndamento, publicados] = await Promise.all([
    // Etapas anteriores à publicação (arquivados ficam fora do Kanban).
    prisma.artigo.findMany({
      where: { revistaId: null, status: { in: ETAPAS_FLUXO.filter((etapa) => etapa !== "publicado") } },
      select: campos,
      orderBy: { atualizadoEm: "desc" },
      take: 300,
    }),
    // Coluna "Publicado": só os 50 mais recentes.
    prisma.artigo.findMany({
      where: { revistaId: null, status: "publicado" },
      select: campos,
      orderBy: { dataPublicacao: "desc" },
      take: 50,
    }),
  ]);
  const artigos = [...emAndamento, ...publicados];

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
              Gestão Editorial de Matérias
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
            autor: a.autor ? { ...a.autor, nome: a.autor.nome || "Redação" } : null,
            criadoEm: a.criadoEm,
            status: a.status,
          }))}
        />
      </div>
    </div>
  );
}
