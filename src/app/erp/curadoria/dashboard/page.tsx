import Link from "next/link";
import { ArrowRight, ChevronLeft, ChevronRight, Clock, Filter, Sparkles, X } from "lucide-react";

import { exigirPermissao, temPermissao } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

import { SelectionCard } from "./components/SelectionCard";

export default async function CuradoriaDashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ source?: string; page?: string }>;
}) {
  const session = await exigirPermissao("curadoria:ler");
  const podeAprovar = temPermissao(session, "curadoria:aprovar");
  const { source, page } = await searchParams;
  const currentPage = Math.max(Number.parseInt(page ?? "1", 10) || 1, 1);
  const pageSize = 24;
  const visibleStatuses = ["pending", "selected", "ai_generated"];
  const itemWhere = {
    status: { in: visibleStatuses },
    ...(source ? { sourceId: source } : {}),
  };

  const [pending, selected, aiGenerated, totalItems, sources, categories] = await Promise.all([
    prisma.itemRssBruto.count({ where: { status: "pending" } }),
    prisma.itemRssBruto.count({ where: { status: "selected" } }),
    prisma.itemRssBruto.count({ where: { status: "ai_generated" } }),
    prisma.itemRssBruto.count({ where: itemWhere }),
    prisma.fonteRss.findMany({ select: { id: true, name: true } }),
    prisma.categoria.findMany({
      select: { id: true, nome: true },
      orderBy: { nome: "asc" },
    }),
  ]);
  const totalPages = Math.max(Math.ceil(totalItems / pageSize), 1);
  const safePage = Math.min(currentPage, totalPages);
  const items = await prisma.itemRssBruto.findMany({
    where: itemWhere,
    include: { source: true },
    orderBy: { dataPublicacao: "desc" },
    skip: (safePage - 1) * pageSize,
    take: pageSize,
  });
  const pageHref = (targetPage: number) => {
    const params = new URLSearchParams();
    if (source) params.set("source", source);
    if (targetPage > 1) params.set("page", String(targetPage));
    const query = params.toString();
    return `/erp/curadoria/dashboard${query ? `?${query}` : ""}`;
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div>
        <h1 className="text-3xl font-black uppercase italic tracking-tight text-gray-900">
          Dashboard de Curadoria
        </h1>
        <p className="mt-1 text-sm font-medium text-gray-500">
          Selecione notícias dos portais parceiros para reescrita assistida ou republicação com créditos.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        <div className="flex items-center gap-5 rounded-[32px] border border-gray-200 bg-white p-6 shadow-sm">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gray-100">
            <Clock className="h-6 w-6 text-gray-400" />
          </div>
          <div>
            <span className="block text-[10px] font-black uppercase tracking-widest text-gray-400">Pendentes</span>
            <span className="text-2xl font-black text-gray-900">{pending}</span>
          </div>
        </div>

        <div className="flex items-center gap-5 rounded-[32px] border border-indigo-100 bg-indigo-50 p-6 shadow-sm">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-100">
            <ArrowRight className="h-6 w-6 text-indigo-600" />
          </div>
          <div>
            <span className="block text-[10px] font-black uppercase tracking-widest text-indigo-400">
              Aguardando IA
            </span>
            <span className="text-2xl font-black text-indigo-700">{selected}</span>
          </div>
        </div>

        <div className="flex items-center gap-5 rounded-[32px] border border-emerald-100 bg-emerald-50 p-6 shadow-sm">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-100">
            <Sparkles className="h-6 w-6 text-emerald-600" />
          </div>
          <div>
            <span className="block text-[10px] font-black uppercase tracking-widest text-emerald-400">
              Reescritas
            </span>
            <span className="text-2xl font-black text-emerald-700">{aiGenerated}</span>
          </div>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-4 rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
        <div className="flex items-center gap-2 px-2 text-xs font-black uppercase tracking-widest text-gray-400">
          <Filter className="h-4 w-4" /> Filtros
        </div>
        <Link
          href="/erp/curadoria/dashboard"
          className={`rounded-xl px-4 py-2 text-xs font-bold transition-all ${
            !source ? "bg-gray-900 text-white shadow-lg" : "bg-gray-50 text-gray-400 hover:bg-gray-100"
          }`}
        >
          Todos
        </Link>
        {sources.map((item) => (
          <Link
            key={item.id}
            href={`/erp/curadoria/dashboard?source=${item.id}`}
            className={`rounded-xl px-4 py-2 text-xs font-bold transition-all ${
              source === item.id
                ? "bg-gray-900 text-white shadow-lg"
                : "bg-gray-50 text-gray-400 hover:bg-gray-100"
            }`}
          >
            {item.name}
          </Link>
        ))}
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-black uppercase tracking-tight text-gray-900">
            Matérias RSS
          </h2>
          <p className="mt-1 text-xs font-bold uppercase tracking-widest text-gray-400">
            {totalItems} itens encontrados
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href={pageHref(safePage - 1)}
            aria-disabled={safePage <= 1}
            className={`inline-flex h-10 w-10 items-center justify-center rounded-xl border transition ${
              safePage <= 1
                ? "pointer-events-none border-gray-100 text-gray-200"
                : "border-gray-200 bg-white text-gray-500 hover:border-gray-300 hover:text-gray-900"
            }`}
          >
            <ChevronLeft className="h-4 w-4" />
          </Link>
          <span className="min-w-24 text-center text-xs font-black uppercase tracking-widest text-gray-400">
            {safePage} / {totalPages}
          </span>
          <Link
            href={pageHref(safePage + 1)}
            aria-disabled={safePage >= totalPages}
            className={`inline-flex h-10 w-10 items-center justify-center rounded-xl border transition ${
              safePage >= totalPages
                ? "pointer-events-none border-gray-100 text-gray-200"
                : "border-gray-200 bg-white text-gray-500 hover:border-gray-300 hover:text-gray-900"
            }`}
          >
            <ChevronRight className="h-4 w-4" />
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 2xl:grid-cols-3">
        {items.map((item) => (
          <SelectionCard
            key={item.id}
            item={item}
            categories={categories}
            podeAprovar={podeAprovar}
          />
        ))}

        {items.length === 0 && (
          <div className="rounded-[40px] border-2 border-dashed border-gray-200 bg-white/50 py-32 text-center md:col-span-2 2xl:col-span-3">
            <X className="mx-auto mb-4 h-16 w-16 text-gray-200" />
            <h3 className="text-xl font-black uppercase text-gray-900">Sem materias RSS</h3>
            <p className="mx-auto mt-2 max-w-md font-medium text-gray-500">
              Cadastrar o feed não importa notícias sozinho. Vá em Gerenciar Feeds e clique em Coletar para preencher esta fila.
            </p>
            <Link
              href="/erp/curadoria/fontes"
              className="mt-6 inline-flex items-center gap-2 rounded-xl bg-gray-900 px-4 py-2.5 text-xs font-black uppercase tracking-widest text-white transition hover:bg-black"
            >
              Ir para Gerenciar Feeds
            </Link>
          </div>
        )}
      </div>

      {/* <div className="border-t border-gray-200 pt-12">
        <h2 className="mb-6 text-xl font-black uppercase tracking-tight text-gray-900">
          Recentemente Publicados
        </h2>

        <div className="overflow-hidden rounded-[32px] border border-gray-200 bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="min-w-[760px] text-left">
              <thead className="border-b border-gray-100 bg-gray-50">
                <tr className="text-[10px] font-black uppercase tracking-widest text-gray-400">
                  <th className="px-6 py-4">Materia</th>
                  <th className="px-6 py-4">Fonte</th>
                  <th className="px-6 py-4">Revisor</th>
                  <th className="px-6 py-4">Data</th>
                  <th className="px-6 py-4 text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {publicados.map((artigo) => (
                  <tr key={artigo.id} className="transition-colors hover:bg-gray-50/60">
                    <td className="px-6 py-4">
                      <p className="line-clamp-1 text-sm font-bold text-gray-900">{artigo.titulo}</p>
                      <p className="mt-0.5 text-[10px] font-black uppercase tracking-widest text-indigo-500">
                        {artigo.categoria?.nome}
                      </p>
                    </td>
                    <td className="px-6 py-4 text-xs font-medium text-gray-500">{artigo.autorExterno}</td>
                    <td className="px-6 py-4 text-xs font-medium italic text-gray-500">{artigo.revisorHumano}</td>
                    <td className="px-6 py-4 text-xs font-medium text-gray-400">
                      {artigo.criadoEm.toLocaleDateString("pt-BR")}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <Link
                        href={`/erp/artigos/${artigo.id}`}
                        className="text-xs font-bold uppercase text-indigo-600 underline hover:text-indigo-700"
                      >
                        Editar
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div> */}
    </div>
  );
}
