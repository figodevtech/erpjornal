import "server-only";

import { unstable_rethrow } from "next/navigation";

/** Resultado de server action: os dados no sucesso, a mensagem no erro. */
export type ResultadoAcao<T extends object = object> = ({ ok: true } & T) | { ok: false; error: string };

const MENSAGEM_PADRAO = "Não foi possível concluir a ação. Tente de novo.";

function mensagemSegura(erro: unknown, padrao: string) {
  if (!(erro instanceof Error) || !erro.message) return padrao;
  if (erro.name === "TimeoutError") return "O serviço externo demorou demais para responder. Tente de novo.";
  // Erros do Prisma/driver trazem detalhes do banco: ficam no log, não na tela.
  if (erro.name.startsWith("PrismaClient") || erro.name === "DatabaseError") return padrao;
  return erro.message;
}

/**
 * Roda a action e devolve `{ ok, error }` em vez de lançar: em produção o Next
 * troca a mensagem de erros lançados por um texto genérico, e o usuário não
 * veria, por exemplo, "Limite mensal de geração de imagens atingido".
 * Redirecionamentos (exigirPermissao → /403, /login) continuam funcionando.
 */
export async function comoResultado<T extends object>(
  acao: () => Promise<T>,
  padrao = MENSAGEM_PADRAO
): Promise<ResultadoAcao<T>> {
  try {
    return { ok: true, ...(await acao()) };
  } catch (erro) {
    unstable_rethrow(erro);
    console.error("[server action]", erro);
    return { ok: false, error: mensagemSegura(erro, padrao) };
  }
}
