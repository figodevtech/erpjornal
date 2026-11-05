import type { ReactNode } from "react";

import PortalSectionHeader from "@/components/portal/PortalSectionHeader";

type Props = {
  eyebrow?: string;
  titulo: string;
  descricao?: string;
  children: ReactNode;
};

/** Layout comum das páginas institucionais do portal (sobre, contato, política…). */
export default function PaginaInstitucional({ eyebrow = "Revista Gestão", titulo, descricao, children }: Props) {
  return (
    <div className="w-full bg-background pb-20">
      <PortalSectionHeader eyebrow={eyebrow} title={titulo} description={descricao} />
      <article className="mx-auto mt-10 w-full max-w-3xl px-4 sm:px-6 lg:px-8">
        <div className="prose prose-gray dark:prose-invert prose-lg max-w-none prose-a:text-red-700 prose-h2:font-black">
          {children}
        </div>
      </article>
    </div>
  );
}
