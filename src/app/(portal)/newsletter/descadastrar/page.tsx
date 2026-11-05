import type { Metadata } from "next";
import Link from "next/link";

import { situacaoDoToken } from "@/lib/newsletter/inscricao";

import { descadastrarInscricao } from "../actions";
import CartaoNewsletter, { classeBotaoNewsletter } from "../CartaoNewsletter";

export const metadata: Metadata = {
  title: "Sair da newsletter | Revista Gestão",
  robots: { index: false, follow: false },
};

interface PageProps {
  searchParams: Promise<{ token?: string | string[] }>;
}

export default async function DescadastrarNewsletterPage({ searchParams }: PageProps) {
  const { token } = await searchParams;
  const { situacao, email } = await situacaoDoToken(token);

  if (situacao === "invalido" || typeof token !== "string") {
    return (
      <CartaoNewsletter titulo="Link inválido">
        <p>Não encontramos esta inscrição. Confira se o link foi copiado inteiro.</p>
        <Link href="/" className={classeBotaoNewsletter}>
          Ir para o portal
        </Link>
      </CartaoNewsletter>
    );
  }

  if (situacao === "descadastrado") {
    return (
      <CartaoNewsletter titulo="Você saiu da newsletter">
        <p>
          <strong>{email}</strong> não recebe mais a newsletter da Revista Gestão.
        </p>
        <p className="text-sm">Mudou de ideia? É só se inscrever de novo pelo portal.</p>
        <Link href="/" className={classeBotaoNewsletter}>
          Ir para o portal
        </Link>
      </CartaoNewsletter>
    );
  }

  return (
    <CartaoNewsletter titulo="Sair da newsletter">
      <p>
        Parar de enviar a newsletter da Revista Gestão para <strong>{email}</strong>?
      </p>
      <form action={descadastrarInscricao}>
        <input type="hidden" name="token" value={token} />
        <button type="submit" className={classeBotaoNewsletter}>
          Sim, não quero mais receber
        </button>
      </form>
    </CartaoNewsletter>
  );
}
