import type { Metadata } from "next";
import Link from "next/link";

import NewsletterForm from "@/components/portal/NewsletterForm";
import PaginaInstitucional from "@/components/portal/PaginaInstitucional";

export const metadata: Metadata = {
  title: "Assine | Revista Gestão",
  description: "Acesse as matérias exclusivas e receba a newsletter da Revista Gestão.",
};

export default function AssinePage() {
  return (
    <PaginaInstitucional
      eyebrow="Assinatura"
      titulo="Conteúdo exclusivo"
      descricao="Algumas matérias são reservadas para leitores cadastrados."
    >
      <h2>Como ter acesso</h2>
      <p>
        O acesso às matérias exclusivas é liberado para leitores com conta na Revista Gestão. As contas são
        criadas pela nossa equipe: peça a sua pela página de <Link href="/contato">contato</Link>. Se você já
        tem conta, basta <Link href="/login">entrar</Link>.
      </p>
      <h2>Newsletter gratuita</h2>
      <p>Receba as principais matérias no seu e-mail.</p>
      <div className="not-prose mt-6">
        <NewsletterForm origem="pagina_assine" />
      </div>
    </PaginaInstitucional>
  );
}
