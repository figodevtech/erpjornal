import { prisma } from "@/lib/prisma";
import { exigirPermissao } from "@/lib/auth";
import PermissionsManager from "./components/PermissionsManager";

interface PageProps {
  searchParams: Promise<{ sucesso?: string; erro?: string }>;
}

export default async function PermissoesErpPage({ searchParams }: PageProps) {
  await exigirPermissao("usuarios:gerir");

  const params = await searchParams;
  const [perfis, permissoes] = await Promise.all([
    prisma.perfil.findMany({
      orderBy: { nome: "asc" },
      include: {
        permissoes: true,
        _count: {
          select: {
            usuarios: true,
          },
        },
      },
    }),
    prisma.permissao.findMany({
      orderBy: [{ modulo: "asc" }, { acao: "asc" }],
    }),
  ]);

  return (
    <div className="space-y-6">
      {params.sucesso && (
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-800">
          PermissÃµes salvas com sucesso.
        </div>
      )}

      {params.erro && (
        <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
          {params.erro}
        </div>
      )}

      <PermissionsManager
        perfis={perfis.map((perfil) => ({
          id: perfil.id,
          nome: perfil.nome,
          descricao: perfil.descricao,
          usuariosCount: perfil._count.usuarios,
          permissaoIds: perfil.permissoes.map(({ permissaoId }) => permissaoId),
        }))}
        permissoes={permissoes.map((permissao) => ({
          id: permissao.id,
          modulo: permissao.modulo,
          acao: permissao.acao,
          descricao: permissao.descricao,
        }))}
      />
    </div>
  );
}

