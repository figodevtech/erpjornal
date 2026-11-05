import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const enviarUm = vi.fn();
const enviarLote = vi.fn();

vi.mock("resend", () => ({
  Resend: vi.fn(function Resend() {
    return { emails: { send: enviarUm }, batch: { send: enviarLote } };
  }),
}));

import { enviarEmailDeConfirmacao, enviarMateriaParaInscritos } from "@/lib/newsletter/email";

const materia = { titulo: "Título", resumo: "Resumo", slug: "materia-x", urlImagemOg: null };
const inscritos = (n: number) => Array.from({ length: n }, (_, i) => ({ email: `l${i}@example.com`, token: `token-${i}-aaaaaaaaaaaaaaaa` }));

beforeEach(() => {
  vi.stubEnv("NEXT_PUBLIC_SITE_URL", "https://revista.com.br");
  vi.spyOn(console, "warn").mockImplementation(() => {});
  vi.spyOn(console, "info").mockImplementation(() => {});
  vi.spyOn(console, "error").mockImplementation(() => {});
});

afterEach(() => {
  vi.unstubAllEnvs();
  enviarUm.mockReset();
  enviarLote.mockReset();
});

describe("enviarEmailDeConfirmacao", () => {
  it("sem RESEND_API_KEY não envia e não lança", async () => {
    vi.stubEnv("RESEND_API_KEY", "");
    expect(await enviarEmailDeConfirmacao("a@example.com", "tok")).toBe(false);
    expect(enviarUm).not.toHaveBeenCalled();
  });

  it("envia com o remetente configurado", async () => {
    vi.stubEnv("RESEND_API_KEY", "re_teste");
    vi.stubEnv("EMAIL_FROM", "Revista <news@revista.com.br>");
    enviarUm.mockResolvedValue({ data: { id: "1" }, error: null });
    expect(await enviarEmailDeConfirmacao("a@example.com", "tok")).toBe(true);
    expect(enviarUm).toHaveBeenCalledWith(
      expect.objectContaining({ from: "Revista <news@revista.com.br>", to: "a@example.com" })
    );
  });

  it("erro do Resend vira false", async () => {
    vi.stubEnv("RESEND_API_KEY", "re_teste");
    enviarUm.mockResolvedValue({ data: null, error: { message: "domínio não verificado" } });
    expect(await enviarEmailDeConfirmacao("a@example.com", "tok")).toBe(false);
  });
});

describe("enviarMateriaParaInscritos", () => {
  it("lotes de 100, link de descadastro próprio e chave de idempotência por lote", async () => {
    vi.stubEnv("RESEND_API_KEY", "re_teste");
    enviarLote.mockResolvedValue({ data: {}, error: null });

    const resultado = await enviarMateriaParaInscritos(materia, inscritos(150), "newsletter-artigo-1");

    expect(resultado).toEqual({ enviados: 150, erro: undefined });
    expect(enviarLote).toHaveBeenCalledTimes(2);
    const [primeiroLote, opcoes] = enviarLote.mock.calls[0];
    expect(primeiroLote).toHaveLength(100);
    expect(opcoes).toEqual({ idempotencyKey: "newsletter-artigo-1-lote-0" });
    expect(enviarLote.mock.calls[1][1]).toEqual({ idempotencyKey: "newsletter-artigo-1-lote-1" });
    expect(primeiroLote[0]).toMatchObject({
      to: "l0@example.com",
      subject: "Título",
      headers: {
        "List-Unsubscribe": "<https://revista.com.br/api/newsletter/descadastrar?token=token-0-aaaaaaaaaaaaaaaa>",
        "List-Unsubscribe-Post": "List-Unsubscribe=One-Click",
      },
    });
  });

  it("lote com erro não conta como enviado", async () => {
    vi.stubEnv("RESEND_API_KEY", "re_teste");
    enviarLote
      .mockResolvedValueOnce({ data: {}, error: null })
      .mockResolvedValueOnce({ data: null, error: { message: "limite" } });

    const resultado = await enviarMateriaParaInscritos(materia, inscritos(150), "k");
    expect(resultado).toEqual({ enviados: 100, erro: "limite" });
  });

  it("sem chave não envia nada", async () => {
    vi.stubEnv("RESEND_API_KEY", "");
    expect(await enviarMateriaParaInscritos(materia, inscritos(3), "k")).toEqual({
      enviados: 0,
      erro: "RESEND_API_KEY ausente",
    });
    expect(enviarLote).not.toHaveBeenCalled();
  });
});
