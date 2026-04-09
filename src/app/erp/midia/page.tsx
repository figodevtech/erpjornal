import Link from "next/link";
import { AlertTriangle, FileText, Film, Image, Plus, Upload } from "lucide-react";

import { exigirAlgumaPermissao, temPermissao } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

function MediaTypeIcon({ tipo }: { tipo: string }) {
  if (tipo === "video") return <Film className="h-6 w-6 text-purple-500" />;
  if (tipo === "document") return <FileText className="h-6 w-6 text-blue-500" />;
  return <Image className="h-6 w-6 text-rose-500" />;
}

function LicenseBadge({ tipoLicenca }: { tipoLicenca: string | null }) {
  const color =
    tipoLicenca === "Livre"
      ? "bg-green-50 text-green-700 border-green-200"
      : tipoLicenca === "Pago"
        ? "bg-amber-50 text-amber-700 border-amber-200"
        : "bg-gray-50 text-gray-500 border-gray-200";
  return (
    <span className={`rounded border px-2 py-0.5 text-[10px] font-bold uppercase tracking-widest ${color}`}>
      {tipoLicenca || "Nao definido"}
    </span>
  );
}

export default async function MidiaPage() {
  const session = await exigirAlgumaPermissao(["midia:ler", "midia:criar", "midia:editar"]);
  const podeCriar = temPermissao(session, "midia:criar");
  const podeEditar = temPermissao(session, "midia:editar");

  const medias = await prisma.midia.findMany({
    orderBy: { criadoEm: "desc" },
  });

  const hoje = new Date();

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-gray-900">Biblioteca de Midia</h1>
          <p className="mt-1 text-sm text-gray-500">
            {medias.length} ativo{medias.length !== 1 ? "s" : ""} cadastrado
            {medias.length !== 1 ? "s" : ""}
          </p>
        </div>
        {podeCriar && (
          <Link
            href="/erp/midia/novo"
            className="flex items-center gap-2 rounded-xl bg-rose-600 px-5 py-2.5 text-sm font-bold text-white shadow-md transition-all hover:bg-rose-500"
          >
            <Plus className="h-4 w-4" />
            Novo Ativo
          </Link>
        )}
      </div>

      {medias.length === 0 ? (
        <div className="rounded-3xl border-2 border-dashed border-gray-200 bg-gray-50/50 py-32 text-center">
          <Upload className="mx-auto mb-4 h-12 w-12 text-gray-300" />
          <h3 className="text-xl font-bold text-gray-400">Nenhuma midia cadastrada</h3>
          <p className="mx-auto mt-2 max-w-sm text-sm text-gray-400">
            Adicione imagens, videos e documentos com metadados de licenca e direitos autorais.
          </p>
          {podeCriar && (
            <Link
              href="/erp/midia/novo"
              className="mt-6 inline-flex items-center gap-2 rounded-xl bg-rose-600 px-5 py-2.5 text-sm font-bold text-white transition-all hover:bg-rose-500"
            >
              <Plus className="h-4 w-4" /> Adicionar primeiro ativo
            </Link>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
          {medias.map((media) => {
            const expirado = media.dataExpiracao && new Date(media.dataExpiracao) < hoje;
            const expiraEmBreve =
              media.dataExpiracao &&
              !expirado &&
              new Date(media.dataExpiracao) < new Date(hoje.getTime() + 30 * 24 * 60 * 60 * 1000);

            return (
              <div
                key={media.id}
                className="group overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm transition-all hover:shadow-md"
              >
                <div className="relative flex h-40 items-center justify-center overflow-hidden bg-gray-100">
                  {media.tipo === "image" && media.url ? (
                    <img
                      src={media.url}
                      alt={media.nome}
                      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  ) : (
                    <MediaTypeIcon tipo={media.tipo} />
                  )}
                  {expirado && (
                    <div className="absolute inset-0 flex items-center justify-center bg-red-900/60">
                      <span className="flex items-center gap-1 text-xs font-black uppercase tracking-widest text-white">
                        <AlertTriangle className="h-4 w-4" /> Licenca Expirada
                      </span>
                    </div>
                  )}
                </div>

                <div className="space-y-3 p-4">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="text-sm font-bold leading-tight text-gray-900">{media.nome}</p>
                      <p className="mt-0.5 text-[10px] font-bold uppercase tracking-wider text-gray-400">
                        {media.tipo}
                      </p>
                    </div>
                    <LicenseBadge tipoLicenca={media.tipoLicenca} />
                  </div>

                  {media.fonte && (
                    <p className="text-xs text-gray-500">
                      <span className="font-bold text-gray-400">Fonte:</span> {media.fonte}
                    </p>
                  )}
                  {media.direitosAutorais && (
                    <p className="text-xs text-gray-500">
                      <span className="font-bold text-gray-400">©</span> {media.direitosAutorais}
                    </p>
                  )}

                  {expiraEmBreve && (
                    <div className="flex items-center gap-1.5 rounded-lg border border-amber-200 bg-amber-50 px-2.5 py-1.5 text-[11px] font-bold text-amber-700">
                      <AlertTriangle className="h-3.5 w-3.5" />
                      Expira em: {new Date(media.dataExpiracao!).toLocaleDateString("pt-BR")}
                    </div>
                  )}

                  <div className="flex items-center justify-between border-t border-gray-100 pt-3">
                    <span className="text-[10px] text-gray-400">
                      {new Date(media.criadoEm).toLocaleDateString("pt-BR")}
                    </span>
                    {podeEditar && (
                      <Link
                        href={`/erp/midia/${media.id}/editar`}
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
