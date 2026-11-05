import { describe, expect, it } from "vitest";

import { destinoInternoSeguro } from "../redirecionamento";

describe("destinoInternoSeguro", () => {
  it.each(["/erp", "/noticia/abc?x=1", "/"])("aceita caminho interno %s", (destino) => {
    expect(destinoInternoSeguro(destino)).toBe(destino);
  });

  it.each(["//evil.com", "/\\evil.com", "https://evil.com", "javascript:alert(1)", "erp", "/\nevil", "", null])(
    "recusa %s (open redirect)",
    (destino) => {
      expect(destinoInternoSeguro(destino)).toBeNull();
    }
  );
});
