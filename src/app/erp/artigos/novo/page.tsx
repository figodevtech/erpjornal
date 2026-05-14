import Link from "next/link";
import { redirect } from "next/navigation";

import { exigirPermissao, temPermissao } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

import ArticleForm from "../components/ArticleForm";

export default async function NovoArtigoPage({
  searchParams,
}: {
  searchParams: Promise<{ revistaId?: string }>;
}) {
  const session = await exigirPermissao("artigos:criar");
  const { revistaId } = await searchParams;

  const revista = revistaId
    ? await prisma.revista.findUnique({
        where: { id: revistaId },
        select: { id: true, titulo: true },
      })
    : null;

  if (revistaId && !revista) {
    redirect("/erp/revistas");
  }

  const categories = await prisma.categoria.findMany({
    select: { id: true, nome: true },
    orderBy: { nome: "asc" },
  });

  const politicians = await prisma.$queryRaw<
    Array<{ id: string; nome: string | null; partido: string | null; categoriaEntidade: string | null }>
  >`
    select id, nome, partido, categoria_entidade as "categoriaEntidade"
    from public.politicos
    order by nome asc nulls last, criado_em desc
  `;

  const revistas = await prisma.revista.findMany({
    select: { id: true, titulo: true, edicao: true },
    orderBy: [{ dataPublicacao: "desc" }, { createdAt: "desc" }],
  });

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center gap-4">
        <Link
          href={revista ? `/erp/revistas/${revista.id}` : "/erp/artigos"}
          className="rounded-full border border-gray-200 bg-white p-2 text-gray-400 shadow-sm transition-all hover:bg-gray-100 hover:text-gray-900"
          aria-label="Voltar para a listagem"
        >
          <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
        </Link>
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-gray-900">Nova Matéria</h1>
          <p className="mt-1 text-sm text-gray-500">
            {revista ? `Nova matéria para a revista ${revista.titulo}.` : "Preencha os dados e escolha o fluxo de publicação."}
          </p>
        </div>
      </div>

      <ArticleForm
        categories={categories}
        politicians={politicians}
        revistas={revistas}
        canPublish={temPermissao(session, "artigos:publicar")}
        canEditLegal={temPermissao(session, "artigos:editar")}
        revistaId={revista?.id}
        revistaTitulo={revista?.titulo}
      />
    </div>
  );
}
