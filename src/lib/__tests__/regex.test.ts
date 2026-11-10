import { describe, expect, it } from "vitest";

import { escaparRegex } from "../regex";

describe("escaparRegex", () => {
  it("transforma caracteres especiais em texto literal", () => {
    for (const termo of [")", "(", "+", "*", "?", "[", "R$ 5", "a.b", "(PL-SP)", "\\"]) {
      const regex = new RegExp(`(${escaparRegex(termo)})`, "gi");
      expect(`antes ${termo} depois`.split(regex)).toContain(termo);
    }
  });

  it("não casa nada além do texto literal", () => {
    expect(new RegExp(escaparRegex("a.b")).test("axb")).toBe(false);
    expect(new RegExp(escaparRegex("a.b")).test("a.b")).toBe(true);
  });
});
