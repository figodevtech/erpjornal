import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { Image, Plus, Film, FileText, AlertTriangle, Upload } from "lucide-react";

function MediaTypeIcon({ tipo }: { tipo: string }) {
  if (tipo === "video") return <Film className="w-6 h-6 text-purple-500" />;
  if (tipo === "document") return <FileText className="w-6 h-6 text-blue-500" />;
  return <Image className="w-6 h-6 text-rose-500" />;
}

function LicenseBadge({ tipo_licenca }: { tipo_licenca: string | null }) {
  const color = tipo_licenca === "Livre"
    ? "bg-green-50 text-green-700 border-green-200"
    : tipo_licenca === "Pago"
    ? "bg-amber-50 text-amber-700 border-amber-200"
    : "bg-slate-50 text-slate-500 border-slate-200";
  return (
    <span className={`text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded border ${color}`}>
      {tipo_licenca || "Não definido"}
    </span>
  );
}

export default async function MidiaPage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/api/auth/signin");

  const medias = await prisma.media.findMany({
    orderBy: { created_at: "desc" },
  });

  const hoje = new Date();

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Biblioteca de Mídia</h1>
          <p className="text-sm text-slate-500 mt-1">
            {medias.length} ativo{medias.length !== 1 ? "s" : ""} cadastrado{medias.length !== 1 ? "s" : ""}
          </p>
        </div>
        <Link
          href="/erp/midia/novo"
          className="flex items-center gap-2 bg-rose-600 text-white font-bold px-5 py-2.5 rounded-xl hover:bg-rose-500 transition-all shadow-md hover:shadow-lg hover:-translate-y-0.5 text-sm"
        >
          <Plus className="w-4 h-4" />
          Novo Ativo
        </Link>
      </div>

      {/* Grid */}
      {medias.length === 0 ? (
        <div className="py-32 text-center rounded-3xl border-2 border-dashed border-slate-200 bg-slate-50/50">
          <Upload className="w-12 h-12 text-slate-300 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-slate-400">Nenhuma mídia cadastrada</h3>
          <p className="text-slate-400 max-w-sm mx-auto mt-2 text-sm">
            Adicione imagens, vídeos e documentos com metadados de licença e direitos autorais.
          </p>
          <Link
            href="/erp/midia/novo"
            className="inline-flex items-center gap-2 mt-6 bg-rose-600 text-white font-bold px-5 py-2.5 rounded-xl hover:bg-rose-500 transition-all text-sm"
          >
            <Plus className="w-4 h-4" /> Adicionar primeiro ativo
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {medias.map((media) => {
            const expirado = media.data_expiracao && new Date(media.data_expiracao) < hoje;
            const expiraEmBreve = media.data_expiracao && !expirado &&
              new Date(media.data_expiracao) < new Date(hoje.getTime() + 30 * 24 * 60 * 60 * 1000);

            return (
              <div
                key={media.id}
                className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-all group"
              >
                {/* Preview */}
                <div className="h-40 bg-slate-100 flex items-center justify-center relative overflow-hidden">
                  {media.tipo === "image" && media.url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={media.url}
                      alt={media.nome}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  ) : (
                    <MediaTypeIcon tipo={media.tipo} />
                  )}
                  {expirado && (
                    <div className="absolute inset-0 bg-red-900/60 flex items-center justify-center">
                      <span className="text-white font-black text-xs uppercase tracking-widest flex items-center gap-1">
                        <AlertTriangle className="w-4 h-4" /> Licença Expirada
                      </span>
                    </div>
                  )}
                </div>

                {/* Info */}
                <div className="p-4 space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="font-bold text-slate-900 text-sm leading-tight">{media.nome}</p>
                      <p className="text-[10px] text-slate-400 uppercase font-bold tracking-wider mt-0.5">{media.tipo}</p>
                    </div>
                    <LicenseBadge tipo_licenca={media.tipo_licenca} />
                  </div>

                  {media.fonte && (
                    <p className="text-xs text-slate-500">
                      <span className="font-bold text-slate-400">Fonte:</span> {media.fonte}
                    </p>
                  )}
                  {media.direitos_autorais && (
                    <p className="text-xs text-slate-500">
                      <span className="font-bold text-slate-400">© </span> {media.direitos_autorais}
                    </p>
                  )}

                  {(expiraEmBreve) && (
                    <div className="flex items-center gap-1.5 bg-amber-50 text-amber-700 text-[11px] font-bold px-2.5 py-1.5 rounded-lg border border-amber-200">
                      <AlertTriangle className="w-3.5 h-3.5" />
                      Expira em: {new Date(media.data_expiracao!).toLocaleDateString("pt-BR")}
                    </div>
                  )}

                  <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                    <span className="text-[10px] text-slate-400">
                      {new Date(media.created_at).toLocaleDateString("pt-BR")}
                    </span>
                    <Link
                      href={`/erp/midia/${media.id}/editar`}
                      className="text-xs font-bold text-rose-600 hover:text-rose-700 transition-colors"
                    >
                      Editar
                    </Link>
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
