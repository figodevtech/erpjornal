import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Globe, Settings, History } from "lucide-react";

import { exigirPermissao, temPermissao } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import SettingsForm from "./SettingsForm";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function MidiaKitSettingsPage({ params }: Props) {
  const { id } = await params;
  const sessao = await exigirPermissao("midia-kit:editar");
  const podePublicar = temPermissao(sessao, "midia-kit:publicar");

  const kit = await prisma.mediaKit.findUnique({
    where: { id },
    include: { _count: { select: { versoes: true } } },
  });

  if (!kit) notFound();

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Breadcrumb */}
      <div className="flex items-center gap-3">
        <Link
          href="/erp/midia-kit"
          className="flex items-center gap-1.5 text-sm text-gray-500 transition hover:text-gray-900"
        >
          <ArrowLeft className="h-4 w-4" />
          Mídia Kits
        </Link>
        <span className="text-gray-300">/</span>
        <span className="text-sm text-gray-900 font-semibold">{kit.nome}</span>
        <span className="text-gray-300">/</span>
        <span className="text-sm text-gray-500">Configurações</span>
      </div>

      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-rose-50">
            <Settings className="h-5 w-5 text-rose-600" />
          </div>
          <div>
            <h1 className="text-2xl font-extrabold text-gray-900">Configurações</h1>
            <p className="text-sm text-gray-500">{kit.nome}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {kit.status === "PUBLISHED" && (
            <Link
              href={`/midia-kit/${kit.slug}`}
              target="_blank"
              className="flex items-center gap-1.5 rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs font-bold text-emerald-700 transition hover:bg-emerald-100"
            >
              <Globe className="h-3.5 w-3.5" />
              Ver publicado
            </Link>
          )}
          <Link
            href={`/erp/midia-kit/${id}/versions`}
            className="flex items-center gap-1.5 rounded-xl border border-gray-200 px-3 py-2 text-xs font-semibold text-gray-600 transition hover:bg-gray-50"
          >
            <History className="h-3.5 w-3.5" />
            {kit._count.versoes} versão{kit._count.versoes !== 1 ? "ões" : ""}
          </Link>
        </div>
      </div>

      {/* Form */}
      <SettingsForm kit={kit} podePublicar={podePublicar} />
    </div>
  );
}
