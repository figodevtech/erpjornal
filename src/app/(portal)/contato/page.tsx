import type { Metadata } from "next";
import Link from "next/link";

import PaginaInstitucional from "@/components/portal/PaginaInstitucional";
import { emailContato } from "@/lib/contato";

export const metadata: Metadata = {
  title: "Contato | Revista Gestão",
  description: "Fale com a redação e com a equipe comercial da Revista Gestão.",
};

export default function ContatoPage() {
  const email = emailContato();

  return (
    <PaginaInstitucional eyebrow="Institucional" titulo="Fale conosco" descricao="Redação, sugestões de pauta e comercial.">
      <h2>Redação</h2>
      {email ? (
        <p>
          Envie sugestões de pauta, correções ou dúvidas para <a href={`mailto:${email}`}>{email}</a>.
        </p>
      ) : (
        <p>O canal de contato da redação será divulgado em breve.</p>
      )}
      <h2>Comercial</h2>
      <p>
        Formatos e condições de anúncio estão no nosso <Link href="/midia-kit/revista-gestao">mídia kit</Link>.
      </p>
      <h2>Privacidade</h2>
      <p>
        Para exercer seus direitos sobre dados pessoais, veja a nossa{" "}
        <Link href="/politica-de-privacidade">política de privacidade</Link>.
      </p>
    </PaginaInstitucional>
  );
}
