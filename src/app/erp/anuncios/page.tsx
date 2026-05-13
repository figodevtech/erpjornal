import { exigirPermissao, temPermissao } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import AnunciosManager from "./components/AnunciosManager";

export default async function AnunciosPage() {
  const session = await exigirPermissao("anuncios:ler");
  const podeCriar = temPermissao(session, "anuncios:criar");
  const podeEditar = temPermissao(session, "anuncios:editar");

  const anuncios = await prisma.anuncio.findMany({
    orderBy: [{ ativo: "desc" }, { prioridade: "desc" }, { criadoEm: "desc" }],
  });

  return (
    <AnunciosManager
      podeCriar={podeCriar}
      podeEditar={podeEditar}
      anuncios={anuncios.map((anuncio) => ({
        id: anuncio.id,
        titulo: anuncio.titulo,
        imagemUrl: anuncio.imagemUrl,
        linkUrl: anuncio.linkUrl,
        altText: anuncio.altText,
        tamanho: anuncio.tamanho,
        paginas: anuncio.paginas,
        posicoes: anuncio.posicoes,
        ativo: anuncio.ativo,
        prioridade: anuncio.prioridade,
        dataInicio: anuncio.dataInicio?.toISOString() ?? null,
        dataFim: anuncio.dataFim?.toISOString() ?? null,
      }))}
    />
  );
}
