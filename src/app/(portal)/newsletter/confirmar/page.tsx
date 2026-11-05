import type { Metadata } from "next";
import Link from "next/link";

import { situacaoDoToken } from "@/lib/newsletter/inscricao";

import { confirmarInscricao } from "../actions";
import CartaoNewsletter, { classeBotaoNewsletter } from "../CartaoNewsletter";

export const metadata: Metadata = {
  title: "Confirmar inscrição | Revista Gestão",
  robots: { index: false, follow: false },
};

interface PageProps {
  searchParams: Promise<{ token?: string | string[] }>;
}

export default async function ConfirmarNewsletterPage({ searchParams }: PageProps) {
  const { token } = await searchParams;
  const { situacao, email } = await situacaoDoToken(token);

  if (situacao === "confirmado") {
    return (
      <CartaoNewsletter titulo="Inscrição confirmada">
        <p>
          Pronto{email ? <> — <strong>{email}</strong></> : null}: você vai receber a newsletter da Revista Gestão.
        </p>
        <p className="text-sm">Todo e-mail traz um link para sair da lista quando quiser.</p>
        <Link href="/" className={classeBotaoNewsletter}>
          Ir para o portal
        </Link>
      </CartaoNewsletter>
    );
  }

  if (situacao === "pendente" && typeof token === "string") {
    return (
      <CartaoNewsletter titulo="Confirme sua inscrição">
        <p>
          Confirme que quer receber a newsletter da Revista Gestão em <strong>{email}</strong>.
        </p>
        <form action={confirmarInscricao}>
          <input type="hidden" name="token" value={token} />
          <button type="submit" className={classeBotaoNewsletter}>
            Confirmar inscrição
          </button>
        </form>
      </CartaoNewsletter>
    );
  }

  return (
    <CartaoNewsletter titulo={situacao === "expirado" ? "Link expirado" : "Link inválido"}>
      <p>
        {situacao === "expirado"
          ? "Este link de confirmação passou de 7 dias. Inscreva-se de novo para receber um link novo."
          : situacao === "descadastrado"
            ? "Este e-mail saiu da newsletter. Para voltar, inscreva-se de novo."
            : "Não encontramos esta inscrição. Confira se o link foi copiado inteiro."}
      </p>
      <Link href="/" className={classeBotaoNewsletter}>
        Ir para o portal
      </Link>
    </CartaoNewsletter>
  );
}
