import fs from "node:fs";
import path from "node:path";

import { describe, expect, it } from "vitest";

/**
 * Matéria agendada (status "publicado" com data futura) não pode aparecer no
 * portal antes da hora. A regra mora em `filtroArtigoNoAr()` (src/lib/data/artigos.ts);
 * filtrar só o status, à mão, já vazou embargo na busca e nas páginas de região.
 */
const SRC = path.resolve(__dirname, "../../..");
const CODIGO_PUBLICO = ["app/(portal)", "app/api", "app/sitemap.ts", "components", "lib/services"];
const FILTRO_MANUAL = /status:\s*(STATUS_ARTIGO\.publicado|["']publicado["'])/;

function arquivosDe(relativo: string): string[] {
  const caminho = path.join(SRC, relativo);
  if (!fs.existsSync(caminho)) return [];
  if (fs.statSync(caminho).isFile()) return [caminho];
  return fs.readdirSync(caminho, { withFileTypes: true }).flatMap((entrada) => {
    const filho = path.join(relativo, entrada.name);
    if (entrada.isDirectory()) return entrada.name === "__tests__" ? [] : arquivosDe(filho);
    return /\.(ts|tsx)$/.test(entrada.name) ? [path.join(SRC, filho)] : [];
  });
}

describe("matérias no ar no código público", () => {
  it("usa filtroArtigoNoAr() em vez de filtrar só o status", () => {
    const arquivos = CODIGO_PUBLICO.flatMap(arquivosDe);
    expect(arquivos.length).toBeGreaterThan(10);

    const infratores = arquivos
      .filter((arquivo) => FILTRO_MANUAL.test(fs.readFileSync(arquivo, "utf8")))
      .map((arquivo) => path.relative(SRC, arquivo));
    expect(infratores).toEqual([]);
  });
});
