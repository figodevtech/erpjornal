import { describe, expect, it } from "vitest";

import {
  acaoAoInscrever,
  confirmacaoExpirada,
  dividirEmLotes,
  isTokenValido,
  linksDaInscricao,
  materiaElegivelParaNewsletter,
  statusDoDisparo,
} from "@/lib/newsletter/regras";

const agora = new Date("2026-11-05T12:00:00Z");
const minutosAtras = (n: number) => new Date(agora.getTime() - n * 60_000);

describe("acaoAoInscrever", () => {
  it("e-mail novo cria a inscrição pendente", () => {
    expect(acaoAoInscrever(null, agora)).toBe("criar");
  });

  it("já confirmado: nada muda (e a resposta é a mesma)", () => {
    expect(acaoAoInscrever({ status: "confirmado", confirmacaoEnviadaEm: minutosAtras(60) }, agora)).toBe("nada");
  });

  it("pendente reenvia a confirmação, mas não mais que a cada 10 min", () => {
    expect(acaoAoInscrever({ status: "pendente", confirmacaoEnviadaEm: minutosAtras(3) }, agora)).toBe("nada");
    expect(acaoAoInscrever({ status: "pendente", confirmacaoEnviadaEm: minutosAtras(11) }, agora)).toBe(
      "enviar_confirmacao"
    );
  });

  it("quem saiu e volta precisa confirmar de novo", () => {
    expect(acaoAoInscrever({ status: "descadastrado", confirmacaoEnviadaEm: minutosAtras(600) }, agora)).toBe(
      "enviar_confirmacao"
    );
  });
});

describe("materiaElegivelParaNewsletter", () => {
  const base = {
    status: "publicado",
    canaisPublicacao: ["portal", "newsletter"],
    dataPublicacao: minutosAtras(30),
    excluidoEm: null,
  };

  it("matéria no ar, recente e com o canal marcado", () => {
    expect(materiaElegivelParaNewsletter(base, agora)).toBe(true);
  });

  it("sem o canal, agendada, excluída ou velha não sai", () => {
    expect(materiaElegivelParaNewsletter({ ...base, canaisPublicacao: ["portal"] }, agora)).toBe(false);
    expect(materiaElegivelParaNewsletter({ ...base, dataPublicacao: new Date(agora.getTime() + 60_000) }, agora)).toBe(false);
    expect(materiaElegivelParaNewsletter({ ...base, excluidoEm: agora }, agora)).toBe(false);
    expect(materiaElegivelParaNewsletter({ ...base, status: "revisao" }, agora)).toBe(false);
    expect(materiaElegivelParaNewsletter({ ...base, dataPublicacao: minutosAtras(49 * 60) }, agora)).toBe(false);
  });
});

describe("lotes, links e status", () => {
  it("divide em lotes de 100", () => {
    const lotes = dividirEmLotes(Array.from({ length: 250 }, (_, i) => i));
    expect(lotes.map((lote) => lote.length)).toEqual([100, 100, 50]);
    expect(dividirEmLotes([])).toEqual([]);
  });

  it("links usam o token codificado e a URL do site", () => {
    const links = linksDaInscricao("https://revista.com.br/", "abc_DEF-123");
    expect(links.confirmar).toBe("https://revista.com.br/newsletter/confirmar?token=abc_DEF-123");
    expect(links.descadastrar).toBe("https://revista.com.br/newsletter/descadastrar?token=abc_DEF-123");
    expect(links.descadastrarUmClique).toBe("https://revista.com.br/api/newsletter/descadastrar?token=abc_DEF-123");
  });

  it("status do disparo", () => {
    expect(statusDoDisparo(0, 0)).toBe("enviado");
    expect(statusDoDisparo(250, 250)).toBe("enviado");
    expect(statusDoDisparo(250, 100)).toBe("parcial");
    expect(statusDoDisparo(250, 0)).toBe("falhou");
  });

  it("link de confirmação vale 7 dias", () => {
    expect(confirmacaoExpirada(minutosAtras(60), agora)).toBe(false);
    expect(confirmacaoExpirada(minutosAtras(8 * 24 * 60), agora)).toBe(true);
    expect(confirmacaoExpirada(null, agora)).toBe(true);
  });

  it("token: só base64url/UUID de tamanho razoável", () => {
    expect(isTokenValido("3f2504e0-4f89-41d3-9a0c-0305e82c3301")).toBe(true);
    expect(isTokenValido("Zm9vYmFyYmF6cXV4MTIzNDU2Nzg5")).toBe(true);
    expect(isTokenValido("curto")).toBe(false);
    expect(isTokenValido("' OR 1=1 --aaaaaaaaaaaaaaaa")).toBe(false);
    expect(isTokenValido(undefined)).toBe(false);
  });
});
