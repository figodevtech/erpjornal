"use client";

import { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { KeyRound, Loader2, ShieldCheck, X } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { salvarPermissoesPerfil } from "../actions";

type PerfilItem = {
  id: string;
  nome: string;
  descricao: string | null;
  usuariosCount: number;
  permissaoIds: string[];
};

type PermissaoItem = {
  id: string;
  modulo: string;
  acao: string;
  descricao: string | null;
};

type PermissionsManagerProps = {
  perfis: PerfilItem[];
  permissoes: PermissaoItem[];
};

const moduloLabels: Record<string, string> = {
  artigos: "Artigos",
  revistas: "Revistas",
  categorias: "Categorias",
  entidades: "Entidades",
  fontes: "Fontes",
  curadoria: "Curadoria",
  midia: "Mídia",
  podcasts: "Podcasts",
  portal: "Portal",
  usuarios: "Usuários",
};

const acaoLabels: Record<string, string> = {
  ler: "Visualizar",
  criar: "Criar",
  editar: "Editar",
  publicar: "Publicar",
  aprovar: "Aprovar",
  gerir: "Gerenciar",
  salvar: "Salvar",
  comentar: "Comentar",
};

const ordemModulos = [
  "artigos",
  "revistas",
  "categorias",
  "entidades",
  "fontes",
  "curadoria",
  "midia",
  "podcasts",
  "portal",
  "usuarios",
];

const ordemAcoes = ["ler", "criar", "editar", "publicar", "aprovar", "gerir", "salvar", "comentar"];

function formatarModulo(modulo: string) {
  return moduloLabels[modulo] ?? modulo;
}

function formatarAcao(acao: string) {
  return acaoLabels[acao] ?? acao;
}

function ModalShell({
  open,
  title,
  subtitle,
  onClose,
  children,
}: {
  open: boolean;
  title: string;
  subtitle: string;
  onClose: () => void;
  children: React.ReactNode;
}) {
  useEffect(() => {
    if (!open) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [onClose, open]);

  if (!open || typeof document === "undefined") return null;

  return createPortal(
    <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-gray-950/60 p-4 backdrop-blur-sm">
      <div className="flex max-h-[90vh] w-full max-w-4xl flex-col overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-2xl">
        <div className="relative border-b border-gray-100 p-6">
          <button
            type="button"
            onClick={onClose}
            className="absolute right-4 top-4 rounded-full p-2 text-gray-400 transition hover:bg-gray-100 hover:text-gray-700"
            aria-label="Fechar"
          >
            <X className="h-5 w-5" />
          </button>
          <h2 className="pr-10 text-xl font-black tracking-tight text-gray-900">{title}</h2>
          <p className="mt-1 pr-10 text-sm text-gray-500">{subtitle}</p>
        </div>
        <div className="overflow-y-auto bg-white p-6">{children}</div>
      </div>
    </div>,
    document.body
  );
}

export default function PermissionsManager({ perfis, permissoes }: PermissionsManagerProps) {
  const router = useRouter();
  const [perfilSelecionadoId, setPerfilSelecionadoId] = useState<string | null>(null);
  const [criandoPerfil, setCriandoPerfil] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const perfilSelecionado = useMemo(
    () => perfis.find((perfil) => perfil.id === perfilSelecionadoId) ?? null,
    [perfilSelecionadoId, perfis]
  );

  const modulos = useMemo(() => {
    const agrupado = permissoes
      .filter((permissao) => permissao.modulo !== "politicos")
      .filter((permissao) => !(["categorias", "entidades"].includes(permissao.modulo) && permissao.acao === "gerir"))
      .reduce<Record<string, PermissaoItem[]>>((acc, permissao) => {
        if (!acc[permissao.modulo]) acc[permissao.modulo] = [];
        acc[permissao.modulo].push(permissao);
        return acc;
      }, {});

    return Object.entries(agrupado)
      .sort(([a], [b]) => {
        const ordemA = ordemModulos.indexOf(a);
        const ordemB = ordemModulos.indexOf(b);
        if (ordemA === -1 && ordemB === -1) return a.localeCompare(b);
        if (ordemA === -1) return 1;
        if (ordemB === -1) return -1;
        return ordemA - ordemB;
      })
      .map(([modulo, itens]) => ({
        modulo,
        itens: [...itens].sort((a, b) => {
          const ordemA = ordemAcoes.indexOf(a.acao);
          const ordemB = ordemAcoes.indexOf(b.acao);
          if (ordemA === -1 && ordemB === -1) return a.acao.localeCompare(b.acao);
          if (ordemA === -1) return 1;
          if (ordemB === -1) return -1;
          return ordemA - ordemB;
        }),
      }));
  }, [permissoes]);

  const modalAberto = criandoPerfil || !!perfilSelecionado;

  async function handleSubmit(formData: FormData) {
    setIsSaving(true);
    try {
      await salvarPermissoesPerfil(formData);
      toast.success(criandoPerfil ? "Perfil criado." : "Permissões salvas.");
      setPerfilSelecionadoId(null);
      setCriandoPerfil(false);
      router.refresh();
    } catch (error: unknown) {
      toast.error(error instanceof Error ? error.message : "Não foi possível salvar o perfil.");
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-gray-950">Permissões por perfil</h1>
          <p className="mt-1 text-sm text-gray-600">
            Abra um perfil para ajustar os módulos e ações liberados.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={() => {
              setPerfilSelecionadoId(null);
              setCriandoPerfil(true);
            }}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-bold text-white shadow-sm transition hover:bg-indigo-700"
          >
            <ShieldCheck className="h-4 w-4" />
            Novo perfil
          </button>
          <Link
            href="/erp/usuarios"
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-indigo-200 bg-indigo-50 px-5 py-2.5 text-sm font-bold text-indigo-700 transition hover:bg-indigo-100"
          >
            <ShieldCheck className="h-4 w-4" />
            Voltar para usuários
          </Link>
        </div>
      </div>

      <div className="grid gap-4 xl:grid-cols-2">
        {perfis.map((perfil) => (
          <article key={perfil.id} className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
            <div className="flex items-start gap-3">
              <div className="rounded-xl bg-indigo-50 p-3 text-indigo-700">
                <ShieldCheck className="h-5 w-5" />
              </div>
              <div className="min-w-0 flex-1">
                <h2 className="text-xl font-black text-gray-950">{perfil.nome}</h2>
                <p className="mt-1 text-sm text-gray-500">{perfil.descricao || "Sem descrição"}</p>
              </div>
            </div>

            <div className="mt-4 flex flex-wrap gap-2 text-xs font-bold uppercase tracking-wide">
              <span className="rounded-full bg-indigo-100 px-3 py-1 text-indigo-700">
                {perfil.usuariosCount} usuário(s)
              </span>
              <span className="rounded-full bg-gray-100 px-3 py-1 text-gray-700">
                {perfil.permissaoIds.length} permissão(ões)
              </span>
            </div>

            <div className="mt-5 flex justify-end">
              <button
                type="button"
                onClick={() => {
                  setCriandoPerfil(false);
                  setPerfilSelecionadoId(perfil.id);
                }}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-bold text-white shadow-sm transition hover:bg-indigo-700"
              >
                <KeyRound className="h-4 w-4" />
                Editar permissões
              </button>
            </div>
          </article>
        ))}
      </div>

      <ModalShell
        open={modalAberto}
        onClose={() => {
          if (isSaving) return;
          setPerfilSelecionadoId(null);
          setCriandoPerfil(false);
        }}
        title={criandoPerfil ? "Novo perfil" : perfilSelecionado?.nome || "Editar permissões"}
        subtitle={
          criandoPerfil
            ? "Defina o nome do perfil e escolha os acessos que ele deve receber."
            : "Marque as permissões que esse perfil deve ter no ERP e no portal."
        }
      >
        {(criandoPerfil || perfilSelecionado) && (
          <form
            onSubmit={(event) => {
              event.preventDefault();
              const formData = new FormData(event.currentTarget);
              void handleSubmit(formData);
            }}
            className="space-y-5"
          >
            {perfilSelecionado && <input type="hidden" name="perfilId" value={perfilSelecionado.id} />}

            {criandoPerfil && (
              <div>
                <label className="mb-1.5 block text-xs font-bold uppercase tracking-widest text-gray-500">Nome do perfil</label>
                <input
                  name="nome"
                  placeholder="Ex: gestor_conteudo ou comercial_portal"
                  required
                  className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-950 outline-none transition focus:bg-white focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            )}

            <div>
              <label className="mb-1.5 block text-xs font-bold uppercase tracking-widest text-gray-500">Descrição</label>
              <input
                name="descricao"
                defaultValue={perfilSelecionado?.descricao ?? ""}
                className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-950 outline-none transition focus:bg-white focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div className="grid gap-4 lg:grid-cols-2">
              {modulos.map(({ modulo, itens }) => (
                <section key={`${perfilSelecionado?.id ?? "novo"}-${modulo}`} className="rounded-2xl border border-gray-200 bg-gray-50 p-4">
                  <div className="mb-3 flex items-center gap-2">
                    <KeyRound className="h-4 w-4 text-indigo-700" />
                    <h3 className="text-sm font-black uppercase tracking-wide text-gray-900">{formatarModulo(modulo)}</h3>
                  </div>

                  <div className="space-y-2">
                    {itens.map((permissao) => (
                      <label
                        key={`${perfilSelecionado?.id ?? "novo"}-${permissao.id}`}
                        className="flex items-start gap-3 rounded-xl border border-gray-200 bg-white px-3 py-3 text-sm text-gray-800"
                      >
                        <input
                          type="checkbox"
                          name="permissoes"
                          value={permissao.id}
                          defaultChecked={perfilSelecionado?.permissaoIds.includes(permissao.id) ?? false}
                          className="mt-0.5 h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                        />
                        <span>
                          <span className="block font-bold text-gray-950">{formatarAcao(permissao.acao)}</span>
                          <span className="block text-xs text-gray-500">
                            {permissao.descricao || `${formatarModulo(permissao.modulo)}: ${formatarAcao(permissao.acao)}`}
                          </span>
                        </span>
                      </label>
                    ))}
                  </div>
                </section>
              ))}
            </div>

            <div className="flex flex-col gap-3 border-t border-gray-100 pt-5 sm:flex-row sm:items-center sm:justify-end">
              <button
                type="button"
                onClick={() => {
                  setPerfilSelecionadoId(null);
                  setCriandoPerfil(false);
                }}
                disabled={isSaving}
                className="inline-flex items-center justify-center rounded-xl border border-gray-200 px-5 py-3 text-sm font-bold text-gray-600 transition hover:bg-gray-50 disabled:opacity-50"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={isSaving}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-5 py-3 text-sm font-bold text-white transition hover:bg-indigo-700 disabled:opacity-50"
              >
                {isSaving && <Loader2 className="h-4 w-4 animate-spin" />}
                {isSaving ? "Salvando..." : criandoPerfil ? "Criar perfil" : "Salvar permissões"}
              </button>
            </div>
          </form>
        )}
      </ModalShell>
    </div>
  );
}
