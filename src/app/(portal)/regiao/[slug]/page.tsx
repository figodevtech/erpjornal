import { prisma } from "@/lib/prisma";
import { ArticleStatus } from "@/lib/types/article-status";
import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { MapPin, ArrowRight, Calendar, Globe } from "lucide-react";

const stateNames: Record<string, string> = {
  "ac": "Acre", "al": "Alagoas", "ap": "Amapá", "am": "Amazonas", "ba": "Bahia",
  "ce": "Ceará", "df": "Distrito Federal", "es": "Espírito Santo", "go": "Goiás",
  "ma": "Maranhão", "mt": "Mato Grosso", "ms": "Mato Grosso do Sul", "mg": "Minas Gerais",
  "pa": "Pará", "pb": "Paraíba", "pr": "Paraná", "pe": "Pernambuco", "pi": "Piauí",
  "rj": "Rio de Janeiro", "rn": "Rio Grande do Norte", "rs": "Rio Grande do Sul",
  "ro": "Rondônia", "rr": "Roraima", "sc": "Santa Catarina", "sp": "São Paulo",
  "se": "Sergipe", "to": "Tocantins", "nacional": "Nacional"
};

interface ArticleWithExtras {
  id: string;
  titulo: string;
  slug: string;
  resumo: string | null;
  og_image_url: string | null;
  created_at: Date;
  regiao: string | null;
  estado: string | null;
  autor: { nome: string };
  categoria: { nome: string } | null;
}

export default async function RegionalPage({ params }: { params: { slug: string } }) {
  const resolvedParams = await params;
  const slug = resolvedParams.slug.toLowerCase();
  
  let title = "Notícias Regionais";
  let description = "Acompanhe as notícias políticas da sua região.";
  const whereClause: { status_id: ArticleStatus; regiao?: string; estado?: string } = { 
    status_id: ArticleStatus.publicado 
  };

  if (slug === "nacional") {
    title = "Notícias Nacionais";
    whereClause.regiao = "Nacional";
  } else if (slug === "internacional") {
    title = "Notícias Internacionais";
    whereClause.regiao = "Internacional";
    description = "Acompanhe as notícias políticas de todo o mundo.";
  } else if (stateNames[slug]) {
    title = `Política em ${stateNames[slug]}`;
    whereClause.estado = slug.toUpperCase();
  } else {
    // Tenta filtrar por esfera se não for estado
    const spheres = ["estadual", "municipal"];
    if (spheres.includes(slug)) {
      title = `Política ${slug.charAt(0).toUpperCase() + slug.slice(1)}`;
      whereClause.regiao = slug.charAt(0).toUpperCase() + slug.slice(1);
    } else {
      notFound();
    }
  }

  const articles = await prisma.article.findMany({
    where: whereClause,
    orderBy: { created_at: "desc" },
    include: { categoria: true, autor: { select: { nome: true } } }
  }) as unknown as ArticleWithExtras[];

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-8 animate-in fade-in duration-500">
      {/* Regional Header */}
      <header className="bg-gray-900 text-white rounded-3xl p-10 relative overflow-hidden shadow-2xl">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -trangray-y-1/2 trangray-x-1/2 blur-3xl" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-red-500 font-black text-[10px] tracking-[0.2em] uppercase">
              <Globe className="w-4 h-4" />
              Cobertura Regional
            </div>
            <h1 className="text-4xl md:text-5xl font-black tracking-tighter">{title}</h1>
            <p className="text-gray-400 text-lg max-w-xl">{description}</p>
          </div>
          <div className="flex items-center gap-3 bg-white/10 backdrop-blur-md px-4 py-2 rounded-2xl border border-white/10 self-start md:self-center">
            <MapPin className="w-5 h-5 text-red-500" />
            <span className="font-bold uppercase tracking-widest text-xs">{slug}</span>
          </div>
        </div>
      </header>

      {/* Articles Grid */}
      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {articles.map((artigo) => (
          <Link 
            key={artigo.id} 
            href={`/noticia/${artigo.slug}`}
            className="group flex flex-col bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 transform hover:-trangray-y-1"
          >
            {artigo.og_image_url && (
               <div className="aspect-video w-full overflow-hidden relative">
                <Image 
                  src={artigo.og_image_url} 
                  alt={artigo.titulo} 
                  fill
                  sizes="(max-width: 768px) 100vw, 400px"
                  className="object-cover group-hover:scale-105 transition-transform duration-500" 
                />
               </div>
            )}
            <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-black text-red-600 uppercase tracking-widest bg-red-50 px-2 py-0.5 rounded border border-red-100">
                    {artigo.categoria?.nome || "Política"}
                  </span>
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                    {artigo.regiao} {artigo.estado ? `â€¢ ${artigo.estado}` : ""}
                  </span>
                </div>
                <h3 className="text-lg font-bold text-gray-900 group-hover:text-red-600 transition-colors leading-tight">
                  {artigo.titulo}
                </h3>
                <p className="text-gray-500 text-xs line-clamp-3">
                  {artigo.resumo}
                </p>
              </div>

              <div className="pt-4 border-t border-gray-50 flex items-center justify-between">
                <div className="flex flex-col">
                  <span className="text-[10px] text-gray-400">Por {artigo.autor.nome}</span>
                  <div className="flex items-center gap-1 text-[10px] text-gray-400">
                    <Calendar className="w-3 h-3" />
                    {new Date(artigo.created_at).toLocaleDateString("pt-BR")}
                  </div>
                </div>
                <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-400 group-hover:bg-red-600 group-hover:text-white transition-all">
                  <ArrowRight className="w-4 h-4" />
                </div>
              </div>
            </div>
          </Link>
        ))}
      </section>

      {articles.length === 0 && (
        <div className="py-32 text-center rounded-3xl border-2 border-dashed border-gray-200 bg-gray-50/50">
          <Globe className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-gray-400">Nenhum artigo encontrado para esta região.</h3>
          <p className="text-gray-400 max-w-sm mx-auto mt-2">Estamos trabalhando para trazer as notícias políticas mais relevantes desta localidade em breve.</p>
        </div>
      )}
    </div>
  );
}

