import { prisma } from "@/lib/prisma";
import { exigirPermissao } from "@/lib/auth";
import UserAccessManager from "./components/UserAccessManager";

interface PageProps {
  searchParams: Promise<{ sucesso?: string; erro?: string }>;
}

export default async function UsuariosErpPage({ searchParams }: PageProps) {
  await exigirPermissao("usuarios:gerir");

  const params = await searchParams;
  const [usuarios, perfis] = await Promise.all([
    prisma.usuario.findMany({
      orderBy: { criadoEm: "desc" },
      include: {
        perfis: {
          include: {
            perfil: true,
          },
        },
        _count: {
          select: {
            artigosAutor: true,
          },
        },
      },
    }),
    prisma.perfil.findMany({
      orderBy: { nome: "asc" },
      include: {
        _count: {
          select: {
            usuarios: true,
          },
        },
      },
    }),
  ]);

  return (
    <div className="space-y-6">
      {params.sucesso && (
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-800">
          {params.sucesso === "usuario-criado"
            ? "Usuario criado com sucesso."
            : "Usuario atualizado com sucesso."}
        </div>
      )}

      {params.erro && (
        <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
          {params.erro}
        </div>
      )}

      <UserAccessManager
        usuarios={usuarios.map((usuario) => ({
          id: usuario.id,
          nome: usuario.nome,
          email: usuario.email,
          tipoConta: usuario.tipoConta,
          status: usuario.status,
          artigosAutorCount: usuario._count.artigosAutor,
          perfilIds: usuario.perfis.map(({ perfilId }) => perfilId),
          perfilNomes: usuario.perfis.map(({ perfil }) => perfil.nome),
        }))}
        perfis={perfis.map((perfil) => ({
          id: perfil.id,
          nome: perfil.nome,
          descricao: perfil.descricao,
          usuariosCount: perfil._count.usuarios,
        }))}
      />
    </div>
  );
}

