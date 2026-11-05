import { describe, expect, it } from "vitest";

import { fetchExterno, isIpBloqueado, validarUrlExterna } from "../fetch-externo";

describe("isIpBloqueado", () => {
  it.each([
    "127.0.0.1",
    "10.1.2.3",
    "172.16.0.1",
    "172.31.255.255",
    "192.168.0.10",
    "169.254.169.254", // metadados de nuvem
    "100.64.0.1",
    "0.0.0.0",
    "224.0.0.1",
    "::1",
    "::",
    "fc00::1",
    "fd12:3456::1",
    "fe80::1",
    "::ffff:127.0.0.1",
    "::ffff:169.254.169.254",
    "nao-e-ip",
  ])("bloqueia %s", (ip) => {
    expect(isIpBloqueado(ip)).toBe(true);
  });

  it.each(["8.8.8.8", "1.1.1.1", "172.32.0.1", "200.152.38.1", "2606:4700:4700::1111"])(
    "permite %s",
    (ip) => {
      expect(isIpBloqueado(ip)).toBe(false);
    }
  );
});

describe("validarUrlExterna", () => {
  it("aceita http/https públicos", () => {
    expect(validarUrlExterna("https://agenciabrasil.ebc.com.br/rss/feed.xml").hostname).toBe(
      "agenciabrasil.ebc.com.br"
    );
  });

  it.each([
    ["file:///etc/passwd", "esquema"],
    ["gopher://exemplo.com", "esquema"],
    ["https://user:senha@exemplo.com", "credenciais"],
    ["https://exemplo.com:22/", "porta"],
    ["http://127.0.0.1/admin", "rede interna"],
    ["http://169.254.169.254/latest/meta-data", "rede interna"],
    ["http://[::1]/", "rede interna"],
    ["nao é url", "inválida"],
  ])("bloqueia %s", (url, motivo) => {
    expect(() => validarUrlExterna(url)).toThrow(motivo);
  });
});

describe("fetchExterno", () => {
  it("bloqueia nomes que resolvem para a máquina local (validado na conexão)", async () => {
    const erro = await fetchExterno("http://localhost:8080/").catch((e: Error & { cause?: Error }) => e);
    // O motivo precisa ser o bloqueio, não "conexão recusada".
    expect((erro as Error & { cause?: Error }).cause?.name).toBe("UrlExternaBloqueadaError");
  });
});
