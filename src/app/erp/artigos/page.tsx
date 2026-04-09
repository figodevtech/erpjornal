import Link from "next/link";
import { Prisma } from "@prisma/client";

import { exigirAlgumaPermissao, temPermissao } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { ArticleStatus } from "@/lib/types/article-status";

import ArticleFilters from "./components/ArticleFilters";

interface PageProps {
  searchParams: Promise<{ search?: string; status?: string }>;
}

export default async function ArtigosPage({ searchParams }: PageProps) {
  const session = await exigirAlgumaPermissao([
    "artigos:ler",
    "artigos:criar",
    "artigos:editar",
    "artigos:publicar",
  ]);
  const resolvedParams = await searchParams;
  const search = resolvedParams?.search || "";
  const status = resolvedParams?.status || "";
  const podeCriar = temPermissao(session, "artigos:criar");
  const podeEditarFluxo =
    temPermissao(session, "artigos:editar") || temPermissao(session, "artigos:publicar");

  const whereClause: Prisma.ArtigoWhereInput = {};
  if (search) {
    whereClause.titulo = { contains: search, mode: "insensitive" };
  }
  if (status) {
    whereClause.status = status as ArticleStatus;
  }

  const artigos = await prisma.artigo.findMany({
    where: whereClause,
    orderBy: { criadoEm: "desc" },
    include: { autor: true },
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
        <h1 className="text-3xl font-extrabold tracking-tight text-gray-900">Artigos</h1>
        <div className="flex items-center gap-3">
          {podeEditarFluxo && (
            <Link
              href="/erp/artigos/kanban"
              className="flex items-center gap-2 rounded-lg border border-indigo-200 bg-indigo-50 px-5 py-2.5 font-medium text-indigo-700 transition-all active:scale-95 hover:bg-indigo-100"
            >
              Visualizar Kanban
            </Link>
          )}
          {podeCriar && (
            <Link
              href="/erp/artigos/novo"
              className="rounded-lg bg-indigo-600 px-5 py-2.5 font-medium text-white shadow-sm transition-all hover:bg-indigo-700 focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
            >
              Escrever Materia
            </Link>
          )}
        </div>
      </div>

      <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
        <ArticleFilters initialSearch={search} initialStatus={status} />
      </div>

      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-gray-200 bg-gray-50 text-gray-600">
              <tr>
                <th className="px-6 py-4 font-semibold uppercase tracking-wider">Titulo</th>
                <th className="px-6 py-4 font-semibold uppercase tracking-wider">Status</th>
                <th className="px-6 py-4 font-semibold uppercase tracking-wider">Autor</th>
                <th className="px-6 py-4 font-semibold uppercase tracking-wider">Data</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {artigos.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-10 text-center font-medium text-gray-500">
                    Nenhum artigo encontrado.
                  </td>
                </tr>
              ) : (
                artigos.map((art) => (
                  <tr key={art.id} className="transition-colors hover:bg-gray-50">
                    <td className="px-6 py-4 font-medium text-gray-900">
                      {podeEditarFluxo ? (
                        <Link href={`/erp/artigos/${art.id}/edit`} className="hover:text-indigo-600 hover:underline">
                          {art.titulo}
                        </Link>
                      ) : (
                        art.titulo
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                          art.status === ArticleStatus.publicado ? "bg-emerald-100 text-emerald-800" : ""
                        } ${art.status === ArticleStatus.revisao ? "bg-amber-100 text-amber-800" : ""} ${
                          art.status === ArticleStatus.pauta ? "bg-gray-100 text-gray-800" : ""
                        }`}
                      >
                        {art.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-gray-600">{art.autor?.nome || "-"}</td>
                    <td className="px-6 py-4 text-gray-600">{art.criadoEm.toLocaleDateString("pt-BR")}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
