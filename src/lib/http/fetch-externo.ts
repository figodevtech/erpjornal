import "server-only";

import { lookup as dnsLookup, type LookupAddress, type LookupOptions } from "node:dns";
import { isIP } from "node:net";

import { Agent, fetch as undiciFetch, type Response } from "undici";

/**
 * Busca de URLs externas protegida contra SSRF.
 *
 * Use para qualquer URL vinda de usuário ou de feeds de terceiros (RSS, scraping,
 * imagem de referência). Bloqueia:
 * - esquemas que não sejam http/https e URLs com credenciais;
 * - destinos em redes privadas, loopback, link-local (ex.: metadados da nuvem
 *   em 169.254.169.254), CGNAT, multicast e reservadas — validado NA CONEXÃO
 *   (lookup do DNS), o que também barra DNS rebinding;
 * - redirecionamentos para destinos bloqueados (cada salto é revalidado);
 * - respostas lentas (timeout) ou grandes demais (ler com lerCorpoLimitado).
 */

export class UrlExternaBloqueadaError extends Error {
  constructor(motivo: string) {
    super(`URL externa bloqueada: ${motivo}`);
    this.name = "UrlExternaBloqueadaError";
  }
}

function ipv4ParaNumero(ip: string) {
  return ip.split(".").reduce((acc, octeto) => (acc << 8) + Number(octeto), 0) >>> 0;
}

const FAIXAS_IPV4_BLOQUEADAS: Array<[string, number]> = [
  ["0.0.0.0", 8], // "esta" rede
  ["10.0.0.0", 8], // privada
  ["100.64.0.0", 10], // CGNAT
  ["127.0.0.0", 8], // loopback
  ["169.254.0.0", 16], // link-local (metadados de nuvem)
  ["172.16.0.0", 12], // privada
  ["192.0.0.0", 24], // IETF
  ["192.0.2.0", 24], // documentação
  ["192.168.0.0", 16], // privada
  ["198.18.0.0", 15], // benchmark
  ["198.51.100.0", 24], // documentação
  ["203.0.113.0", 24], // documentação
  ["224.0.0.0", 4], // multicast
  ["240.0.0.0", 4], // reservada + broadcast
];

function ipv4Bloqueado(ip: string) {
  const valor = ipv4ParaNumero(ip);
  return FAIXAS_IPV4_BLOQUEADAS.some(([base, bits]) => {
    const mascara = bits === 0 ? 0 : (~0 << (32 - bits)) >>> 0;
    return (valor & mascara) === (ipv4ParaNumero(base) & mascara);
  });
}

/** true se o IP não for um endereço público roteável. */
export function isIpBloqueado(ip: string): boolean {
  const versao = isIP(ip);
  if (versao === 4) return ipv4Bloqueado(ip);
  if (versao !== 6) return true;

  const normalizado = ip.toLowerCase();
  // IPv4 mapeado/compatível em IPv6 (::ffff:127.0.0.1)
  const v4 = normalizado.match(/(?:^|:)(\d{1,3}(?:\.\d{1,3}){3})$/);
  if (v4) return ipv4Bloqueado(v4[1]);

  return (
    normalizado === "::" ||
    normalizado === "::1" ||
    /^f[cd][0-9a-f]{2}:/.test(normalizado) || // fc00::/7 (privada)
    /^fe[89ab][0-9a-f]:/.test(normalizado) || // fe80::/10 (link-local)
    /^ff[0-9a-f]{2}:/.test(normalizado) || // multicast
    normalizado.startsWith("2001:db8:") || // documentação
    normalizado.startsWith("64:ff9b:") // NAT64 (pode apontar para IPv4 interno)
  );
}

const PORTAS_PERMITIDAS = new Set(["", "80", "443", "8080", "8443"]);

/** Valida a URL antes da conexão (esquema, credenciais, porta e IP literal). */
export function validarUrlExterna(entrada: string | URL): URL {
  let url: URL;
  try {
    url = new URL(entrada);
  } catch {
    throw new UrlExternaBloqueadaError("URL inválida");
  }
  if (url.protocol !== "http:" && url.protocol !== "https:") {
    throw new UrlExternaBloqueadaError(`esquema ${url.protocol} não permitido`);
  }
  if (url.username || url.password) {
    throw new UrlExternaBloqueadaError("credenciais na URL");
  }
  if (!PORTAS_PERMITIDAS.has(url.port)) {
    throw new UrlExternaBloqueadaError(`porta ${url.port} não permitida`);
  }
  const host = url.hostname.replace(/^\[|\]$/g, "");
  if (isIP(host) && isIpBloqueado(host)) {
    throw new UrlExternaBloqueadaError("endereço de rede interna");
  }
  return url;
}

type LookupCallback = (
  erro: NodeJS.ErrnoException | null,
  endereco: string | LookupAddress[],
  familia?: number
) => void;

/** lookup de DNS que recusa nomes que resolvem para IPs bloqueados. */
function lookupSeguro(hostname: string, opcoes: LookupOptions, callback: LookupCallback) {
  dnsLookup(hostname, { ...opcoes, all: true }, (erro, enderecos) => {
    if (erro) return callback(erro, []);
    const lista = enderecos as LookupAddress[];
    if (lista.length === 0 || lista.some((item) => isIpBloqueado(item.address))) {
      return callback(new UrlExternaBloqueadaError(`${hostname} resolve para rede interna`), []);
    }
    if (opcoes.all) return callback(null, lista);
    return callback(null, lista[0].address, lista[0].family);
  });
}

const agenteSeguro = new Agent({
  connect: { lookup: lookupSeguro as never },
  connectTimeout: 5_000,
});

const STATUS_REDIRECIONAMENTO = new Set([301, 302, 303, 307, 308]);

export async function fetchExterno(
  url: string,
  opcoes: { headers?: Record<string, string>; timeoutMs?: number; maxRedirecionamentos?: number } = {}
): Promise<Response> {
  const { headers, timeoutMs = 10_000, maxRedirecionamentos = 3 } = opcoes;
  let atual = validarUrlExterna(url);

  for (let salto = 0; salto <= maxRedirecionamentos; salto++) {
    const resposta = await undiciFetch(atual, {
      headers,
      redirect: "manual",
      dispatcher: agenteSeguro,
      signal: AbortSignal.timeout(timeoutMs),
    });

    if (!STATUS_REDIRECIONAMENTO.has(resposta.status)) return resposta;

    const destino = resposta.headers.get("location");
    await resposta.body?.cancel();
    if (!destino) return resposta;
    atual = validarUrlExterna(new URL(destino, atual));
  }

  throw new UrlExternaBloqueadaError("redirecionamentos demais");
}

/** Lê o corpo da resposta abortando se passar de `maxBytes`. */
export async function lerCorpoLimitado(resposta: Response, maxBytes: number): Promise<Buffer> {
  const tamanhoDeclarado = Number(resposta.headers.get("content-length"));
  if (Number.isFinite(tamanhoDeclarado) && tamanhoDeclarado > maxBytes) {
    await resposta.body?.cancel();
    throw new Error(`Resposta maior que o limite de ${maxBytes} bytes.`);
  }

  const partes: Buffer[] = [];
  let total = 0;
  if (!resposta.body) return Buffer.alloc(0);

  for await (const parte of resposta.body) {
    total += parte.byteLength;
    if (total > maxBytes) {
      throw new Error(`Resposta maior que o limite de ${maxBytes} bytes.`);
    }
    partes.push(Buffer.from(parte));
  }
  return Buffer.concat(partes);
}
