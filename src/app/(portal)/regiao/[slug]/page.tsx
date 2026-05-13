import PortalEmptyState from "@/components/portal/PortalEmptyState";
import PortalSectionHeader from "@/components/portal/PortalSectionHeader";
import { prisma } from "@/lib/prisma";
import { ArticleStatus } from "@/lib/types/article-status";
import { Prisma } from "@prisma/client";
import { Globe, MapPin } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";

const stateNames: Record<string, string> = {
  ac: "Acre",
  al: "Alagoas",
  ap: "Amapa",
  am: "Amazonas",
  ba: "Bahia",
  ce: "Ceara",
  df: "Distrito Federal",
  es: "Espirito Santo",
  go: "Goias",
  ma: "Maranhao",
  mt: "Mato Grosso",
  ms: "Mato Grosso do Sul",
  mg: "Minas Gerais",
  pa: "Para",
  pb: "Paraiba",
  pr: "Parana",
  pe: "Pernambuco",
  pi: "Piaui",
  rj: "Rio de Janeiro",
  rn: "Rio Grande do Norte",
  rs: "Rio Grande do Sul",
  ro: "Rondonia",
  rr: "Roraima",
  sc: "Santa Catarina",
  sp: "Sao Paulo",
  se: "Sergipe",
  to: "Tocantins",
  nacional: "Nacional",
};

interface ArticleWithExtras {
  id: string;
  titulo: string;
  slug: string;
  resumo: string | null;
  urlImagemOg: string | null;
  dataPublicacao: Date | null;
  criadoEm: Date;
  regiao: string | null;
  estado: string | null;
  autor: { nome: string | null };
  categoria: { nome: string } | null;
}

export default async function RegionalPage({ params }: { params: Promise<{ slug: string }> }) {
  const resolvedParams = await params;
  const slug = resolvedParams.slug.toLowerCase();

  let title = "Noticias regionais";
  let description = "Acompanhe as noticias politicas da sua regiao.";
  const whereClause: Prisma.ArtigoWhereInput = {
    status: ArticleStatus.publicado,
    revistaId: null,
  };

  if (slug === "nacional") {
    title = "Noticias nacionais";
    description = "Cobertura politica de alcance nacional, com foco em poder, governo e impactos institucionais.";
    whereClause.regiao = "Nacional";
  } else if (slug === "internacional") {
    title = "Noticias internacionais";
    description = "Acompanhe as noticias politicas de todo o mundo.";
    whereClause.regiao = "Internacional";
  } else if (stateNames[slug]) {
    title = `Politica em ${stateNames[slug]}`;
    description = `Acompanhe os fatos mais relevantes da cena politica em ${stateNames[slug]}.`;
    whereClause.estado = slug.toUpperCase();
  } else {
    const spheres = ["estadual", "municipal"];
    if (spheres.includes(slug)) {
      const label = slug.charAt(0).toUpperCase() + slug.slice(1);
      title = `Politica ${label}`;
      description = `Cobertura das decisoes e movimentacoes da esfera ${slug}.`;
      whereClause.regiao = label;
    } else {
      notFound();
    }
  }

  const artigos = (await prisma.artigo.findMany({
    where: whereClause,
    orderBy: { criadoEm: "desc" },
    include: { categoria: true, autor: { select: { nome: true } } },
  })) as unknown as ArticleWithExtras[];

  return (
    <div className="portal-page min-h-[70vh] w-full pb-8 transition-colors duration-300">
      <PortalSectionHeader
        eyebrow="Cobertura regional"
        title={title}
        description={description}
        badge={
          <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/10 px-4 py-3 text-xs font-black uppercase tracking-widest text-white shadow-sm backdrop-blur-md">
            <MapPin className="h-4 w-4 text-red-400" />
            <span>{slug}</span>
          </div>
        }
      />

      <section className="mx-auto grid max-w-7xl grid-cols-1 gap-10 gap-y-12 px-4 py-10 sm:px-6 md:grid-cols-2 lg:grid-cols-3 lg:px-8">
        {artigos.map((artigo) => (
          <Link key={artigo.id} href={`/noticia/${artigo.slug}`} className="group flex h-full flex-col items-start">
            <div className="relative mb-4 aspect-[4/3] w-full overflow-hidden border border-gray-200 bg-gray-100 transition-colors duration-300 group-hover:border-red-700 dark:border-gray-800 dark:bg-gray-900">
              <div className="absolute inset-0 z-10 bg-gradient-to-t from-gray-900/10 to-transparent" />
              {artigo.urlImagemOg ? (
                <Image
                  src={artigo.urlImagemOg}
                  alt={artigo.titulo}
                  fill
                  sizes="(max-width: 768px) 100vw, 400px"
                  className="object-cover transition-transform duration-700 group-hover:scale-105"
                />
              ) : (
                <div className="absolute inset-0 flex items-center justify-center text-gray-300 transition-transform duration-500 group-hover:scale-105 dark:text-gray-700">
                  <svg className="h-12 w-12" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2v12a2 2 0 002 2z" />
                  </svg>
                </div>
              )}
            </div>

            <div className="mb-4 flex w-full items-center justify-between gap-2">
              <span className="rounded-sm border border-red-900 bg-red-800 px-3 py-1 text-[11px] font-black uppercase tracking-widest text-white dark:border-red-900/30 dark:bg-red-700/80">
                {artigo.categoria?.nome || "Politica"}
              </span>
              <span className="portal-card-meta text-[10px] font-black uppercase tracking-widest">
                {artigo.regiao} {artigo.estado ? `- ${artigo.estado}` : ""}
              </span>
            </div>

            <h3 className="card-headline mb-3 line-clamp-3 text-[22px] font-black leading-[1.2] transition-colors duration-500">
              {artigo.titulo}
            </h3>

            {artigo.resumo && (
              <p className="portal-summary mb-4 flex-grow line-clamp-3 text-[16px] font-normal leading-snug">
                {artigo.resumo}
              </p>
            )}

            <div className="portal-card-meta mt-auto flex w-full items-center gap-3 pt-2 text-[11px] font-black uppercase tracking-widest">
              <time>{(artigo.dataPublicacao ?? artigo.criadoEm).toLocaleDateString("pt-BR")}</time>
              <span className="hidden h-1 w-1 bg-gray-300 sm:block" />
              <span className="hidden truncate sm:inline-block">Por {artigo.autor.nome || "Redacao"}</span>
            </div>
          </Link>
        ))}
      </section>

      {artigos.length === 0 && (
        <PortalEmptyState
          icon={Globe}
          title="Nenhum artigo encontrado para esta regiao."
          description="Estamos trabalhando para trazer as noticias politicas mais relevantes desta localidade em breve."
        />
      )}
    </div>
  );
}
