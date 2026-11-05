import { describe, expect, it } from "vitest";

import { avaliarMfa, lerNivelDoToken, mfaObrigatorioAtivo } from "@/lib/mfa";

function token(payload: object) {
  const parte = (valor: object) => Buffer.from(JSON.stringify(valor)).toString("base64url");
  return `${parte({ alg: "ES256", typ: "JWT" })}.${parte(payload)}.assinatura`;
}

describe("lerNivelDoToken", () => {
  it("lê aal1 e aal2", () => {
    expect(lerNivelDoToken(token({ sub: "u", aal: "aal1" }))).toBe("aal1");
    expect(lerNivelDoToken(token({ sub: "u", aal: "aal2" }))).toBe("aal2");
  });

  it("valor estranho ou token malformado vira null", () => {
    expect(lerNivelDoToken(token({ aal: "aal3" }))).toBeNull();
    expect(lerNivelDoToken(token({}))).toBeNull();
    expect(lerNivelDoToken("nao-e-jwt")).toBeNull();
    expect(lerNivelDoToken("a.%%%.c")).toBeNull();
  });
});

describe("avaliarMfa", () => {
  const base = { temPermissaoErp: true, fatoresVerificados: 0, nivel: "aal1" as const, obrigatorio: true };

  it("admin e editor sem autenticador ficam pendentes (precisam cadastrar)", () => {
    expect(avaliarMfa({ ...base, perfis: ["admin_erp"] })).toEqual({
      exigido: true,
      configurado: false,
      pendente: true,
      nivel: "aal1",
    });
    expect(avaliarMfa({ ...base, perfis: ["editor_erp"] }).pendente).toBe(true);
  });

  it("com o código confirmado (aal2), libera", () => {
    expect(avaliarMfa({ ...base, perfis: ["admin_erp"], fatoresVerificados: 1, nivel: "aal2" }).pendente).toBe(false);
  });

  it("repórter não é obrigado, mas quem cadastrou o autenticador precisa usá-lo", () => {
    expect(avaliarMfa({ ...base, perfis: ["reporter_erp"] }).exigido).toBe(false);
    const comFator = avaliarMfa({ ...base, perfis: ["reporter_erp"], fatoresVerificados: 1 });
    expect(comFator).toMatchObject({ exigido: true, configurado: true, pendente: true });
  });

  it("MFA_OBRIGATORIO=false tira só a obrigatoriedade por perfil", () => {
    expect(avaliarMfa({ ...base, perfis: ["admin_erp"], obrigatorio: false }).pendente).toBe(false);
    expect(avaliarMfa({ ...base, perfis: ["admin_erp"], obrigatorio: false, fatoresVerificados: 1 }).pendente).toBe(true);
  });

  it("leitor do portal nunca fica bloqueado pelo MFA", () => {
    expect(
      avaliarMfa({ ...base, perfis: ["leitor_portal"], temPermissaoErp: false, fatoresVerificados: 1 }).pendente
    ).toBe(false);
  });
});

describe("mfaObrigatorioAtivo", () => {
  it("é ligado por padrão e só desliga com 'false'", () => {
    expect(mfaObrigatorioAtivo(undefined)).toBe(true);
    expect(mfaObrigatorioAtivo("")).toBe(true);
    expect(mfaObrigatorioAtivo("true")).toBe(true);
    expect(mfaObrigatorioAtivo(" FALSE ")).toBe(false);
    expect(mfaObrigatorioAtivo("0")).toBe(true);
  });
});
