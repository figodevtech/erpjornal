import Image from "next/image";
import Link from "next/link";

export type MateriaCard = {
  id: string;
  titulo: string;
  slug: string;
  resumo: string | null;
  urlImagemOg: string | null;
  dataPublicacao: Date | null;
  criadoEm: Date;
  autor: { nome: string | null } | null;
  categoria: { nome: string } | null;
};

/** Grade de cards de matérias (mesmo visual das páginas de categoria). */
export default function GradeMaterias({ materias }: { materias: MateriaCard[] }) {
  return (
    <div className="grid grid-cols-1 gap-10 gap-y-12 md:grid-cols-2 lg:grid-cols-3">
      {materias.map((materia) => {
        const data = materia.dataPublicacao ?? materia.criadoEm;
        return (
          <Link key={materia.id} href={`/noticia/${materia.slug}`} className="group flex h-full flex-col items-start">
            <div className="relative mb-4 aspect-[4/3] w-full overflow-hidden border border-gray-200 bg-gray-100 transition-colors duration-300 group-hover:border-red-700 dark:border-gray-800 dark:bg-gray-900">
              {materia.urlImagemOg ? (
                <Image
                  src={materia.urlImagemOg}
                  alt={materia.titulo}
                  fill
                  sizes="(max-width: 768px) 100vw, 400px"
                  className="object-cover transition-transform duration-700 group-hover:scale-105"
                />
              ) : (
                <div className="absolute inset-0 flex items-center justify-center text-gray-300 dark:text-gray-700" aria-hidden>
                  <svg className="h-12 w-12" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
              )}
            </div>

            {materia.categoria && (
              <span className="mb-4 rounded-sm border border-red-900 bg-red-800 px-3 py-1 text-[11px] font-black uppercase tracking-widest text-white dark:border-red-900/30 dark:bg-red-700/80">
                {materia.categoria.nome}
              </span>
            )}

            <h2 className="card-headline mb-3 line-clamp-3 text-[22px] font-black leading-[1.2]">{materia.titulo}</h2>

            {materia.resumo && (
              <p className="portal-summary mb-4 line-clamp-3 flex-grow text-[16px] font-normal leading-snug">
                {materia.resumo}
              </p>
            )}

            <div className="portal-card-meta mt-auto flex w-full items-center gap-3 pt-2 text-[11px] font-black uppercase tracking-widest">
              <time dateTime={data.toISOString()}>
                {data.toLocaleDateString("pt-BR", {
                  day: "2-digit",
                  month: "short",
                  year: "numeric",
                  timeZone: "America/Sao_Paulo",
                })}
              </time>
              <span className="hidden h-1 w-1 bg-gray-300 sm:block" />
              <span className="hidden truncate sm:inline-block">{materia.autor?.nome || "Redação"}</span>
            </div>
          </Link>
        );
      })}
    </div>
  );
}
