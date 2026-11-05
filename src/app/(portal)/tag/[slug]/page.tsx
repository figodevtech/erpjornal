import type { Metadata } from "next";
import { notFound } from "next/navigation";

import GradeMaterias from "@/components/portal/GradeMaterias";
import PortalSectionHeader from "@/components/portal/PortalSectionHeader";
import { CAMPOS_CARD_MATERIA, buscarTagPublica, filtroArtigoNoAr } from "@/lib/data/artigos";
import { isSlugValido } from "@/lib/http/parametros";
import { prisma } from "@/lib/prisma";
import { absoluteUrl } from "@/lib/site-url";

// Estática com ISR, como as demais páginas do portal.
export const revalidate = 300;
export async function generateStaticParams() {
  return [];
}

const LIMITE = 48;

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const tag = isSlugValido(slug) ? await buscarTagPublica(slug) : null;
  if (!tag) return { title: "Tag não encontrada" };
  return {
    title: `${tag.nome} | Revista Gestão`,
    description: `Matérias da Revista Gestão sobre ${tag.nome}.`,
    alternates: { canonical: absoluteUrl(`/tag/${tag.slug}`) },
  };
}

export default async function TagPage({ params }: PageProps) {
  const { slug } = await params;
  const tag = isSlugValido(slug) ? await buscarTagPublica(slug) : null;
  if (!tag) notFound();

  const materias = await prisma.artigo.findMany({
    where: { ...filtroArtigoNoAr(), tags: { some: { tagId: tag.id } } },
    orderBy: { dataPublicacao: "desc" },
    take: LIMITE,
    select: CAMPOS_CARD_MATERIA,
  });

  return (
    <div className="portal-page min-h-[70vh] w-full">
      <PortalSectionHeader
        eyebrow="Tag"
        title={tag.nome}
        description={`Todas as matérias da Revista Gestão marcadas com “${tag.nome}”.`}
      />
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <GradeMaterias materias={materias} />
      </div>
    </div>
  );
}
