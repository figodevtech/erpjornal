import { afterEach, describe, expect, it, vi } from "vitest";

const enviar = vi.fn();

vi.mock("resend", () => ({
  Resend: vi.fn(function Resend() {
    return { emails: { send: enviar } };
  }),
}));

import { sendNewsletterEmail } from "../newsletter-service";

const artigo = {
  title: "Nova política de sustentabilidade",
  excerpt: "Resumo da matéria.",
  slug: "nova-politica-sustentabilidade",
};

describe("sendNewsletterEmail", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
    enviar.mockReset();
  });

  it("não envia nada sem RESEND_API_KEY", async () => {
    vi.stubEnv("RESEND_API_KEY", "");
    vi.spyOn(console, "warn").mockImplementation(() => {});

    const resultado = await sendNewsletterEmail({ to: "leitor@example.com", subject: "Assunto", artigo });

    expect(resultado).toEqual({ success: false, message: "API Key ausente" });
    expect(enviar).not.toHaveBeenCalled();
  });

  it("envia pelo Resend com o remetente configurado", async () => {
    vi.stubEnv("RESEND_API_KEY", "re_teste");
    vi.stubEnv("EMAIL_FROM", "Revista <contato@exemplo.com>");
    enviar.mockResolvedValue({ data: { id: "email-1" }, error: null });

    const resultado = await sendNewsletterEmail({ to: "leitor@example.com", subject: "Assunto", artigo });

    expect(resultado).toEqual({ success: true, data: { id: "email-1" } });
    expect(enviar).toHaveBeenCalledWith(
      expect.objectContaining({ from: "Revista <contato@exemplo.com>", to: "leitor@example.com", subject: "Assunto" })
    );
  });

  it("devolve o erro do Resend sem lançar", async () => {
    vi.stubEnv("RESEND_API_KEY", "re_teste");
    vi.spyOn(console, "error").mockImplementation(() => {});
    enviar.mockResolvedValue({ data: null, error: { message: "domínio não verificado" } });

    const resultado = await sendNewsletterEmail({ to: "leitor@example.com", subject: "Assunto", artigo });

    expect(resultado.success).toBe(false);
  });
});
