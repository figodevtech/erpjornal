import Link from "next/link";
import { Prisma } from "@/generated/prisma/client";

import { exigirPermissao, temPermissao } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { STATUS_INFO, isStatusArtigo } from "@/lib/editorial/status";
import { inteiroLimitado } from "@/lib/http/parametros";

import ArticleFilters from "./components/ArticleFilters";
import ArticleActionsDropdown from "./components/ArticleActionsDropdown";

const POR_PAGINA = 30;

interface PageProps {
  searchParams: Promise<{ search?: string; status?: string; pagina?: string }>;
}

export default async function ArtigosPage({ searchParams }: PageProps) {
  const session = await exigirPermissao("artigos:ler");
  const resolvedParams = await searchParams;
  const search = (resolvedParams?.search || "").slice(0, 200);
  const status = resolvedParams?.status || "";
  const pagina = inteiroLimitado(resolvedParams?.pagina, { padrao: 1, min: 1, max: 10_000 });
  const podeCriar = temPermissao(session, "artigos:criar");
  const podeEditarFluxo =
    temPermissao(session, "artigos:editar") || temPermissao(session, "artigos:publicar");

  const whereClause: Prisma.ArtigoWhereInput = {
    revistaId: null,
  };
  if (search) {
    whereClause.titulo = { contains: search, mode: "insensitive" };
  }
  if (isStatusArtigo(status)) {
    whereClause.status = status;
  }

  // Paginado e só com os campos exibidos (antes carregava todos os artigos com o corpo).
  const [artigos, total] = await Promise.all([
    prisma.artigo.findMany({
      where: whereClause,
      orderBy: { criadoEm: "desc" },
      skip: (pagina - 1) * POR_PAGINA,
      take: POR_PAGINA,
      select: {
        id: true,
        titulo: true,
        status: true,
        criadoEm: true,
        autor: { select: { nome: true } },
      },
    }),
    prisma.artigo.count({ where: whereClause }),
  ]);
  const totalPaginas = Math.max(1, Math.ceil(total / POR_PAGINA));
  const linkPagina = (numero: number) => {
    const params = new URLSearchParams();
    if (search) params.set("search", search);
    if (status) params.set("status", status);
    params.set("pagina", String(numero));
    return `/erp/artigos?${params.toString()}`;
  };

  return (
    <div className="mx-auto max-w-6xl space-y-6">
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
          <table className="min-w-[720px] text-left text-sm">
            <thead className="border-b border-gray-200 bg-gray-50 text-gray-600">
              <tr>
                <th className="px-6 py-4 font-semibold uppercase tracking-wider">Titulo</th>
                <th className="px-6 py-4 font-semibold uppercase tracking-wider">Status</th>
                <th className="px-6 py-4 font-semibold uppercase tracking-wider">Autor</th>
                <th className="px-6 py-4 font-semibold uppercase tracking-wider">Data</th>
                <th className="px-6 py-4 text-right font-semibold uppercase tracking-wider">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {artigos.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-10 text-center font-medium text-gray-500">
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
                        className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${STATUS_INFO[art.status].badge}`}
                      >
                        {STATUS_INFO[art.status].label}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-gray-600">{art.autor?.nome || "-"}</td>
                    <td className="px-6 py-4 text-gray-600">{art.criadoEm.toLocaleDateString("pt-BR")}</td>
                    <td className="px-6 py-4">
                      <ArticleActionsDropdown articleId={art.id} title={art.titulo} canEdit={podeEditarFluxo} />
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        {totalPaginas > 1 && (
          <nav
            className="flex items-center justify-between border-t border-gray-200 bg-gray-50 px-6 py-3 text-sm text-gray-600"
            aria-label="Paginação de artigos"
          >
            <span>
              Página {pagina} de {totalPaginas} · {total} artigos
            </span>
            <div className="flex gap-2">
              {pagina > 1 && (
                <Link href={linkPagina(pagina - 1)} className="rounded-lg border border-gray-300 bg-white px-3 py-1.5 font-medium hover:bg-gray-100">
                  Anterior
                </Link>
              )}
              {pagina < totalPaginas && (
                <Link href={linkPagina(pagina + 1)} className="rounded-lg border border-gray-300 bg-white px-3 py-1.5 font-medium hover:bg-gray-100">
                  Próxima
                </Link>
              )}
            </div>
          </nav>
        )}
      </div>
    </div>
  );
}
