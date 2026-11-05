"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { exigirPermissao } from "@/lib/auth";
import { registrarAuditoria } from "@/lib/auditoria";
import { prisma } from "@/lib/prisma";

type Resultado = { ok: true } | { ok: false; error: string };

/**
 * Exclusão definitiva a pedido do titular (LGPD, direito de eliminação).
 * É a única exclusão física do sistema: o pedido é apagar o dado pessoal.
 * A auditoria registra o fato sem guardar o e-mail.
 */
export async function excluirInscricaoNewsletter(id: string): Promise<Resultado> {
  const sessao = await exigirPermissao("newsletter:gerir");
  if (!z.uuid().safeParse(id).success) return { ok: false, error: "Inscrição inválida." };

  const inscricao = await prisma.inscricaoNewsletter.findUnique({ where: { id }, select: { status: true } });
  if (!inscricao) return { ok: false, error: "Inscrição não encontrada." };

  await prisma.$transaction(async (tx) => {
    await tx.inscricaoNewsletter.delete({ where: { id } });
    await registrarAuditoria(
      {
        usuarioId: sessao.user.id,
        acao: "EXCLUSAO_DADOS_PESSOAIS",
        entidade: "newsletter",
        entidadeId: id,
        antes: { status: inscricao.status },
        depois: { motivo: "Pedido do titular (LGPD)" },
      },
      tx
    );
  });

  revalidatePath("/erp/newsletter");
  return { ok: true };
}
