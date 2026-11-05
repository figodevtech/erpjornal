import { exigirPermissao } from "@/lib/auth";
import { filtroArtigoNoAr } from "@/lib/data/artigos";
import { prisma } from "@/lib/prisma";

import PlantaoManager from "./PlantaoManager";

export const metadata = { title: "Plantão | ERP" };

export default async function PlantaoPage() {
  await exigirPermissao("plantao:gerir");
  const agora = new Date();

  const [plantoes, materias] = await Promise.all([
    prisma.plantao.findMany({
      orderBy: { criadoEm: "desc" },
      take: 40,
      select: {
        id: true,
        texto: true,
        link: true,
        ativo: true,
        expiraEm: true,
        criadoEm: true,
        autor: { select: { nome: true, email: true } },
        artigo: { select: { titulo: true, slug: true } },
      },
    }),
    prisma.artigo.findMany({
      where: filtroArtigoNoAr(agora),
      orderBy: { dataPublicacao: "desc" },
      take: 40,
      select: { id: true, titulo: true },
    }),
  ]);

  return (
    <PlantaoManager
      materias={materias}
      plantoes={plantoes.map((plantao) => ({
        id: plantao.id,
        texto: plantao.texto,
        link: plantao.link,
        noAr: plantao.ativo && (!plantao.expiraEm || plantao.expiraEm > agora),
        encerrado: !plantao.ativo,
        expiraEm: plantao.expiraEm?.toISOString() ?? null,
        criadoEm: plantao.criadoEm.toISOString(),
        autor: plantao.autor.nome || plantao.autor.email || "—",
        materia: plantao.artigo ? { titulo: plantao.artigo.titulo, slug: plantao.artigo.slug } : null,
      }))}
    />
  );
}
