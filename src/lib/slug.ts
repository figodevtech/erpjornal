/**
 * Slug de URL: minúsculas sem acento, números e hífens ("Reforma Tributária" →
 * "reforma-tributaria"). Corta no tamanho máximo sem deixar hífen sobrando.
 */
export function slugify(valor: string, tamanhoMaximo = 200): string {
  return valor
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "")
    .slice(0, tamanhoMaximo)
    .replace(/-+$/, "");
}

/**
 * Primeiro slug livre a partir de uma base: "joao-silva", "joao-silva-2", ...
 * `emUso` diz se um candidato já existe (consulta ao banco).
 */
export async function slugDisponivel(
  base: string,
  emUso: (candidato: string) => Promise<boolean>,
  { tamanhoMaximo = 200, padrao = "item" }: { tamanhoMaximo?: number; padrao?: string } = {}
): Promise<string> {
  const raiz = slugify(base, tamanhoMaximo - 4) || padrao;
  if (!(await emUso(raiz))) return raiz;
  for (let numero = 2; numero < 1000; numero++) {
    const candidato = `${raiz}-${numero}`;
    if (!(await emUso(candidato))) return candidato;
  }
  return `${raiz}-${Date.now().toString(36)}`;
}

/**
 * Lista de tags digitada pelo editor ("Reforma, STF;  eleições") → nomes limpos,
 * sem repetição (pelo slug), até `limite` tags de 2 a 40 caracteres.
 */
export function lerTags(texto: string, limite = 10): { nome: string; slug: string }[] {
  const vistas = new Set<string>();
  const tags: { nome: string; slug: string }[] = [];
  for (const parte of texto.split(/[,;\n]/)) {
    const nome = parte.replace(/\s+/g, " ").trim().slice(0, 40).trim();
    const slug = slugify(nome, 60);
    if (nome.length < 2 || !slug || vistas.has(slug)) continue;
    vistas.add(slug);
    tags.push({ nome, slug });
    if (tags.length >= limite) break;
  }
  return tags;
}
