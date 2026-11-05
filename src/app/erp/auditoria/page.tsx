import Link from "next/link";
import { Download } from "lucide-react";

import { exigirPermissao } from "@/lib/auth";
import {
  ENTIDADES_AUDITADAS,
  ROTULOS_ACAO,
  camposAlterados,
  rotuloAcao,
  rotuloEntidade,
} from "@/lib/auditoria-formato";
import {
  AUDITORIA_LIMITE_EXPORTACAO,
  filtrosParaQuery,
  lerFiltrosAuditoria,
  listarAuditoria,
  listarAutoresDaAuditoria,
} from "@/lib/data/auditoria";

export const metadata = { title: "Auditoria | ERP" };

interface PageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

/** Link para o registro auditado, quando ele tem tela própria no ERP. */
function linkDoRegistro(entidade: string, id: string | null) {
  if (!id) return null;
  switch (entidade) {
    case "artigo":
      return `/erp/artigos/${id}/edit`;
    case "revista":
      return `/erp/revistas/${id}`;
    case "usuario":
      return `/erp/usuarios`;
    default:
      return null;
  }
}

const formatoData = new Intl.DateTimeFormat("pt-BR", {
  dateStyle: "short",
  timeStyle: "medium",
  timeZone: "America/Sao_Paulo",
});

const campo =
  "w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500";

export default async function AuditoriaPage({ searchParams }: PageProps) {
  await exigirPermissao("auditoria:ler");
  const filtros = lerFiltrosAuditoria(await searchParams);

  const [{ registros, total, totalPaginas }, autores] = await Promise.all([
    listarAuditoria(filtros),
    listarAutoresDaAuditoria(),
  ]);

  const queryFiltros = filtrosParaQuery(filtros);
  const linkPagina = (numero: number) => `/erp/auditoria?${filtrosParaQuery(filtros, numero)}`;
  const linkExportar = `/erp/auditoria/exportar${queryFiltros ? `?${queryFiltros}` : ""}`;

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-gray-900">Auditoria</h1>
          <p className="mt-1 text-sm text-gray-500">
            Quem fez o quê, quando e de onde. Os registros não podem ser editados nem apagados pelo ERP.
          </p>
        </div>
        <a
          href={linkExportar}
          className="flex items-center gap-2 rounded-lg border border-indigo-200 bg-indigo-50 px-5 py-2.5 font-medium text-indigo-700 transition-all hover:bg-indigo-100"
          title={`Exporta até ${AUDITORIA_LIMITE_EXPORTACAO.toLocaleString("pt-BR")} registros com os filtros atuais`}
        >
          <Download className="h-4 w-4" />
          Exportar CSV
        </a>
      </div>

      <form
        method="get"
        className="grid gap-4 rounded-xl border border-gray-200 bg-white p-5 shadow-sm sm:grid-cols-2 lg:grid-cols-6"
      >
        <label className="space-y-1 text-xs font-semibold uppercase tracking-wider text-gray-500">
          Entidade
          <select name="entidade" defaultValue={filtros.entidade ?? ""} className={campo}>
            <option value="">Todas</option>
            {ENTIDADES_AUDITADAS.map((entidade) => (
              <option key={entidade} value={entidade}>
                {rotuloEntidade(entidade)}
              </option>
            ))}
          </select>
        </label>
        <label className="space-y-1 text-xs font-semibold uppercase tracking-wider text-gray-500">
          Ação
          <select name="acao" defaultValue={filtros.acao ?? ""} className={campo}>
            <option value="">Todas</option>
            {Object.entries(ROTULOS_ACAO).map(([acao, rotulo]) => (
              <option key={acao} value={acao}>
                {rotulo}
              </option>
            ))}
          </select>
        </label>
        <label className="space-y-1 text-xs font-semibold uppercase tracking-wider text-gray-500">
          Usuário
          <select name="usuario" defaultValue={filtros.usuarioId ?? ""} className={campo}>
            <option value="">Todos</option>
            {autores.map((autor) => (
              <option key={autor.id} value={autor.id}>
                {autor.nome || autor.email || autor.id}
              </option>
            ))}
          </select>
        </label>
        <label className="space-y-1 text-xs font-semibold uppercase tracking-wider text-gray-500">
          De
          <input type="date" name="de" defaultValue={filtros.de ?? ""} className={campo} />
        </label>
        <label className="space-y-1 text-xs font-semibold uppercase tracking-wider text-gray-500">
          Até
          <input type="date" name="ate" defaultValue={filtros.ate ?? ""} className={campo} />
        </label>
        <label className="space-y-1 text-xs font-semibold uppercase tracking-wider text-gray-500">
          ID do registro
          <input
            type="text"
            name="registro"
            defaultValue={filtros.registroId ?? ""}
            placeholder="UUID"
            className={campo}
          />
        </label>
        <div className="flex gap-3 sm:col-span-2 lg:col-span-6">
          <button
            type="submit"
            className="rounded-lg bg-indigo-600 px-5 py-2 text-sm font-medium text-white hover:bg-indigo-700"
          >
            Filtrar
          </button>
          {queryFiltros && (
            <Link
              href="/erp/auditoria"
              className="rounded-lg border border-gray-300 bg-white px-5 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Limpar filtros
            </Link>
          )}
        </div>
      </form>

      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="min-w-[900px] w-full text-left text-sm">
            <thead className="border-b border-gray-200 bg-gray-50 text-gray-600">
              <tr>
                <th className="px-4 py-3 font-semibold uppercase tracking-wider">Quando</th>
                <th className="px-4 py-3 font-semibold uppercase tracking-wider">Usuário</th>
                <th className="px-4 py-3 font-semibold uppercase tracking-wider">Ação</th>
                <th className="px-4 py-3 font-semibold uppercase tracking-wider">Registro</th>
                <th className="px-4 py-3 font-semibold uppercase tracking-wider">Origem</th>
                <th className="px-4 py-3 font-semibold uppercase tracking-wider">Detalhes</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {registros.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-10 text-center font-medium text-gray-500">
                    Nenhum registro encontrado.
                  </td>
                </tr>
              ) : (
                registros.map((registro) => {
                  const link = linkDoRegistro(registro.entidade, registro.entidadeId);
                  const alterados = camposAlterados(registro.dadoAnterior, registro.dadoNovo);
                  return (
                    <tr key={registro.id} className="align-top hover:bg-gray-50">
                      <td className="whitespace-nowrap px-4 py-3 text-gray-600">
                        {formatoData.format(registro.criadoEm)}
                      </td>
                      <td className="px-4 py-3">
                        <div className="font-medium text-gray-900">{registro.usuario.nome || "—"}</div>
                        <div className="text-xs text-gray-500">{registro.usuario.email}</div>
                      </td>
                      <td className="px-4 py-3 font-medium text-gray-900">{rotuloAcao(registro.acao)}</td>
                      <td className="px-4 py-3">
                        <div className="text-gray-900">{rotuloEntidade(registro.entidade)}</div>
                        {registro.entidadeId &&
                          (link ? (
                            <Link href={link} className="font-mono text-xs text-indigo-600 hover:underline">
                              {registro.entidadeId.slice(0, 8)}
                            </Link>
                          ) : (
                            <span className="font-mono text-xs text-gray-500" title={registro.entidadeId}>
                              {registro.entidadeId.slice(0, 8)}
                            </span>
                          ))}
                      </td>
                      <td className="px-4 py-3 text-xs text-gray-500">
                        <div>{registro.ip || "—"}</div>
                        {registro.userAgent && (
                          <div className="max-w-[180px] truncate" title={registro.userAgent}>
                            {registro.userAgent}
                          </div>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        {registro.dadoAnterior || registro.dadoNovo ? (
                          <details className="max-w-md">
                            <summary className="cursor-pointer text-xs font-medium text-indigo-600">
                              {alterados.length > 0 ? `Alterou: ${alterados.join(", ")}` : "Ver dados"}
                            </summary>
                            <div className="mt-2 grid gap-2">
                              {registro.dadoAnterior && (
                                <div>
                                  <div className="text-[10px] font-bold uppercase text-gray-400">Antes</div>
                                  <pre className="max-h-60 overflow-auto rounded bg-gray-50 p-2 text-[11px] text-gray-700">
                                    {JSON.stringify(registro.dadoAnterior, null, 2)}
                                  </pre>
                                </div>
                              )}
                              {registro.dadoNovo && (
                                <div>
                                  <div className="text-[10px] font-bold uppercase text-gray-400">Depois</div>
                                  <pre className="max-h-60 overflow-auto rounded bg-gray-50 p-2 text-[11px] text-gray-700">
                                    {JSON.stringify(registro.dadoNovo, null, 2)}
                                  </pre>
                                </div>
                              )}
                            </div>
                          </details>
                        ) : (
                          <span className="text-xs text-gray-400">—</span>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
        <nav
          className="flex items-center justify-between border-t border-gray-200 bg-gray-50 px-6 py-3 text-sm text-gray-600"
          aria-label="Paginação da auditoria"
        >
          <span>
            Página {Math.min(filtros.pagina, totalPaginas)} de {totalPaginas} · {total.toLocaleString("pt-BR")} registros
          </span>
          <div className="flex gap-2">
            {filtros.pagina > 1 && (
              <Link
                href={linkPagina(Math.min(filtros.pagina, totalPaginas) - 1)}
                className="rounded-lg border border-gray-300 bg-white px-3 py-1.5 font-medium hover:bg-gray-100"
              >
                Anterior
              </Link>
            )}
            {filtros.pagina < totalPaginas && (
              <Link
                href={linkPagina(filtros.pagina + 1)}
                className="rounded-lg border border-gray-300 bg-white px-3 py-1.5 font-medium hover:bg-gray-100"
              >
                Próxima
              </Link>
            )}
          </div>
        </nav>
      </div>
    </div>
  );
}
