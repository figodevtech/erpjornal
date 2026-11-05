import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

import { obterSessao, temPermissao } from "@/lib/auth";
import { registrarAuditoria } from "@/lib/auditoria";
import { BOM_CSV, linhaCsv } from "@/lib/auditoria-formato";
import { lerFiltrosInscritos, listarInscritosParaExportacao } from "@/lib/data/newsletter";
import { ROTULOS_STATUS_INSCRICAO, isStatusInscricao } from "@/lib/newsletter/regras";

const SEM_CACHE = { "Cache-Control": "private, no-store" };

/** CSV dos inscritos (dados pessoais: exige newsletter:gerir e fica na auditoria). */
export async function GET(request: NextRequest) {
  const sessao = await obterSessao();
  if (!sessao || sessao.user.status !== "ativo") {
    return NextResponse.json({ error: "Faça login." }, { status: 401, headers: SEM_CACHE });
  }
  if (!temPermissao(sessao, "newsletter:gerir")) {
    return NextResponse.json({ error: "Sem permissão para exportar inscritos." }, { status: 403, headers: SEM_CACHE });
  }

  const filtros = lerFiltrosInscritos(request.nextUrl.searchParams);
  const inscritos = await listarInscritosParaExportacao(filtros);

  const linhas = inscritos.map((inscrito) =>
    linhaCsv([
      inscrito.email,
      isStatusInscricao(inscrito.status) ? ROTULOS_STATUS_INSCRICAO[inscrito.status] : inscrito.status,
      inscrito.origem,
      inscrito.criadoEm,
      inscrito.confirmadoEm,
      inscrito.descadastradoEm,
    ])
  );

  await registrarAuditoria({
    usuarioId: sessao.user.id,
    acao: "EXPORTACAO",
    entidade: "newsletter",
    depois: { filtros: { ...filtros, pagina: undefined }, linhas: inscritos.length },
  });

  const cabecalho = linhaCsv(["email", "situacao", "origem", "inscrito_em_utc", "confirmado_em_utc", "descadastrado_em_utc"]);
  const corpo = BOM_CSV + [cabecalho, ...linhas].join("\r\n") + "\r\n";
  const hoje = new Date().toISOString().slice(0, 10);

  return new NextResponse(corpo, {
    headers: {
      ...SEM_CACHE,
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="inscritos-newsletter-${hoje}.csv"`,
    },
  });
}
