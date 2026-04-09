import PortalEmptyState from "@/components/portal/PortalEmptyState";
import PortalSectionHeader from "@/components/portal/PortalSectionHeader";
import { prisma } from "@/lib/prisma";
import { ArticleStatus } from "@/lib/types/article-status";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Calendar, Globe, MapPin } from "lucide-react";
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
  criadoEm: Date;
  regiao: string | null;
  estado: string | null;
  autor: { nome: string };
  categoria: { nome: string } | null;
}

export default async function RegionalPage({ params }: { params: Promise<{ slug: string }> }) {
  const resolvedParams = await params;
  const slug = resolvedParams.slug.toLowerCase();

  let title = "Noticias regionais";
  let description = "Acompanhe as noticias politicas da sua regiao.";
  const whereClause: { status: ArticleStatus; regiao?: string; estado?: string } = {
    status: ArticleStatus.publicado,
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
    <div className="space-y-8 pb-8">
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

      <section className="mx-auto grid max-w-6xl grid-cols-1 gap-6 px-4 md:grid-cols-2 lg:grid-cols-3">
        {artigos.map((artigo) => (
          <Link
            key={artigo.id}
            href={`/noticia/${artigo.slug}`}
            className="group flex flex-col overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
          >
            {artigo.urlImagemOg && (
              <div className="relative aspect-video w-full overflow-hidden">
                <Image
                  src={artigo.urlImagemOg}
                  alt={artigo.titulo}
                  fill
                  sizes="(max-width: 768px) 100vw, 400px"
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                />
              </div>
            )}

            <div className="flex flex-1 flex-col justify-between space-y-4 p-6">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="rounded border border-red-100 bg-red-50 px-2 py-0.5 text-[10px] font-black uppercase tracking-widest text-red-600">
                    {artigo.categoria?.nome || "Politica"}
                  </span>
                  <span className="text-[10px] font-bold uppercase tracking-widest text-gray-500">
                    {artigo.regiao} {artigo.estado ? `• ${artigo.estado}` : ""}
                  </span>
                </div>
                <h3 className="text-lg font-bold leading-tight text-gray-900 transition-colors group-hover:text-red-700">
                  {artigo.titulo}
                </h3>
                <p className="line-clamp-3 text-xs text-gray-600">{artigo.resumo}</p>
              </div>

              <div className="flex items-center justify-between border-t border-gray-100 pt-4">
                <div className="flex flex-col">
                  <span className="text-[10px] text-gray-500">Por {artigo.autor.nome}</span>
                  <div className="flex items-center gap-1 text-[10px] text-gray-500">
                    <Calendar className="h-3 w-3" />
                    {new Date(artigo.criadoEm).toLocaleDateString("pt-BR")}
                  </div>
                </div>
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-100 text-gray-500 transition-all group-hover:bg-red-600 group-hover:text-white">
                  <ArrowRight className="h-4 w-4" />
                </div>
              </div>
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
