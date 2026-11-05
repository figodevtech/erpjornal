import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

import { obterSessao, temPermissao } from "@/lib/auth";
import { registrarAuditoria } from "@/lib/auditoria";
import { BOM_CSV, linhaCsv, rotuloAcao, rotuloEntidade } from "@/lib/auditoria-formato";
import { lerFiltrosAuditoria, listarAuditoriaParaExportacao } from "@/lib/data/auditoria";

const SEM_CACHE = { "Cache-Control": "private, no-store" };

const CABECALHO = [
  "data_hora_utc",
  "usuario_nome",
  "usuario_email",
  "acao",
  "acao_codigo",
  "entidade",
  "entidade_codigo",
  "registro_id",
  "ip",
  "user_agent",
  "dado_anterior",
  "dado_novo",
];

/** CSV da trilha de auditoria com os mesmos filtros da página /erp/auditoria. */
export async function GET(request: NextRequest) {
  const sessao = await obterSessao();
  if (!sessao || sessao.user.status !== "ativo") {
    return NextResponse.json({ error: "Faça login." }, { status: 401, headers: SEM_CACHE });
  }
  if (!temPermissao(sessao, "auditoria:ler")) {
    return NextResponse.json({ error: "Sem permissão para exportar a auditoria." }, { status: 403, headers: SEM_CACHE });
  }

  const filtros = lerFiltrosAuditoria(request.nextUrl.searchParams);
  const registros = await listarAuditoriaParaExportacao(filtros);

  const linhas = registros.map((registro) =>
    linhaCsv([
      registro.criadoEm,
      registro.usuario.nome,
      registro.usuario.email,
      rotuloAcao(registro.acao),
      registro.acao,
      rotuloEntidade(registro.entidade),
      registro.entidade,
      registro.entidadeId,
      registro.ip,
      registro.userAgent,
      registro.dadoAnterior,
      registro.dadoNovo,
    ])
  );

  // A exportação também entra na trilha: quem baixou, com quais filtros e quantas linhas.
  await registrarAuditoria({
    usuarioId: sessao.user.id,
    acao: "EXPORTACAO",
    entidade: "auditoria",
    depois: { filtros: { ...filtros, pagina: undefined }, linhas: registros.length },
  });

  const hoje = new Date().toISOString().slice(0, 10);
  const corpo = BOM_CSV + [linhaCsv(CABECALHO), ...linhas].join("\r\n") + "\r\n";

  return new NextResponse(corpo, {
    headers: {
      ...SEM_CACHE,
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="auditoria-${hoje}.csv"`,
    },
  });
}
