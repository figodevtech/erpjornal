import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowLeft, Lock, MessageSquare, Plus, UserCheck } from "lucide-react";

import { exigirAlgumaPermissao, temPermissao } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

import { saveSourceNote } from "../actions";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function FonteDetailPage({ params }: PageProps) {
  const { id } = await params;
  const session = await exigirAlgumaPermissao(["fontes:ler", "fontes:editar"]);

  const role = session.user.role;
  const isPrivileged = role === "admin" || role === "editor";
  const podeEditar = temPermissao(session, "fontes:editar");

  const fonte = await prisma.fonte.findUnique({
    where: { id },
    include: {
      criador: { select: { nome: true } },
      anotacoes: {
        orderBy: { criadoEm: "desc" },
        include: {
          autor: { select: { nome: true } },
          artigo: { select: { titulo: true, slug: true } },
        },
      },
    },
  });

  if (!fonte) redirect("/erp/fontes");
  if (fonte.nivelSigilo === "confidencial" && !isPrivileged) redirect("/erp/fontes");

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-start gap-4">
        <Link
          href="/erp/fontes"
          className="mt-1 rounded-full border border-gray-200 bg-white p-2 text-gray-400 shadow-sm transition-all hover:bg-gray-100 hover:text-gray-900"
        >
          <ArrowLeft className="h-5 w-5" />
        </Link>

        <div className="flex-1">
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-3xl font-extrabold tracking-tight text-gray-900">{fonte.nome}</h1>
            {fonte.nivelSigilo === "confidencial" && (
              <span className="flex items-center gap-1 rounded-full border border-red-200 bg-red-50 px-3 py-1 text-[10px] font-black uppercase tracking-widest text-red-700">
                <Lock className="h-3 w-3" />
                Confidencial
              </span>
            )}
          </div>

          {(fonte.cargo || fonte.organizacao) && (
            <p className="mt-1 text-gray-500">
              {fonte.cargo}
              {fonte.cargo && fonte.organizacao ? " • " : ""}
              {fonte.organizacao}
            </p>
          )}
        </div>

        {podeEditar && (
          <Link
            href={`/erp/fontes/${id}/editar`}
            className="rounded-xl border border-indigo-200 bg-indigo-50 px-4 py-2 text-sm font-bold text-indigo-600 transition-all hover:bg-indigo-100 hover:text-indigo-700"
          >
            Editar
          </Link>
        )}
      </div>

      <div className="grid grid-cols-1 gap-4 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm md:grid-cols-3">
        {fonte.email && (
          <div>
            <p className="mb-1 text-[10px] font-bold uppercase tracking-widest text-gray-400">Email</p>
            <a href={`mailto:${fonte.email}`} className="text-sm font-medium text-indigo-600 hover:underline">
              {fonte.email}
            </a>
          </div>
        )}

        {fonte.telefone && (
          <div>
            <p className="mb-1 text-[10px] font-bold uppercase tracking-widest text-gray-400">Telefone</p>
            <p className="text-sm font-medium text-gray-700">{fonte.telefone}</p>
          </div>
        )}

        <div>
          <p className="mb-1 text-[10px] font-bold uppercase tracking-widest text-gray-400">Cadastrado por</p>
          <p className="text-sm font-medium text-gray-700">{fonte.criador.nome}</p>
        </div>

        {fonte.notas && (
          <div className="md:col-span-3">
            <p className="mb-1 text-[10px] font-bold uppercase tracking-widest text-gray-400">Notas gerais</p>
            <p className="whitespace-pre-line text-sm text-gray-600">{fonte.notas}</p>
          </div>
        )}
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="flex items-center gap-2 text-lg font-bold text-gray-900">
            <MessageSquare className="h-5 w-5 text-indigo-500" />
            Anotacoes ({fonte.anotacoes.length})
          </h2>
        </div>

        {podeEditar && (
          <form action={saveSourceNote} className="space-y-4 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
            <input type="hidden" name="fonte_id" value={id} />
            <div>
              <label className="mb-1.5 block text-xs font-bold uppercase tracking-widest text-gray-400">
                Nova anotacao
              </label>
              <textarea
                name="conteudo"
                required
                rows={3}
                placeholder="Registre uma observacao sobre esta fonte..."
                className="w-full resize-none rounded-xl border border-gray-200 bg-gray-50 p-3 text-sm outline-none transition-all focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <button
              type="submit"
              className="flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2 text-sm font-bold text-white transition-all hover:bg-indigo-500"
            >
              <Plus className="h-4 w-4" />
              Adicionar anotacao
            </button>
          </form>
        )}

        {fonte.anotacoes.map((nota) => (
          <div key={nota.id} className="space-y-2 rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
            <p className="whitespace-pre-line text-sm leading-relaxed text-gray-700">{nota.conteudo}</p>
            <div className="flex items-center gap-3 border-t border-gray-50 pt-2 text-[11px] text-gray-400">
              <UserCheck className="h-3 w-3" />
              <span>{nota.autor.nome}</span>
              {nota.artigo && (
                <>
                  <span>•</span>
                  <Link href={`/erp/artigos/${nota.artigoId}/edit`} className="text-indigo-500 hover:underline">
                    {nota.artigo.titulo}
                  </Link>
                </>
              )}
              <span className="ml-auto">{new Date(nota.criadoEm).toLocaleDateString("pt-BR")}</span>
            </div>
          </div>
        ))}

        {fonte.anotacoes.length === 0 && (
          <p className="py-8 text-center text-sm italic text-gray-400">Nenhuma anotacao ainda.</p>
        )}
      </div>
    </div>
  );
}
