import { describe, expect, it } from "vitest";

import {
  motivoBloqueioFonte,
  nivelSigiloSeguro,
  podeAcessarFonte,
  resumoFonteParaAuditoria,
} from "../sigilo";

const editor = { user: { id: "u1", permissoes: ["fontes:ler", "fontes:editar"] } };
const editorComSigilo = { user: { id: "u2", permissoes: ["fontes:ler", "fontes:editar", "fontes:confidencial"] } };

describe("sigilo das fontes", () => {
  it("valor desconhecido conta como confidencial", () => {
    expect(nivelSigiloSeguro("publico")).toBe("publico");
    expect(nivelSigiloSeguro("reservado")).toBe("reservado");
    expect(nivelSigiloSeguro("Confidencial")).toBe("confidencial");
    expect(nivelSigiloSeguro("xyz")).toBe("confidencial");
    expect(nivelSigiloSeguro(null)).toBe("confidencial");
  });

  it("sem fontes:confidencial, não acessa nem edita fonte confidencial", () => {
    expect(podeAcessarFonte(editor, { nivelSigilo: "confidencial" })).toBe(false);
    expect(motivoBloqueioFonte(editor, { nivelSigilo: "confidencial" })).toMatch(/confidencial/);
    expect(podeAcessarFonte(editor, { nivelSigilo: "valor-estranho" })).toBe(false);
  });

  it("acessa fontes públicas e reservadas", () => {
    expect(motivoBloqueioFonte(editor, { nivelSigilo: "publico" })).toBeNull();
    expect(motivoBloqueioFonte(editor, { nivelSigilo: "reservado" })).toBeNull();
  });

  it("com fontes:confidencial, acessa todas", () => {
    expect(motivoBloqueioFonte(editorComSigilo, { nivelSigilo: "confidencial" })).toBeNull();
  });

  it("a auditoria nunca guarda o nome de fonte confidencial", () => {
    expect(resumoFonteParaAuditoria({ nome: "Fulano", nivelSigilo: "confidencial" })).toEqual({
      nivelSigilo: "confidencial",
    });
    expect(resumoFonteParaAuditoria({ nome: "Fulano", nivelSigilo: "publico" })).toEqual({
      nome: "Fulano",
      nivelSigilo: "publico",
    });
  });
});
