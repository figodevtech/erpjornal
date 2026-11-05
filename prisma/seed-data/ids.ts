import { createHash } from "node:crypto";

/**
 * Gera um UUID determinístico a partir de um nome (formato UUID v5).
 * O mesmo nome sempre produz o mesmo id, o que deixa o seed idempotente.
 */
export function idEstavel(nome: string): string {
  const hash = createHash("sha1").update(`revista-gestao-seed:${nome}`).digest();
  const bytes = Buffer.from(hash.subarray(0, 16));
  bytes[6] = (bytes[6] & 0x0f) | 0x50; // versão 5
  bytes[8] = (bytes[8] & 0x3f) | 0x80; // variante RFC 4122
  const hex = bytes.toString("hex");
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`;
}
