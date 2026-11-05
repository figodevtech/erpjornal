import "server-only";

import { headers } from "next/headers";

import { limparParaLog, type EntidadeAuditada } from "@/lib/auditoria-formato";
import { prisma } from "@/lib/prisma";

export type { EntidadeAuditada };

/**
 * Trilha de auditoria (PRD): quem fez o quê, quando, de onde e o antes/depois.
 * Grava em logs_auditoria. Use em toda action de escrita do ERP.
 */

export type RegistroAuditoria = {
  usuarioId: string;
  acao: string;
  entidade: EntidadeAuditada;
  entidadeId?: string | null;
  /** Para artigos: liga o log ao artigo (histórico). */
  artigoId?: string | null;
  antes?: unknown;
  depois?: unknown;
};

/** Cliente ou transação: só o model logAuditoria é usado. */
type Executor = Pick<typeof prisma, "logAuditoria">;

async function origemDaRequisicao() {
  try {
    const cabecalhos = await headers();
    const ip =
      cabecalhos.get("x-forwarded-for")?.split(",")[0]?.trim() || cabecalhos.get("x-real-ip") || null;
    return { ip, userAgent: cabecalhos.get("user-agent")?.slice(0, 300) ?? null };
  } catch {
    // Fora de uma requisição (scripts, testes): sem IP/user-agent.
    return { ip: null, userAgent: null };
  }
}

export async function registrarAuditoria(registro: RegistroAuditoria, executor: Executor = prisma) {
  const { ip, userAgent } = await origemDaRequisicao();
  await executor.logAuditoria.create({
    data: {
      usuarioId: registro.usuarioId,
      acao: registro.acao,
      entidade: registro.entidade,
      entidadeId: registro.entidadeId ?? registro.artigoId ?? null,
      artigoId: registro.artigoId ?? null,
      dadoAnterior: limparParaLog(registro.antes),
      dadoNovo: limparParaLog(registro.depois),
      ip,
      userAgent,
    },
  });
}
