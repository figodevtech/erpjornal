/**
 * Regras puras da newsletter (dupla confirmação, elegibilidade e lotes).
 */

export const STATUS_INSCRICAO = {
  pendente: "pendente",
  confirmado: "confirmado",
  descadastrado: "descadastrado",
} as const;

export type StatusInscricao = (typeof STATUS_INSCRICAO)[keyof typeof STATUS_INSCRICAO];

export const ROTULOS_STATUS_INSCRICAO: Record<StatusInscricao, string> = {
  pendente: "Aguardando confirmação",
  confirmado: "Confirmado",
  descadastrado: "Descadastrado",
};

export function isStatusInscricao(valor: unknown): valor is StatusInscricao {
  return typeof valor === "string" && Object.hasOwn(STATUS_INSCRICAO, valor);
}

/** Intervalo mínimo para reenviar o e-mail de confirmação ao mesmo endereço. */
export const INTERVALO_REENVIO_CONFIRMACAO_MS = 10 * 60 * 1000;

/** Tamanho do lote do Resend (limite da API de envio em lote). */
export const TAMANHO_LOTE_ENVIO = 100;

/** Matérias publicadas há mais tempo que isso não disparam newsletter (evita enviar matéria velha). */
export const JANELA_ENVIO_MS = 48 * 60 * 60 * 1000;

export type AcaoInscricao =
  /** Nova inscrição: grava como pendente e manda o e-mail de confirmação. */
  | "criar"
  /** Já pendente (ou descadastrada): volta a pendente e manda a confirmação de novo. */
  | "enviar_confirmacao"
  /** Nada a fazer (já confirmada, ou confirmação enviada há pouco). */
  | "nada";

/**
 * O que fazer quando alguém se inscreve. A resposta ao visitante é sempre a mesma,
 * para não revelar se o e-mail já estava na lista.
 */
export function acaoAoInscrever(
  atual: { status: string; confirmacaoEnviadaEm: Date | null } | null,
  agora = new Date()
): AcaoInscricao {
  if (!atual) return "criar";
  if (atual.status === STATUS_INSCRICAO.confirmado) return "nada";
  const recente =
    atual.confirmacaoEnviadaEm !== null &&
    agora.getTime() - atual.confirmacaoEnviadaEm.getTime() < INTERVALO_REENVIO_CONFIRMACAO_MS;
  return recente ? "nada" : "enviar_confirmacao";
}

/** A matéria deve sair na newsletter agora? (no ar, com o canal marcado e recente). */
export function materiaElegivelParaNewsletter(
  materia: {
    status: string;
    canaisPublicacao: string[];
    dataPublicacao: Date | null;
    excluidoEm: Date | null;
  },
  agora = new Date()
) {
  if (materia.status !== "publicado" || materia.excluidoEm !== null || !materia.dataPublicacao) return false;
  if (!materia.canaisPublicacao.includes("newsletter")) return false;
  const publicadaHa = agora.getTime() - materia.dataPublicacao.getTime();
  return publicadaHa >= 0 && publicadaHa <= JANELA_ENVIO_MS;
}

export function dividirEmLotes<T>(itens: readonly T[], tamanho = TAMANHO_LOTE_ENVIO): T[][] {
  const lotes: T[][] = [];
  for (let i = 0; i < itens.length; i += tamanho) lotes.push(itens.slice(i, i + tamanho));
  return lotes;
}

/** Links da inscrição (o token é o segredo; nunca vai para logs). */
export function linksDaInscricao(siteUrl: string, token: string) {
  const base = siteUrl.replace(/\/$/, "");
  const t = encodeURIComponent(token);
  return {
    confirmar: `${base}/newsletter/confirmar?token=${t}`,
    descadastrar: `${base}/newsletter/descadastrar?token=${t}`,
    /** Descadastro de um clique (RFC 8058): o cliente de e-mail faz POST aqui. */
    descadastrarUmClique: `${base}/api/newsletter/descadastrar?token=${t}`,
  };
}

/** Status final de um disparo a partir do que foi entregue ao Resend. */
export function statusDoDisparo(destinatarios: number, enviados: number) {
  if (destinatarios === 0 || enviados === destinatarios) return "enviado";
  return enviados === 0 ? "falhou" : "parcial";
}

/** O link de confirmação vale por 7 dias; depois disso a pessoa se inscreve de novo. */
export const PRAZO_CONFIRMACAO_MS = 7 * 24 * 60 * 60 * 1000;

export function confirmacaoExpirada(confirmacaoEnviadaEm: Date | null, agora = new Date()) {
  return !confirmacaoEnviadaEm || agora.getTime() - confirmacaoEnviadaEm.getTime() > PRAZO_CONFIRMACAO_MS;
}

/** Formato dos tokens (base64url de 24 bytes, ou UUID dos inscritos antigos). */
export function isTokenValido(valor: unknown): valor is string {
  return typeof valor === "string" && /^[A-Za-z0-9_-]{20,64}$/.test(valor);
}
