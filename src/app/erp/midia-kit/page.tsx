import Link from "next/link";
import { LayoutTemplate, Globe, FileEdit, Archive } from "lucide-react";

import { exigirPermissao, temPermissao } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { MediaKitStatus } from "@prisma/client";
import { MediaKitTheme } from "@/types/media-kit";
import NovoMediaKitDialog from "./components/NovoMediaKitDialog";

const statusConfig: Record<MediaKitStatus, { label: string; className: string }> = {
  DRAFT: { label: "Rascunho", className: "bg-amber-50 text-amber-700 border-amber-200" },
  PUBLISHED: { label: "Publicado", className: "bg-emerald-50 text-emerald-700 border-emerald-200" },
  ARCHIVED: { label: "Arquivado", className: "bg-gray-100 text-gray-500 border-gray-200" },
};

const statusIcon: Record<MediaKitStatus, React.ReactNode> = {
  DRAFT: <FileEdit className="h-3 w-3" />,
  PUBLISHED: <Globe className="h-3 w-3" />,
  ARCHIVED: <Archive className="h-3 w-3" />,
};

export default async function MidiaKitPage() {
  const sessao = await exigirPermissao("midia-kit:ler");
  const podeCriar = temPermissao(sessao, "midia-kit:criar");
  const podeEditar = temPermissao(sessao, "midia-kit:editar");

  const kits = await prisma.mediaKit.findMany({
    orderBy: { atualizadoEm: "desc" },
    include: {
      _count: { select: { secoes: true, versoes: true } },
    },
  });

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-gray-900">Mídia Kit</h1>
          <p className="mt-1 text-sm text-gray-500">
            {kits.length} kit{kits.length !== 1 ? "s" : ""} cadastrado{kits.length !== 1 ? "s" : ""}
          </p>
        </div>
        {podeCriar && <NovoMediaKitDialog />}
      </div>

      {kits.length === 0 ? (
        <div className="rounded-3xl border-2 border-dashed border-gray-200 bg-gray-50/50 py-32 text-center">
          <LayoutTemplate className="mx-auto mb-4 h-12 w-12 text-gray-300" />
          <h3 className="text-xl font-bold text-gray-400">Nenhum mídia kit criado</h3>
          <p className="mx-auto mt-2 max-w-sm text-sm text-gray-400">
            Crie kits comerciais dinâmicos com seções, banners, métricas e identidade visual.
          </p>
          {podeCriar && <NovoMediaKitDialog emptyState />}
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
          {kits.map((kit) => {
            const cfg = statusConfig[kit.status];
            return (
              <div
                key={kit.id}
                className="group flex flex-col overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm transition-all hover:shadow-md"
              >
                {/* Header colorido baseado no tema */}
                <div
                  className="flex h-24 items-center justify-center"
                  style={{
                    backgroundColor:
                      (kit.tema as unknown as MediaKitTheme)?.primaryColor ?? "#0f172a",
                  }}
                >
                  <LayoutTemplate className="h-10 w-10 text-white/60" />
                </div>

                <div className="flex flex-1 flex-col gap-3 p-4">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="text-sm font-bold leading-tight text-gray-900">{kit.nome}</p>
                      <p className="mt-0.5 text-[11px] text-gray-400">/{kit.slug}</p>
                    </div>
                    <span
                      className={`flex items-center gap-1 rounded border px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${cfg.className}`}
                    >
                      {statusIcon[kit.status]}
                      {cfg.label}
                    </span>
                  </div>

                  <div className="flex gap-4 text-[11px] text-gray-400">
                    <span>{kit._count.secoes} seção{kit._count.secoes !== 1 ? "ões" : ""}</span>
                    <span>{kit._count.versoes} versão{kit._count.versoes !== 1 ? "ões" : ""}</span>
                  </div>

                  {kit.publicadoEm && (
                    <p className="text-[11px] text-gray-400">
                      Publicado em {new Date(kit.publicadoEm).toLocaleDateString("pt-BR")}
                    </p>
                  )}

                  <div className="mt-auto flex items-center justify-between border-t border-gray-100 pt-3">
                    <span className="text-[10px] text-gray-400">
                      Atualizado {new Date(kit.atualizadoEm).toLocaleDateString("pt-BR")}
                    </span>
                    {podeEditar && (
                      <Link
                        href={`/erp/midia-kit/${kit.id}/editor`}
                        className="text-xs font-bold text-rose-600 transition-colors hover:text-rose-700"
                      >
                        Editar
                      </Link>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
