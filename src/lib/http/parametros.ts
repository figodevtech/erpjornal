/**
 * Helpers para ler parâmetros de URL em rotas públicas com segurança.
 */

/** Lê um inteiro e o mantém entre `min` e `max`; inválido/ausente vira `padrao`. */
export function inteiroLimitado(
  valor: string | null | undefined,
  { padrao, min, max }: { padrao: number; min: number; max: number }
): number {
  const numero = Number.parseInt(valor ?? "", 10);
  if (!Number.isFinite(numero)) return padrao;
  return Math.min(max, Math.max(min, numero));
}

const SLUG = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

/** Slug no formato usado pelo portal (minúsculas, números e hífens), até 120 caracteres. */
export function isSlugValido(valor: string | null | undefined): valor is string {
  return typeof valor === "string" && valor.length <= 120 && SLUG.test(valor);
}
