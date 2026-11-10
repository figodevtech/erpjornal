/**
 * Datas no fuso da redação (horário de Brasília).
 *
 * Em produção (Vercel) o servidor roda em UTC. Sem fuso explícito,
 * `new Date("2026-11-10T14:00")` vira 14h UTC (11h em Brasília) e
 * `toLocaleDateString` mostra o dia/hora de Londres. Use estes helpers em vez de
 * `toLocale*String` sem `timeZone` e de `new Date(valorDoInput)`.
 *
 * Sem "server-only": também é usado por client components (e assim o HTML do
 * servidor e o do navegador mostram a mesma data, sem erro de hidratação).
 */

export const FUSO_HORARIO = "America/Sao_Paulo";
const LOCALE = "pt-BR";

type EntradaData = Date | string | number;

function comoData(valor: EntradaData) {
  return valor instanceof Date ? valor : new Date(valor);
}

/** "10/11/2026" (ou o formato das opções), sempre no horário de Brasília. */
export function formatarData(valor: EntradaData, opcoes: Intl.DateTimeFormatOptions = {}) {
  return comoData(valor).toLocaleDateString(LOCALE, { timeZone: FUSO_HORARIO, ...opcoes });
}

/** "14:05" (ou o formato das opções), sempre no horário de Brasília. */
export function formatarHora(
  valor: EntradaData,
  opcoes: Intl.DateTimeFormatOptions = { hour: "2-digit", minute: "2-digit" }
) {
  return comoData(valor).toLocaleTimeString(LOCALE, { timeZone: FUSO_HORARIO, ...opcoes });
}

/** Data e hora juntas ("10/11/2026, 14:05" no padrão), no horário de Brasília. */
export function formatarDataHora(
  valor: EntradaData,
  opcoes: Intl.DateTimeFormatOptions = { dateStyle: "short", timeStyle: "short" }
) {
  return comoData(valor).toLocaleString(LOCALE, { timeZone: FUSO_HORARIO, ...opcoes });
}

type PartesData = { ano: number; mes: number; dia: number; hora: number; minuto: number; segundo: number };

const formatoPartes = new Intl.DateTimeFormat("en-US", {
  timeZone: FUSO_HORARIO,
  hourCycle: "h23",
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
  hour: "2-digit",
  minute: "2-digit",
  second: "2-digit",
});

/** Ano, mês, dia, hora... de um instante, como aparecem no relógio de Brasília. */
function partesEmBrasilia(data: Date): PartesData {
  const partes = formatoPartes.formatToParts(data);
  const valor = (tipo: Intl.DateTimeFormatPartTypes) => Number(partes.find((parte) => parte.type === tipo)?.value);
  return {
    ano: valor("year"),
    mes: valor("month"),
    dia: valor("day"),
    hora: valor("hour"),
    minuto: valor("minute"),
    segundo: valor("second"),
  };
}

/** Diferença entre o relógio de Brasília e o UTC num instante (ex.: -3h em ms). */
function deslocamentoDeBrasilia(instante: number) {
  const p = partesEmBrasilia(new Date(instante));
  const relogioComoUtc = Date.UTC(p.ano, p.mes - 1, p.dia, p.hora, p.minuto, p.segundo);
  return relogioComoUtc - Math.floor(instante / 1000) * 1000;
}

const DATA_HORA_LOCAL = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})(?::(\d{2}))?$/;
const ISO_COM_FUSO = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}(?::\d{2}(?:\.\d+)?)?(?:Z|[+-]\d{2}:?\d{2})$/i;

/**
 * Lê o valor de um `<input type="datetime-local">` ("2026-11-10T14:00") como
 * horário de Brasília. Um ISO com fuso ("...Z" ou "...-03:00") é respeitado.
 * Valor vazio ou inválido (inclusive 30/02) → null.
 */
export function lerDataHoraLocal(valor: string | null | undefined): Date | null {
  const texto = valor?.trim();
  if (!texto) return null;

  const local = DATA_HORA_LOCAL.exec(texto);
  if (!local) {
    if (!ISO_COM_FUSO.test(texto)) return null;
    const data = new Date(texto);
    return Number.isNaN(data.getTime()) ? null : data;
  }

  const [ano, mes, dia, hora, minuto, segundo] = local.slice(1).map((parte) => Number(parte ?? 0));
  const relogioComoUtc = Date.UTC(ano, mes - 1, dia, hora, minuto, segundo);
  // Duas passadas: o deslocamento do fuso depende do próprio instante (horário de verão).
  let instante = relogioComoUtc - deslocamentoDeBrasilia(relogioComoUtc);
  instante = relogioComoUtc - deslocamentoDeBrasilia(instante);

  const data = new Date(instante);
  const conferencia = partesEmBrasilia(data);
  if (conferencia.ano !== ano || conferencia.mes !== mes || conferencia.dia !== dia) return null;
  return data;
}

/** Valor para `<input type="datetime-local">`, no horário de Brasília ("" se não houver data). */
export function paraDataHoraLocal(valor: EntradaData | null | undefined): string {
  if (valor === null || valor === undefined || valor === "") return "";
  const data = comoData(valor);
  if (Number.isNaN(data.getTime())) return "";
  const p = partesEmBrasilia(data);
  const doisDigitos = (numero: number) => String(numero).padStart(2, "0");
  return `${p.ano}-${doisDigitos(p.mes)}-${doisDigitos(p.dia)}T${doisDigitos(p.hora)}:${doisDigitos(p.minuto)}`;
}

/** Meia-noite do dia corrente em Brasília (início de "hoje" para filtros). */
export function inicioDoDiaEmBrasilia(agora: Date = new Date()): Date {
  return lerDataHoraLocal(`${paraDataHoraLocal(agora).slice(0, 10)}T00:00`) ?? agora;
}
