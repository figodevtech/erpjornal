import { prisma } from "@/lib/prisma";
import { exigirPermissao, temPermissao } from "@/lib/auth";
import CategoryManager from "./components/CategoryManager";

export default async function CategoriasPage() {
  const session = await exigirPermissao("categorias:ler");
  const podeCriar = temPermissao(session, "categorias:criar");
  const podeEditar = temPermissao(session, "categorias:editar");

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
      podeCriar={podeCriar}
      podeEditar={podeEditar}
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
