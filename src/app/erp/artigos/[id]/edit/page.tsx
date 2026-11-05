import { exigirAlgumaPermissao, temPermissao } from "@/lib/auth";

import { prisma } from "@/lib/prisma";
import ArticleForm, { InitialData } from "../../components/ArticleForm";
import Link from "next/link";
import { redirect } from "next/navigation";

// Next.js 15 exige Promise on params
export default async function EditarArtigoPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await exigirAlgumaPermissao(["artigos:editar", "artigos:publicar"]);

  const resolvedParams = await params;
  const id = resolvedParams.id;

  const artigoBase = await prisma.artigo.findUnique({
    where: { id },
    include: {
      checagensFato: true,
    },
  });

  const [entidadesDoArtigo, tagsDoArtigo, revistaAtual] = await Promise.all([
    prisma.artigoPolitico.findMany({
      where: { artigoId: id, politico: { excluidoEm: null } },
      select: { politicoId: true, papel: true },
    }),
    prisma.artigoTag.findMany({
      where: { artigoId: id },
      select: { tag: { select: { nome: true } } },
      orderBy: { tag: { nome: "asc" } },
    }),
    artigoBase?.revistaId
      ? prisma.revista.findUnique({ where: { id: artigoBase.revistaId }, select: { id: true, titulo: true } })
      : Promise.resolve(null),
  ]);

  const artigo = artigoBase
    ? ({
        ...artigoBase,
        politicos: entidadesDoArtigo.map(({ politicoId, papel }) => ({ id: politicoId, papel })),
        tags: tagsDoArtigo.map(({ tag }) => tag.nome),
      } as unknown as InitialData)
    : null;

  if (!artigo) {
    redirect("/erp/artigos");
  }

  // Prevenção Rigorosa de Edição se Reporter tentar editar artigo de outros
  if (!temPermissao(session, "artigos:editar_todos") && artigo.autorId !== session.user.id) {
    redirect("/erp/artigos");
  }

  // Via Prisma (não SQL direto): entidades excluídas ficam de fora automaticamente.
  const politicians = await prisma.politico.findMany({
    select: { id: true, nome: true, partido: true, categoriaEntidade: true },
    orderBy: [{ nome: { sort: "asc", nulls: "last" } }, { criadoEm: "desc" }],
  });

  const categories = await prisma.categoria.findMany({
    select: { id: true, nome: true },
    orderBy: { nome: "asc" }
  });

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center gap-4">
        <Link 
          href={artigo.revistaId ? `/erp/revistas/${artigo.revistaId}` : "/erp/artigos"} 
          className="text-gray-400 hover:text-gray-900 bg-white hover:bg-gray-100 p-2 rounded-full shadow-sm transition-all border border-gray-200"
          aria-label="Voltar para a listagem"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
        </Link>
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Editar Matéria</h1>
          <p className="text-sm text-gray-500 mt-1">Modificando o workflow ou conteúdo do artigo original.</p>
        </div>
      </div>

      <ArticleForm
        categories={categories}
        politicians={politicians}
        canPublish={temPermissao(session, "artigos:publicar")}
        canEditLegal={temPermissao(session, "artigos:editar")}
        initialData={artigo}
        revistaTitulo={revistaAtual?.titulo}
      />
    </div>
  );
}

