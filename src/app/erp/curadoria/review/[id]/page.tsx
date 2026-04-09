import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Globe } from "lucide-react";

import { exigirPermissao } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

import { ReviewForm } from "./components/ReviewForm";

export default async function CuradoriaReviewPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await exigirPermissao("curadoria:aprovar");
  const { id } = await params;

  const item = await prisma.itemRssBruto.findUnique({
    where: { id },
    include: {
      source: true,
      logsReescrita: {
        orderBy: { criadoEm: "desc" },
        take: 1,
      },
    },
  });

  if (!item) notFound();

  const latestLog = item.logsReescrita[0];
  const aiData = (latestLog?.respostaIa as Record<string, unknown> | null) ?? null;
  const categories = await prisma.categoria.findMany({
    select: { id: true, nome: true },
    orderBy: { nome: "asc" },
  });

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20">
      <div className="flex items-center justify-between">
        <Link
          href="/erp/curadoria/dashboard"
          className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-gray-400 transition-colors hover:text-gray-900"
        >
          <ArrowLeft className="h-4 w-4" />
          Voltar ao Dashboard
        </Link>

        <div className="flex items-center gap-3">
          <span
            className={`rounded-full border px-3 py-1 text-[10px] font-black uppercase tracking-widest ${
              item.status === "ai_generated"
                ? "border-emerald-100 bg-emerald-50 text-emerald-600"
                : "border-indigo-100 bg-indigo-50 text-indigo-600"
            }`}
          >
            Status: {item.status.replace("_", " ")}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-10 xl:grid-cols-12">
        <div className="space-y-6 xl:col-span-4">
          <div className="sticky top-8 rounded-[32px] border border-gray-200 bg-gray-50 p-8">
            <h3 className="mb-6 flex items-center gap-2 text-xs font-black uppercase tracking-widest text-gray-400">
              <Globe className="h-4 w-4" />
              Materia Original
            </h3>

            <div className="space-y-4">
              <div className="rounded-2xl border border-gray-200 bg-white p-4">
                <span className="mb-1 block text-[10px] font-black uppercase tracking-widest text-indigo-500">
                  Fonte
                </span>
                <p className="text-sm font-bold text-gray-900">{item.source.name}</p>
              </div>

              <h1 className="text-xl font-black leading-tight text-gray-900">{item.tituloOriginal}</h1>

              <div className="rounded-2xl bg-gray-100/50 p-4 text-sm font-medium italic leading-relaxed text-gray-500">
                {item.description?.replace(/<[^>]*>?/gm, "") || "Sem descricao original."}
              </div>

              <a
                href={item.linkOriginal}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-[11px] font-black uppercase tracking-widest text-indigo-600 hover:underline"
              >
                Abrir link original
                <ArrowLeft className="h-3.5 w-3.5 rotate-180" />
              </a>
            </div>
          </div>
        </div>

        <div className="space-y-8 xl:col-span-8">
          <ReviewForm item={item} aiData={aiData} user={session.user} categories={categories} />
        </div>
      </div>
    </div>
  );
}
