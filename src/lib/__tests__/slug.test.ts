import { describe, expect, it } from "vitest";

import { lerTags, slugDisponivel, slugify } from "@/lib/slug";

describe("slugify", () => {
  it("remove acentos e símbolos", () => {
    expect(slugify("Reforma Tributária: o que muda?")).toBe("reforma-tributaria-o-que-muda");
    expect(slugify("  São João & Cia.  ")).toBe("sao-joao-cia");
  });

  it("corta sem deixar hífen no fim", () => {
    expect(slugify("abc def ghi", 4)).toBe("abc");
    expect(slugify("abcdefgh", 4)).toBe("abcd");
  });

  it("texto sem letras vira vazio", () => {
    expect(slugify("!!!")).toBe("");
  });
});

describe("slugDisponivel", () => {
  it("acrescenta -2, -3... até achar um livre", async () => {
    const usados = new Set(["joao-silva", "joao-silva-2"]);
    expect(await slugDisponivel("João Silva", async (c) => usados.has(c))).toBe("joao-silva-3");
    expect(await slugDisponivel("Maria", async () => false)).toBe("maria");
  });

  it("usa o padrão quando o nome não gera slug", async () => {
    expect(await slugDisponivel("???", async () => false, { padrao: "entidade" })).toBe("entidade");
  });
});

describe("lerTags", () => {
  it("separa por vírgula, ponto e vírgula ou linha e remove repetidas", () => {
    expect(lerTags("Reforma tributária, STF;  stf \n Orçamento")).toEqual([
      { nome: "Reforma tributária", slug: "reforma-tributaria" },
      { nome: "STF", slug: "stf" },
      { nome: "Orçamento", slug: "orcamento" },
    ]);
  });

  it("ignora vazias e curtas demais e respeita o limite", () => {
    expect(lerTags(", a, ,  ")).toEqual([]);
    expect(lerTags("t1, t2, t3, t4", 2).map(({ slug }) => slug)).toEqual(["t1", "t2"]);
  });

  it("corta nomes longos em 40 caracteres", () => {
    const [tag] = lerTags("x".repeat(80));
    expect(tag.nome).toHaveLength(40);
  });
});
