import { prisma } from "@/lib/prisma";
import { exigirPermissao } from "@/lib/auth";
import CategoryManager from "./components/CategoryManager";

export default async function CategoriasPage() {
  await exigirPermissao("categorias:gerir");

  const categorias = await prisma.categoria.findMany({
    orderBy: { nome: "asc" },
    include: {
      _count: {
        select: {
          artigos: true,
          subcategorias: true,
        },
      },
    },
  });

  return (
    <CategoryManager
      categorias={categorias.map((categoria) => ({
        id: categoria.id,
        nome: categoria.nome,
        slug: categoria.slug,
        esfera: categoria.esfera,
        cor: categoria.cor,
        metaDescricao: categoria.metaDescricao,
        artigosCount: categoria._count.artigos,
        subcategoriasCount: categoria._count.subcategorias,
      }))}
    />
  );
}
