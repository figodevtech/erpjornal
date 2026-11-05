/**
 * Regras puras do plantão (breaking news): avisos curtos na faixa do topo do portal.
 */

/** Máximo de avisos no ar ao mesmo tempo; ao publicar o 11º, o mais antigo é encerrado. */
export const MAX_PLANTOES_ATIVOS = 10;

export const TAMANHO_MAXIMO_TEXTO_PLANTAO = 200;

/** Prazos oferecidos no ERP (horas). 0 = fica no ar até alguém encerrar. */
export const PRAZOS_PLANTAO_HORAS = [0, 1, 3, 6, 12, 24] as const;

export function rotuloPrazo(horas: number) {
  if (horas === 0) return "Até encerrar";
  return horas === 1 ? "1 hora" : `${horas} horas`;
}

export function calcularExpiracao(horas: number, agora = new Date()): Date | null {
  return horas > 0 ? new Date(agora.getTime() + horas * 3_600_000) : null;
}

/** Ids dos avisos ativos que passam do limite (os mais antigos), para encerrar. */
export function excedentesDoLimite(ativosDoMaisNovoParaOMaisAntigo: { id: string }[], limite = MAX_PLANTOES_ATIVOS) {
  return ativosDoMaisNovoParaOMaisAntigo.slice(limite).map(({ id }) => id);
}

export type PlantaoPublico = { id: string; texto: string; href: string | null; criadoEm: string };

/**
 * Destino do aviso: a matéria relacionada (se estiver no ar) ou o link externo.
 * Matéria fora do ar não vira link: o aviso aparece só como texto.
 */
export function destinoDoPlantao(
  plantao: { link: string | null; artigo: { slug: string; noAr: boolean } | null }
): string | null {
  if (plantao.artigo?.noAr) return `/noticia/${plantao.artigo.slug}`;
  if (plantao.link && /^https:\/\//i.test(plantao.link)) return plantao.link;
  return null;
}

/** Escapa texto para o modo HTML do Telegram (&, < e >). */
export function escaparHtmlTelegram(texto: string) {
  return texto.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

/** Mensagem do alerta de plantão para o canal da redação no Telegram. */
export function mensagemTelegramDoPlantao({ texto, link, autor }: { texto: string; link: string | null; autor: string }) {
  const linhas = [`🚨 <b>PLANTÃO</b>`, escaparHtmlTelegram(texto)];
  if (link) linhas.push(`<a href="${escaparHtmlTelegram(link).replace(/"/g, "&quot;")}">Abrir</a>`);
  linhas.push(`<i>por ${escaparHtmlTelegram(autor)}</i>`);
  return linhas.join("\n");
}
