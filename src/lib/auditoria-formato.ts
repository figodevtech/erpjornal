/**
 * Regras puras da trilha de auditoria (sem banco nem requisição), usadas pelo
 * helper de gravação, pela página /erp/auditoria e pela exportação CSV.
 */

export const ENTIDADES_AUDITADAS = [
  "artigo",
  "revista",
  "categoria",
  "entidade",
  "anuncio",
  "fonte",
  "fonte_rss",
  "midia",
  "midia_kit",
  "podcast",
  "usuario",
  "perfil",
  "configuracao",
  "auditoria",
] as const;

export type EntidadeAuditada = (typeof ENTIDADES_AUDITADAS)[number];

export const ROTULOS_ENTIDADE: Record<EntidadeAuditada, string> = {
  artigo: "Artigo",
  revista: "Revista",
  categoria: "Categoria",
  entidade: "Entidade (político)",
  anuncio: "Anúncio",
  fonte: "Fonte",
  fonte_rss: "Feed RSS",
  midia: "Mídia",
  midia_kit: "Mídia kit",
  podcast: "Podcast",
  usuario: "Usuário",
  perfil: "Perfil de acesso",
  configuracao: "Configuração",
  auditoria: "Auditoria",
};

export const ROTULOS_ACAO: Record<string, string> = {
  CRIACAO: "Criação",
  CRIACAO_E_PUBLICACAO: "Criação e publicação",
  EDICAO: "Edição",
  SALVAMENTO_AUTOMATICO: "Salvamento automático",
  EXCLUSAO: "Exclusão",
  RESTAURACAO: "Restauração",
  PUBLICACAO: "Publicação",
  MUDANCA_STATUS: "Mudança de etapa",
  TROCA_AUTOR: "Troca de autor",
  CURADORIA_PUBLICACAO: "Publicação pela curadoria",
  CURADORIA_ENVIO_REVISAO: "Curadoria enviada à revisão",
  DEFINICAO_SENHA: "Definição de senha",
  ENVIO_REDEFINICAO_SENHA: "Envio de redefinição de senha",
  EXPORTACAO: "Exportação",
};

export function rotuloAcao(acao: string) {
  return ROTULOS_ACAO[acao] ?? acao;
}

export function rotuloEntidade(entidade: string) {
  return (ROTULOS_ENTIDADE as Record<string, string>)[entidade] ?? entidade;
}

export function isEntidadeAuditada(valor: string | null | undefined): valor is EntidadeAuditada {
  return typeof valor === "string" && (ENTIDADES_AUDITADAS as readonly string[]).includes(valor);
}

/** Campos que nunca devem ir para o log (credenciais e tokens). */
const CAMPOS_SENSIVEIS = /senha|password|token|secret|chave|apikey/i;

/**
 * Converte o dado para JSON gravável no log: datas viram ISO, funções somem e
 * campos sensíveis (em qualquer nível) são trocados por "[removido]".
 */
export function limparParaLog(valor: unknown): object | undefined {
  if (valor === undefined || valor === null) return undefined;
  const json = JSON.stringify(valor, (chave, v) => (chave && CAMPOS_SENSIVEIS.test(chave) ? "[removido]" : v));
  if (json === undefined) return undefined;
  const convertido: unknown = JSON.parse(json);
  return typeof convertido === "object" && convertido !== null ? convertido : { valor: convertido };
}

function isObjeto(valor: unknown): valor is Record<string, unknown> {
  return typeof valor === "object" && valor !== null && !Array.isArray(valor);
}

/** Nomes dos campos que mudaram entre o antes e o depois (só no primeiro nível). */
export function camposAlterados(antes: unknown, depois: unknown): string[] {
  if (!isObjeto(antes) || !isObjeto(depois)) return [];
  return Object.keys(depois)
    .filter((campo) => campo in antes && JSON.stringify(antes[campo]) !== JSON.stringify(depois[campo]))
    .sort();
}

/**
 * Separador `;` com BOM: é o formato que o Excel em pt-BR abre direto,
 * com acentos e colunas corretos.
 */
export const SEPARADOR_CSV = ";";
export const BOM_CSV = "﻿";

/**
 * Uma célula de CSV: aspas quando preciso e proteção contra injeção de fórmula
 * (célula começando com = + - @ vira texto no Excel/Sheets).
 */
export function celulaCsv(valor: unknown): string {
  if (valor === null || valor === undefined) return "";
  let texto =
    valor instanceof Date ? valor.toISOString() : typeof valor === "object" ? JSON.stringify(valor) : String(valor);
  if (/^[=+\-@\t\r]/.test(texto)) texto = `'${texto}`;
  if (/[";\n\r,]/.test(texto)) texto = `"${texto.replace(/"/g, '""')}"`;
  return texto;
}

export function linhaCsv(valores: unknown[]): string {
  return valores.map(celulaCsv).join(SEPARADOR_CSV);
}
