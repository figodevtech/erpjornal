import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Calendar, Plus } from "lucide-react";

import { exigirPermissao, temPermissao } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

import RevistaArticleSorter from "../components/RevistaArticleSorter";
import RevistaCoverUploader from "../components/RevistaCoverUploader";

export default async function RevistaDetalhePage({ params }: { params: Promise<{ id: string }> }) {
  const session = await exigirPermissao("revistas:ler");
  const { id } = await params;
  const podeCriar = temPermissao(session, "revistas:criar") && temPermissao(session, "artigos:criar");
  const podeEditar = temPermissao(session, "revistas:editar");

  const revista = await prisma.revista.findUnique({
    where: { id },
    include: {
      artigos: {
        orderBy: [{ ordemNaRevista: "asc" }, { criadoEm: "asc" }],
        include: {
          autor: { select: { nome: true } },
          categoria: { select: { nome: true } },
        },
      },
    },
  });

  if (!revista) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-6 lg:grid-cols-[280px_1fr]">
        <RevistaCoverUploader
          revistaId={revista.id}
          titulo={revista.titulo}
          initialUrl={revista.capaUrl}
          canEdit={podeEditar}
        />

        <div className="flex min-w-0 flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="min-w-0">
          <Link href="/erp/revistas" className="mb-4 inline-flex items-center gap-2 text-sm font-medium text-gray-500 hover:text-gray-900">
            <ArrowLeft className="h-4 w-4" />
            Voltar para revistas
          </Link>
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-full bg-indigo-50 px-3 py-1 text-xs font-bold text-indigo-700">Edição {revista.edicao}</span>
            <span className="inline-flex items-center gap-1 text-xs font-medium text-gray-500">
              <Calendar className="h-3.5 w-3.5" />
              {revista.dataPublicacao ? revista.dataPublicacao.toLocaleDateString("pt-BR") : "Sem data de publicação"}
            </span>
          </div>
          <h1 className="mt-3 text-3xl font-extrabold tracking-tight text-gray-900">{revista.titulo}</h1>
          {revista.descricao && <p className="mt-2 max-w-3xl text-sm leading-6 text-gray-600">{revista.descricao}</p>}
        </div>

        {podeCriar && (
          <Link
            href={`/erp/artigos/novo?revistaId=${revista.id}`}
            className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-indigo-600 px-5 py-2.5 text-sm font-bold text-white shadow-sm transition hover:bg-indigo-700 sm:w-fit sm:whitespace-nowrap"
          >
            <Plus className="h-4 w-4" />
            Adicionar artigo
          </Link>
        )}
        </div>
      </div>

      <RevistaArticleSorter revistaId={revista.id} artigos={revista.artigos} podeEditar={podeEditar} />
    </div>
  );
}
