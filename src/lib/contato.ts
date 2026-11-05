/** E-mail público de contato (NEXT_PUBLIC_EMAIL_CONTATO). Vazio se não configurado. */
export function emailContato(): string {
  return process.env.NEXT_PUBLIC_EMAIL_CONTATO?.trim() ?? "";
}
