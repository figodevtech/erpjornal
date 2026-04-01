import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";
import { ArticleStatus } from "@/lib/types/article-status";
import ArticleFilters from "./components/ArticleFilters";
import Link from "next/link";

// Next.js 15 exige aguardar a Promise de SearchParams
interface PageProps {
  searchParams: Promise<{ search?: string; status?: string }>;
}

export default async function ArtigosPage({ searchParams }: PageProps) {
  const resolvedParams = await searchParams;
  const search = resolvedParams?.search || "";
  const status = resolvedParams?.status || "";

  const whereClause: Prisma.ArticleWhereInput = {};
  if (search) {
    whereClause.titulo = { contains: search, mode: "insensitive" };
  }
  if (status) {
    whereClause.status_id = status as ArticleStatus;
  }

  const articles = await prisma.article.findMany({
    where: whereClause,
    orderBy: { created_at: "desc" },
    include: { autor: true },
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Artigos</h1>
        <div className="flex gap-3 items-center">
          <Link 
            href="/erp/artigos/kanban" 
            className="flex items-center gap-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-medium px-5 py-2.5 rounded-lg border border-indigo-200 transition-all active:scale-95"
          >
            Visualizar Kanban
          </Link>
          <Link 
            href="/erp/artigos/novo" 
            className="bg-indigo-600 hover:bg-indigo-700 text-white font-medium px-5 py-2.5 rounded-lg shadow-sm transition-all focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
          >
            Escrever Matéria
          </Link>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
        <ArticleFilters initialSearch={search} initialStatus={status} />
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50 border-b border-gray-200 text-gray-600">
              <tr>
                <th className="px-6 py-4 font-semibold uppercase tracking-wider">Título</th>
                <th className="px-6 py-4 font-semibold uppercase tracking-wider">Status</th>
                <th className="px-6 py-4 font-semibold uppercase tracking-wider">Autor</th>
                <th className="px-6 py-4 font-semibold uppercase tracking-wider">Data</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {articles.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-10 text-center text-gray-500 font-medium">
                    Nenhum artigo encontrado.
                  </td>
                </tr>
              ) : (
                articles.map((art) => (
                  <tr key={art.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 font-medium text-gray-900">
                      <Link href={`/erp/artigos/${art.id}/edit`} className="hover:text-indigo-600 hover:underline">
                        {art.titulo}
                      </Link>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold
                        ${art.status_id === ArticleStatus.publicado ? 'bg-emerald-100 text-emerald-800' : ''}
                        ${art.status_id === ArticleStatus.revisao ? 'bg-amber-100 text-amber-800' : ''}
                        ${art.status_id === ArticleStatus.pauta ? 'bg-gray-100 text-gray-800' : ''}
                      `}>
                        {art.status_id}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-gray-600">{art.autor?.nome || '—'}</td>
                    <td className="px-6 py-4 text-gray-600">{art.created_at.toLocaleDateString('pt-BR')}</td>
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

