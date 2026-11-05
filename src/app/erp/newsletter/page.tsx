import Link from "next/link";
import { AlertTriangle, Download, Mail } from "lucide-react";

import { exigirPermissao, temPermissao } from "@/lib/auth";
import {
  contarInscritosPorStatus,
  lerFiltrosInscritos,
  listarDisparosRecentes,
  listarInscritos,
} from "@/lib/data/newsletter";
import { envioDeEmailConfigurado } from "@/lib/newsletter/email";
import { ROTULOS_STATUS_INSCRICAO, STATUS_INSCRICAO, isStatusInscricao } from "@/lib/newsletter/regras";

import BotaoExcluirInscricao from "./BotaoExcluirInscricao";

export const metadata = { title: "Newsletter | ERP" };

interface PageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

const data = (valor: Date | null) =>
  valor ? valor.toLocaleString("pt-BR", { dateStyle: "short", timeStyle: "short", timeZone: "America/Sao_Paulo" }) : "—";

const CORES_STATUS: Record<string, string> = {
  confirmado: "bg-emerald-50 text-emerald-700",
  pendente: "bg-amber-50 text-amber-700",
  descadastrado: "bg-gray-100 text-gray-500",
};

const ROTULOS_DISPARO: Record<string, string> = {
  enviando: "Enviando",
  enviado: "Enviado",
  parcial: "Parcial",
  falhou: "Falhou",
};

const campo =
  "rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500";

export default async function NewsletterPage({ searchParams }: PageProps) {
  const sessao = await exigirPermissao("newsletter:gerir");
  const filtros = lerFiltrosInscritos(await searchParams);
  const [contagem, { inscritos, total, totalPaginas }, disparos] = await Promise.all([
    contarInscritosPorStatus(),
    listarInscritos(filtros),
    listarDisparosRecentes(),
  ]);
  const podeVerAuditoria = temPermissao(sessao, "auditoria:ler");

  const query = (pagina?: number) => {
    const params = new URLSearchParams();
    if (filtros.status) params.set("status", filtros.status);
    if (filtros.busca) params.set("busca", filtros.busca);
    if (pagina && pagina > 1) params.set("pagina", String(pagina));
    const texto = params.toString();
    return texto ? `?${texto}` : "";
  };

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="flex items-center gap-3 text-3xl font-extrabold tracking-tight text-gray-900">
            <Mail className="h-7 w-7 text-indigo-600" /> Newsletter
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            Só recebe quem confirmou pelo e-mail. A matéria publicada com o canal “Newsletter” é enviada uma vez, até 48h
            depois de entrar no ar.
          </p>
        </div>
        <a
          href={`/erp/newsletter/exportar${query()}`}
          className="flex items-center gap-2 rounded-lg border border-indigo-200 bg-indigo-50 px-5 py-2.5 font-medium text-indigo-700 hover:bg-indigo-100"
        >
          <Download className="h-4 w-4" /> Exportar CSV
        </a>
      </div>

      {!envioDeEmailConfigurado() && (
        <div className="flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
          <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0" />
          <p>
            <strong>E-mail desligado:</strong> sem <code>RESEND_API_KEY</code>, ninguém recebe o link de confirmação e a
            newsletter não é enviada. Configure a chave e o <code>EMAIL_FROM</code> (com domínio verificado no Resend).
          </p>
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-3">
        {Object.values(STATUS_INSCRICAO).map((status) => (
          <Link
            key={status}
            href={`/erp/newsletter?status=${status}`}
            className={`rounded-xl border bg-white p-5 shadow-sm transition-colors hover:border-indigo-300 ${filtros.status === status ? "border-indigo-400" : "border-gray-200"}`}
          >
            <div className="text-3xl font-extrabold text-gray-900">{(contagem[status] ?? 0).toLocaleString("pt-BR")}</div>
            <div className="text-sm text-gray-500">{ROTULOS_STATUS_INSCRICAO[status]}</div>
          </Link>
        ))}
      </div>

      <form method="get" className="flex flex-wrap gap-3 rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
        <input type="search" name="busca" defaultValue={filtros.busca ?? ""} placeholder="Buscar e-mail" className={`${campo} min-w-60 flex-1`} />
        <select name="status" defaultValue={filtros.status ?? ""} className={campo} aria-label="Situação">
          <option value="">Todas as situações</option>
          {Object.values(STATUS_INSCRICAO).map((status) => (
            <option key={status} value={status}>
              {ROTULOS_STATUS_INSCRICAO[status]}
            </option>
          ))}
        </select>
        <button type="submit" className="rounded-lg bg-indigo-600 px-5 py-2 text-sm font-medium text-white hover:bg-indigo-700">
          Filtrar
        </button>
      </form>

      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[760px] text-left text-sm">
            <thead className="border-b border-gray-200 bg-gray-50 text-gray-600">
              <tr>
                <th className="px-4 py-3 font-semibold">E-mail</th>
                <th className="px-4 py-3 font-semibold">Situação</th>
                <th className="px-4 py-3 font-semibold">Origem</th>
                <th className="px-4 py-3 font-semibold">Inscrito em</th>
                <th className="px-4 py-3 font-semibold">Confirmado em</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {inscritos.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-10 text-center text-gray-500">
                    Nenhum inscrito encontrado.
                  </td>
                </tr>
              ) : (
                inscritos.map((inscrito) => (
                  <tr key={inscrito.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 font-medium text-gray-900">{inscrito.email}</td>
                    <td className="px-4 py-3">
                      <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${CORES_STATUS[inscrito.status] ?? ""}`}>
                        {isStatusInscricao(inscrito.status) ? ROTULOS_STATUS_INSCRICAO[inscrito.status] : inscrito.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-500">{inscrito.origem || "—"}</td>
                    <td className="px-4 py-3 text-gray-500">{data(inscrito.criadoEm)}</td>
                    <td className="px-4 py-3 text-gray-500">{data(inscrito.confirmadoEm)}</td>
                    <td className="px-4 py-3 text-right">
                      <BotaoExcluirInscricao id={inscrito.id} email={inscrito.email} />
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        <nav className="flex items-center justify-between border-t border-gray-200 bg-gray-50 px-6 py-3 text-sm text-gray-600" aria-label="Paginação de inscritos">
          <span>
            Página {Math.min(filtros.pagina, totalPaginas)} de {totalPaginas} · {total.toLocaleString("pt-BR")} inscritos
          </span>
          <div className="flex gap-2">
            {filtros.pagina > 1 && (
              <Link href={`/erp/newsletter${query(filtros.pagina - 1)}`} className="rounded-lg border border-gray-300 bg-white px-3 py-1.5 font-medium hover:bg-gray-100">
                Anterior
              </Link>
            )}
            {filtros.pagina < totalPaginas && (
              <Link href={`/erp/newsletter${query(filtros.pagina + 1)}`} className="rounded-lg border border-gray-300 bg-white px-3 py-1.5 font-medium hover:bg-gray-100">
                Próxima
              </Link>
            )}
          </div>
        </nav>
      </div>

      <section className="space-y-3">
        <h2 className="text-sm font-black uppercase tracking-widest text-gray-500">Últimos envios</h2>
        {disparos.length === 0 ? (
          <p className="rounded-xl border border-dashed border-gray-300 bg-white p-6 text-center text-sm text-gray-500">
            Nenhuma matéria enviada ainda. Marque o canal “Newsletter” ao publicar.
          </p>
        ) : (
          <ul className="divide-y divide-gray-100 rounded-xl border border-gray-200 bg-white">
            {disparos.map((disparo) => (
              <li key={disparo.id} className="flex flex-col gap-1 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="min-w-0">
                  <p className="truncate font-medium text-gray-900">{disparo.artigo.titulo}</p>
                  <p className="text-xs text-gray-500">
                    {data(disparo.iniciadoEm)} · {disparo.enviados}/{disparo.destinatarios} enviados
                    {disparo.erro ? ` · erro: ${disparo.erro}` : ""}
                  </p>
                </div>
                <span className="shrink-0 text-xs font-semibold text-gray-600">{ROTULOS_DISPARO[disparo.status] ?? disparo.status}</span>
              </li>
            ))}
          </ul>
        )}
      </section>

      {podeVerAuditoria && (
        <p className="text-xs text-gray-400">
          Exportações e exclusões ficam registradas na <Link href="/erp/auditoria?entidade=newsletter" className="underline">auditoria</Link>.
        </p>
      )}
    </div>
  );
}
