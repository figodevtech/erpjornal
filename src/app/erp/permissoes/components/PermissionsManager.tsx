"use client";

import { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { KeyRound, Loader2, ShieldCheck, X } from "lucide-react";
import Link from "next/link";
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
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!open) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [onClose, open]);

  if (!mounted || !open) return null;

  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/70 p-4 backdrop-blur-md">
      <div className="flex max-h-[90vh] w-full max-w-4xl flex-col overflow-hidden rounded-[36px] border border-gray-100 bg-white shadow-2xl">
        <div className="relative bg-slate-900 p-7 text-white">
          <button
            type="button"
            onClick={onClose}
            className="absolute right-5 top-5 rounded-full p-2 text-white/50 transition hover:bg-white/10 hover:text-white"
          >
            <X className="h-5 w-5" />
          </button>
          <h2 className="text-xl font-black tracking-tight">{title}</h2>
          <p className="mt-1 text-sm text-slate-300">{subtitle}</p>
        </div>
        <div className="overflow-y-auto bg-white p-7">{children}</div>
      </div>
    </div>,
    document.body
  );
}

export default function PermissionsManager({ perfis, permissoes }: PermissionsManagerProps) {
  const [perfilSelecionadoId, setPerfilSelecionadoId] = useState<string | null>(null);
  const [criandoPerfil, setCriandoPerfil] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const perfilSelecionado = useMemo(
    () => perfis.find((perfil) => perfil.id === perfilSelecionadoId) ?? null,
    [perfilSelecionadoId, perfis]
  );

  const permissoesPorModulo = useMemo(
    () =>
      permissoes.reduce<Record<string, PermissaoItem[]>>((acc, permissao) => {
        if (!acc[permissao.modulo]) acc[permissao.modulo] = [];
        acc[permissao.modulo].push(permissao);
        return acc;
      }, {}),
    [permissoes]
  );

  const modalAberto = criandoPerfil || !!perfilSelecionado;

  async function handleSubmit(formData: FormData) {
    setIsSaving(true);
    try {
      await salvarPermissoesPerfil(formData);
      toast.success(criandoPerfil ? "Perfil criado." : "Permissoes salvas.");
      setPerfilSelecionadoId(null);
      setCriandoPerfil(false);
    } catch (error: any) {
      toast.error(error?.message || "Nao foi possivel salvar o perfil.");
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-gray-950">Permissoes por perfil</h1>
          <p className="mt-1 text-sm text-gray-600">
            Abra um perfil para ajustar os modulos e acoes liberados.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={() => {
              setPerfilSelecionadoId(null);
              setCriandoPerfil(true);
            }}
            className="inline-flex items-center gap-2 rounded-xl bg-gray-950 px-4 py-2.5 text-sm font-bold text-white transition-colors hover:bg-black"
          >
            <ShieldCheck className="h-4 w-4" />
            Novo perfil
          </button>
          <Link
            href="/erp/usuarios"
            className="inline-flex items-center gap-2 rounded-xl border border-indigo-200 bg-indigo-50 px-4 py-2.5 text-sm font-bold text-indigo-700 transition-colors hover:bg-indigo-100"
          >
            <ShieldCheck className="h-4 w-4" />
            Voltar para usuarios
          </Link>
        </div>
      </div>

      <div className="grid gap-4 xl:grid-cols-2">
        {perfis.map((perfil) => (
          <article key={perfil.id} className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
            <div className="flex items-start gap-3">
              <div className="rounded-2xl bg-red-50 p-3 text-red-700">
                <ShieldCheck className="h-5 w-5" />
              </div>
              <div className="min-w-0 flex-1">
                <h2 className="text-xl font-black text-gray-950">{perfil.nome}</h2>
                <p className="mt-1 text-sm text-gray-500">{perfil.descricao || "Sem descricao"}</p>
              </div>
            </div>

            <div className="mt-4 flex flex-wrap gap-2 text-xs font-bold uppercase tracking-wide">
              <span className="rounded-full bg-indigo-100 px-3 py-1 text-indigo-700">
                {perfil.usuariosCount} usuario(s)
              </span>
              <span className="rounded-full bg-red-50 px-3 py-1 text-red-700">
                {perfil.permissaoIds.length} permissao(oes)
              </span>
            </div>

            <div className="mt-5 flex justify-end">
              <button
                type="button"
                onClick={() => {
                  setCriandoPerfil(false);
                  setPerfilSelecionadoId(perfil.id);
                }}
                className="rounded-2xl bg-gray-950 px-5 py-2.5 text-sm font-black text-white transition hover:bg-black"
              >
                Editar permissoes
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
        title={criandoPerfil ? "Novo perfil" : perfilSelecionado?.nome || "Editar perfil"}
        subtitle={
          criandoPerfil
            ? "Defina o nome do perfil e escolha os acessos que ele deve receber."
            : "Marque as permissoes que esse perfil deve ter no ERP e no portal."
        }
      >
        {(criandoPerfil || perfilSelecionado) && (
          <form
            onSubmit={(event) => {
              event.preventDefault();
              const formData = new FormData(event.currentTarget);
              void handleSubmit(formData);
            }}
            className="space-y-6"
          >
            {perfilSelecionado && <input type="hidden" name="perfilId" value={perfilSelecionado.id} />}

            {criandoPerfil && (
              <div>
                <label className="mb-1.5 block text-sm font-bold text-gray-800">Nome do perfil</label>
                <input
                  name="nome"
                  placeholder="Ex: gestor_conteudo ou comercial_portal"
                  required
                  className="w-full rounded-xl border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-950 outline-none transition focus:border-red-500 focus:ring-2 focus:ring-red-100"
                />
              </div>
            )}

            <div>
              <label className="mb-1.5 block text-sm font-bold text-gray-800">Descricao</label>
              <input
                name="descricao"
                defaultValue={perfilSelecionado?.descricao ?? ""}
                className="w-full rounded-xl border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-950 outline-none transition focus:border-red-500 focus:ring-2 focus:ring-red-100"
              />
            </div>

            <div className="grid gap-4 lg:grid-cols-2">
              {Object.entries(permissoesPorModulo).map(([modulo, itens]) => (
                <div key={`${perfilSelecionado?.id ?? "novo"}-${modulo}`} className="rounded-2xl border border-gray-200 bg-gray-50 p-4">
                  <div className="mb-3 flex items-center gap-2">
                    <KeyRound className="h-4 w-4 text-red-700" />
                    <h3 className="text-sm font-black uppercase tracking-wide text-gray-900">{modulo}</h3>
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
                          className="mt-0.5 h-4 w-4 rounded border-gray-300 text-red-600 focus:ring-red-500"
                        />
                        <span>
                          <span className="block font-bold text-gray-950">{permissao.acao}</span>
                          <span className="block text-xs text-gray-500">
                            {permissao.descricao || `${permissao.modulo}:${permissao.acao}`}
                          </span>
                        </span>
                      </label>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            <div className="flex justify-end">
              <button
                type="submit"
                disabled={isSaving}
                className="rounded-2xl bg-gray-950 px-5 py-3 text-sm font-black text-white transition hover:bg-black"
              >
                <span className="inline-flex items-center gap-2">
                  {isSaving && <Loader2 className="h-4 w-4 animate-spin" />}
                  {isSaving ? "Salvando..." : criandoPerfil ? "Criar perfil" : "Salvar permissoes"}
                </span>
              </button>
            </div>
          </form>
        )}
      </ModalShell>
    </div>
  );
}
