import "server-only";

import { prisma } from "@/lib/prisma";

import { STATUS_INSCRICAO, confirmacaoExpirada, isTokenValido } from "./regras";

export type SituacaoInscricao =
  | "invalido"
  | "expirado"
  | "pendente"
  | "confirmado"
  | "descadastrado";

/** Situação da inscrição de um link de e-mail (sem expor o endereço completo). */
export async function situacaoDoToken(token: unknown): Promise<{ situacao: SituacaoInscricao; email?: string }> {
  if (!isTokenValido(token)) return { situacao: "invalido" };
  const inscricao = await prisma.inscricaoNewsletter.findUnique({
    where: { token },
    select: { email: true, status: true, confirmacaoEnviadaEm: true },
  });
  if (!inscricao) return { situacao: "invalido" };
  const email = mascararEmail(inscricao.email);
  if (inscricao.status === STATUS_INSCRICAO.confirmado) return { situacao: "confirmado", email };
  if (inscricao.status === STATUS_INSCRICAO.descadastrado) return { situacao: "descadastrado", email };
  if (confirmacaoExpirada(inscricao.confirmacaoEnviadaEm)) return { situacao: "expirado", email };
  return { situacao: "pendente", email };
}

/** Confirma a inscrição (dupla confirmação). Devolve se ficou confirmada. */
export async function confirmarPorToken(token: unknown) {
  const { situacao } = await situacaoDoToken(token);
  if (situacao === "confirmado") return true;
  if (situacao !== "pendente") return false;
  await prisma.inscricaoNewsletter.update({
    where: { token: token as string },
    data: { status: STATUS_INSCRICAO.confirmado, confirmadoEm: new Date(), descadastradoEm: null },
  });
  return true;
}

/** Descadastra (vale para inscrição pendente ou confirmada). Devolve se o token existe. */
export async function descadastrarPorToken(token: unknown) {
  if (!isTokenValido(token)) return false;
  const resultado = await prisma.inscricaoNewsletter.updateMany({
    where: { token, status: { not: STATUS_INSCRICAO.descadastrado } },
    data: { status: STATUS_INSCRICAO.descadastrado, descadastradoEm: new Date() },
  });
  if (resultado.count > 0) return true;
  return (await prisma.inscricaoNewsletter.count({ where: { token } })) > 0;
}

/** "fulano@exemplo.com" → "fu***@exemplo.com" (a página não mostra o e-mail inteiro). */
export function mascararEmail(email: string) {
  const [usuario, dominio] = email.split("@");
  if (!dominio) return "***";
  return `${usuario.slice(0, 2)}***@${dominio}`;
}
