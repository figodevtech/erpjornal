import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Globe, Settings, Blocks } from "lucide-react";

import { exigirPermissao } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { toMediaKitSectionWithData } from "../../section-mappers";
import BlockEditorManager from "./components/BlockEditorManager";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function MidiaKitEditorPage({ params }: Props) {
  const { id } = await params;
  await exigirPermissao("midia-kit:editar");

  const kit = await prisma.mediaKit.findUnique({
    where: { id },
    include: {
      secoes: {
        orderBy: { ordem: "asc" },
      },
    },
  });

  if (!kit) notFound();

  // Convert Json/string database fields to strong typing for the client.
  const sections = kit.secoes.map(toMediaKitSectionWithData);

  return (
    <div className="flex h-[calc(100vh-4rem)] flex-col bg-gray-50 animate-in fade-in duration-500 overflow-hidden">
      {/* Editor Header */}
      <header className="flex h-16 shrink-0 items-center justify-between border-b border-gray-200 bg-white px-6 shadow-sm z-10">
        <div className="flex items-center gap-4">
          <Link
            href="/erp/midia-kit"
            className="flex h-8 w-8 items-center justify-center rounded-lg text-gray-400 hover:bg-gray-100 hover:text-gray-900"
          >
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div className="h-6 w-px bg-gray-200" />
          <div className="flex items-center gap-2">
            <Blocks className="h-5 w-5 text-rose-500" />
            <h1 className="text-lg font-bold text-gray-900">
              {kit.nome}
            </h1>
            <span className="ml-2 rounded bg-gray-100 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-gray-500">
              {kit.status === "PUBLISHED" ? "Publicado" : "Rascunho"}
            </span>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <Link
            href={`/erp/midia-kit/${kit.id}/settings`}
            className="flex items-center gap-2 rounded-xl border border-gray-200 px-4 py-2 text-sm font-semibold text-gray-700 transition hover:bg-gray-50"
          >
            <Settings className="h-4 w-4" />
            Configurações
          </Link>
          {kit.status === "PUBLISHED" && (
            <Link
              href={`/midia-kit/${kit.slug}`}
              target="_blank"
              className="flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2 text-sm font-bold text-white transition hover:bg-emerald-500"
            >
              <Globe className="h-4 w-4" />
              Ver Portal
            </Link>
          )}
        </div>
      </header>

      {/* Editor Area */}
      <div className="flex-1 overflow-hidden">
        <BlockEditorManager mediaKitId={kit.id} initialSections={sections} />
      </div>
    </div>
  );
}
