import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { UserCheck, Lock, MessageSquare, Plus, ArrowLeft } from "lucide-react";
import { saveSourceNote } from "../actions";

interface PageProps {
  params: { id: string };
}

export default async function FonteDetailPage({ params }: PageProps) {
  const { id } = await params;
  const session = await getServerSession(authOptions);
  if (!session) redirect("/api/auth/signin");

  const role = session.user.role as string;
  const isPrivileged = role === "admin" || role === "editor";

  const fonte = await prisma.source.findUnique({
    where: { id },
    include: {
      criador: { select: { nome: true } },
      anotacoes: {
        orderBy: { created_at: "desc" },
        include: { autor: { select: { nome: true } }, article: { select: { titulo: true, slug: true } } }
      }
    }
  });

  if (!fonte) redirect("/erp/fontes");
  if (fonte.nivel_sigilo === "confidencial" && !isPrivileged) {
    redirect("/erp/fontes");
  }

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Header */}
      <div className="flex items-start gap-4">
        <Link href="/erp/fontes" className="text-gray-400 hover:text-gray-900 bg-white hover:bg-gray-100 p-2 rounded-full shadow-sm transition-all border border-gray-200 mt-1">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div className="flex-1">
          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">{fonte.nome}</h1>
            {fonte.nivel_sigilo === "confidencial" && (
              <span className="flex items-center gap-1 text-[10px] font-black uppercase tracking-widest bg-red-50 text-red-700 border border-red-200 px-3 py-1 rounded-full">
                <Lock className="w-3 h-3" /> Confidencial
              </span>
            )}
          </div>
          {(fonte.cargo || fonte.organizacao) && (
            <p className="text-gray-500 mt-1">{fonte.cargo}{fonte.cargo && fonte.organizacao ? " Â· " : ""}{fonte.organizacao}</p>
          )}
        </div>
        <Link
          href={`/erp/fontes/${id}/editar`}
          className="text-sm font-bold text-indigo-600 hover:text-indigo-700 bg-indigo-50 hover:bg-indigo-100 px-4 py-2 rounded-xl transition-all border border-indigo-200"
        >
          Editar
        </Link>
      </div>

      {/* Contatos */}
      <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm grid grid-cols-1 md:grid-cols-3 gap-4">
        {fonte.email && (
          <div>
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Email</p>
            <a href={`mailto:${fonte.email}`} className="text-sm font-medium text-indigo-600 hover:underline">{fonte.email}</a>
          </div>
        )}
        {fonte.telefone && (
          <div>
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Telefone</p>
            <p className="text-sm font-medium text-gray-700">{fonte.telefone}</p>
          </div>
        )}
        <div>
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Cadastrado por</p>
          <p className="text-sm font-medium text-gray-700">{fonte.criador.nome}</p>
        </div>
        {fonte.notas && (
          <div className="md:col-span-3">
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Notas Gerais</p>
            <p className="text-sm text-gray-600 whitespace-pre-line">{fonte.notas}</p>
          </div>
        )}
      </div>

      {/* Anotações */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-indigo-500" />
            Anotações ({fonte.anotacoes.length})
          </h2>
        </div>

        {/* Formulário Nova Anotação */}
        <form action={saveSourceNote} className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm space-y-4">
          <input type="hidden" name="source_id" value={id} />
          <div>
            <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-1.5">Nova Anotação</label>
            <textarea
              name="conteudo"
              required
              rows={3}
              placeholder="Registre uma observação sobre esta fonte..."
              className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 text-sm focus:ring-2 focus:ring-indigo-500 outline-none transition-all resize-none"
            />
          </div>
          <button
            type="submit"
            className="flex items-center gap-2 bg-indigo-600 text-white font-bold px-4 py-2 rounded-xl hover:bg-indigo-500 transition-all text-sm"
          >
            <Plus className="w-4 h-4" /> Adicionar Anotação
          </button>
        </form>

        {/* Lista de Anotações */}
        {fonte.anotacoes.map((nota) => (
          <div key={nota.id} className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm space-y-2">
            <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-line">{nota.conteudo}</p>
            <div className="flex items-center gap-3 text-[11px] text-gray-400 pt-2 border-t border-gray-50">
              <UserCheck className="w-3 h-3" />
              <span>{nota.autor.nome}</span>
              {nota.article && (
                <>
                  <span>Â·</span>
                  <Link href={`/erp/artigos/${nota.article_id}/edit`} className="text-indigo-500 hover:underline">
                    {nota.article.titulo}
                  </Link>
                </>
              )}
              <span className="ml-auto">{new Date(nota.created_at).toLocaleDateString("pt-BR")}</span>
            </div>
          </div>
        ))}

        {fonte.anotacoes.length === 0 && (
          <p className="text-sm text-gray-400 italic text-center py-8">Nenhuma anotação ainda.</p>
        )}
      </div>
    </div>
  );
}

