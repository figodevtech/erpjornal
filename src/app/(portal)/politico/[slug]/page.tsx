import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import { Newspaper } from "lucide-react";

import GradeMaterias from "@/components/portal/GradeMaterias";
import PortalEmptyState from "@/components/portal/PortalEmptyState";
import PortalSectionHeader from "@/components/portal/PortalSectionHeader";
import { CAMPOS_CARD_MATERIA, buscarPoliticoPublico, filtroArtigoNoAr } from "@/lib/data/artigos";
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

function subtitulo(politico: { cargo: string | null; partido: string | null; estado: string | null }) {
  return [politico.cargo, politico.partido, politico.estado].filter(Boolean).join(" · ");
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const politico = isSlugValido(slug) ? await buscarPoliticoPublico(slug) : null;
  if (!politico) return { title: "Perfil não encontrado" };
  const nome = politico.nome ?? "Perfil";
  return {
    title: `${nome} | Revista Gestão`,
    description:
      politico.biografia?.slice(0, 160) || `Notícias e informações sobre ${nome} na Revista Gestão.`,
    alternates: { canonical: absoluteUrl(`/politico/${politico.slug}`) },
  };
}

export default async function PoliticoPage({ params }: PageProps) {
  const { slug } = await params;
  const politico = isSlugValido(slug) ? await buscarPoliticoPublico(slug) : null;
  if (!politico) notFound();

  const materias = await prisma.artigo.findMany({
    where: { ...filtroArtigoNoAr(), artigosPoliticos: { some: { politicoId: politico.id } } },
    orderBy: { dataPublicacao: "desc" },
    take: LIMITE,
    select: CAMPOS_CARD_MATERIA,
  });
  const nome = politico.nome ?? "Perfil";
  const descricao = subtitulo(politico);

  return (
    <div className="portal-page min-h-[70vh] w-full">
      <PortalSectionHeader
        eyebrow={politico.categoriaEntidade === "Politico" || !politico.categoriaEntidade ? "Perfil" : politico.categoriaEntidade}
        title={nome}
        description={descricao || undefined}
      />

      <div className="mx-auto max-w-7xl space-y-12 px-4 py-10 sm:px-6 lg:px-8">
        {(politico.biografia || politico.urlFoto) && (
          <section className="flex flex-col gap-6 sm:flex-row sm:items-start" aria-label={`Sobre ${nome}`}>
            {politico.urlFoto && (
              <div className="relative h-40 w-32 shrink-0 overflow-hidden border border-gray-200 bg-gray-100 dark:border-gray-800">
                <Image src={politico.urlFoto} alt={nome} fill sizes="128px" className="object-cover" />
              </div>
            )}
            {politico.biografia && (
              <p className="portal-summary max-w-3xl whitespace-pre-line text-lg leading-relaxed">{politico.biografia}</p>
            )}
          </section>
        )}

        <section aria-labelledby="materias-citadas" className="space-y-6">
          <h2 id="materias-citadas" className="text-xs font-black uppercase tracking-[0.24em] text-red-700">
            Matérias com {nome}
          </h2>
          {materias.length === 0 ? (
            <PortalEmptyState
              icon={Newspaper}
              title="Nenhuma matéria publicada ainda."
              description={`Quando a redação publicar matérias com ${nome}, elas aparecem aqui.`}
              className="max-w-3xl py-16"
            />
          ) : (
            <GradeMaterias materias={materias} />
          )}
        </section>
      </div>
    </div>
  );
}
