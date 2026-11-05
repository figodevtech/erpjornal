import type { Metadata } from "next";
import Link from "next/link";

import PaginaInstitucional from "@/components/portal/PaginaInstitucional";

export const metadata: Metadata = {
  title: "Sobre | Revista Gestão",
  description: "Conheça a Revista Gestão: jornalismo político e de gestão pública.",
};

export default function SobrePage() {
  return (
    <PaginaInstitucional
      eyebrow="Institucional"
      titulo="Sobre a Revista Gestão"
      descricao="Jornalismo político e de gestão pública para quem decide."
    >
      <p>
        A Revista Gestão cobre as esferas Executiva, Legislativa e Judiciária, com foco em gestão pública,
        economia e nas políticas que afetam governos, empresas e cidadãos.
      </p>
      <h2>O que você encontra aqui</h2>
      <ul>
        <li>Notícias e análises organizadas por <Link href="/categoria/executivo">esfera de poder</Link> e por região.</li>
        <li>As <Link href="/edicoes-anteriores">edições da revista</Link>, com reportagens aprofundadas.</li>
        <li>Leitura em áudio das matérias e modo escuro para leitura confortável.</li>
      </ul>
      <h2>Compromisso editorial</h2>
      <p>
        As matérias passam por um fluxo editorial com etapas de apuração, redação, revisão e, quando
        necessário, revisão jurídica antes da publicação. Conteúdos republicados de agências trazem o crédito
        e o link da fonte original.
      </p>
      <h2>Anuncie</h2>
      <p>
        Conheça os formatos de anúncio no nosso <Link href="/midia-kit/revista-gestao">mídia kit</Link> ou fale
        com a equipe pela página de <Link href="/contato">contato</Link>.
      </p>
    </PaginaInstitucional>
  );
}
