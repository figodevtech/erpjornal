"use client";

import { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { Loader2, Plus, Shield, UserCog, Users, X } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";

import { atualizarUsuarioErp, criarUsuarioErp } from "../actions";

type PerfilItem = {
  id: string;
  nome: string;
  descricao: string | null;
  usuariosCount: number;
};

type UsuarioItem = {
  id: string;
  nome: string | null;
  email: string | null;
  tipoConta: string;
  status: string;
  artigosAutorCount: number;
  perfilIds: string[];
  perfilNomes: string[];
};

type UserAccessManagerProps = {
  usuarios: UsuarioItem[];
  perfis: PerfilItem[];
};

const opcoesTipoConta = [
  { value: "portal", label: "Portal" },
  { value: "erp", label: "ERP" },
  { value: "misto", label: "Misto" },
];

const opcoesStatus = [
  { value: "ativo", label: "Ativo" },
  { value: "inativo", label: "Inativo" },
  { value: "bloqueado", label: "Bloqueado" },
];

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
      <div className="flex max-h-[90vh] w-full max-w-3xl flex-col overflow-hidden rounded-[36px] border border-gray-100 bg-white shadow-2xl">
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

function PerfilCheckboxes({
  perfis,
  selectedIds,
}: {
  perfis: PerfilItem[];
  selectedIds?: string[];
}) {
  const selected = new Set(selectedIds ?? []);

  return (
    <div>
      <span className="mb-2 block text-sm font-bold text-gray-800">Perfis</span>
      <div className="grid gap-2 md:grid-cols-2">
        {perfis.map((perfil) => (
          <label
            key={perfil.id}
            className="flex items-start gap-3 rounded-xl border border-gray-200 bg-gray-50 px-3 py-3 text-sm text-gray-800"
          >
            <input
              type="checkbox"
              name="perfis"
              value={perfil.id}
              defaultChecked={selected.has(perfil.id)}
              className="mt-0.5 h-4 w-4 rounded border-gray-300 text-red-600 focus:ring-red-500"
            />
            <span>
              <span className="block font-bold text-gray-950">{perfil.nome}</span>
              <span className="block text-xs text-gray-500">
                {perfil.descricao || "Sem descricao"} · {perfil.usuariosCount} usuario(s)
              </span>
            </span>
          </label>
        ))}
      </div>
    </div>
  );
}

export default function UserAccessManager({ usuarios, perfis }: UserAccessManagerProps) {
  const [dialogCriacaoAberto, setDialogCriacaoAberto] = useState(false);
  const [usuarioSelecionadoId, setUsuarioSelecionadoId] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  const usuarioSelecionado = useMemo(
    () => usuarios.find((usuario) => usuario.id === usuarioSelecionadoId) ?? null,
    [usuarioSelecionadoId, usuarios]
  );

  async function handleCreate(formData: FormData) {
    setIsCreating(true);
    try {
      await criarUsuarioErp(formData);
      toast.success("Usuario criado.");
      setDialogCriacaoAberto(false);
    } catch (error: any) {
      toast.error(error?.message || "Nao foi possivel criar o usuario.");
    } finally {
      setIsCreating(false);
    }
  }

  async function handleUpdate(formData: FormData) {
    setIsUpdating(true);
    try {
      await atualizarUsuarioErp(formData);
      toast.success("Usuario atualizado.");
      setUsuarioSelecionadoId(null);
    } catch (error: any) {
      toast.error(error?.message || "Nao foi possivel atualizar o usuario.");
    } finally {
      setIsUpdating(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-gray-950">Usuarios e Acessos</h1>
          <p className="mt-1 text-sm text-gray-600">
            Gerencie contas internas e os perfis liberados para cada pessoa.
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <Link
            href="/erp/permissoes"
            className="inline-flex items-center gap-2 rounded-xl border border-indigo-200 bg-indigo-50 px-4 py-2.5 text-sm font-bold text-indigo-700 transition-colors hover:bg-indigo-100"
          >
            <Shield className="h-4 w-4" />
            Editar permissoes
          </Link>
          <button
            type="button"
            onClick={() => setDialogCriacaoAberto(true)}
            className="inline-flex items-center gap-2 rounded-xl bg-red-700 px-4 py-2.5 text-sm font-black text-white transition hover:bg-red-800"
          >
            <Plus className="h-4 w-4" />
            Novo usuario
          </button>
        </div>
      </div>

      <div className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="rounded-2xl bg-indigo-50 p-3 text-indigo-700">
            <Users className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-xl font-black text-gray-950">Equipe cadastrada</h2>
            <p className="text-sm text-gray-500">
              {usuarios.length} usuario(s) com acesso mapeado no sistema.
            </p>
          </div>
        </div>
      </div>

      {usuarios.length === 0 ? (
        <div className="rounded-3xl border-2 border-dashed border-gray-200 bg-white px-6 py-16 text-center text-gray-500">
          Nenhum usuario cadastrado ainda.
        </div>
      ) : (
        <div className="grid gap-4 xl:grid-cols-2">
          {usuarios.map((usuario) => (
            <article key={usuario.id} className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
              <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                <div>
                  <h3 className="text-lg font-black text-gray-950">{usuario.nome || "Sem nome"}</h3>
                  <p className="text-sm text-gray-500">{usuario.email || "Sem e-mail"}</p>
                </div>
                <div className="flex flex-wrap gap-2 text-xs font-bold uppercase tracking-wide">
                  <span className="rounded-full bg-gray-100 px-3 py-1 text-gray-700">{usuario.tipoConta}</span>
                  <span
                    className={`rounded-full px-3 py-1 ${
                      usuario.status === "ativo"
                        ? "bg-emerald-100 text-emerald-700"
                        : usuario.status === "bloqueado"
                          ? "bg-red-100 text-red-700"
                          : "bg-amber-100 text-amber-700"
                    }`}
                  >
                    {usuario.status}
                  </span>
                  <span className="rounded-full bg-indigo-100 px-3 py-1 text-indigo-700">
                    {usuario.artigosAutorCount} artigo(s)
                  </span>
                </div>
              </div>

              <div className="mt-4">
                <p className="mb-2 text-xs font-black uppercase tracking-widest text-gray-500">Perfis atuais</p>
                <div className="flex flex-wrap gap-2">
                  {usuario.perfilNomes.length > 0 ? (
                    usuario.perfilNomes.map((perfilNome) => (
                      <span
                        key={`${usuario.id}-${perfilNome}`}
                        className="rounded-full bg-red-50 px-3 py-1 text-xs font-bold text-red-700"
                      >
                        {perfilNome}
                      </span>
                    ))
                  ) : (
                    <span className="text-sm text-gray-400">Nenhum perfil vinculado.</span>
                  )}
                </div>
              </div>

              <div className="mt-5 flex justify-end">
                <button
                  type="button"
                  onClick={() => setUsuarioSelecionadoId(usuario.id)}
                  className="inline-flex items-center gap-2 rounded-2xl bg-gray-950 px-5 py-2.5 text-sm font-black text-white transition hover:bg-black"
                >
                  <UserCog className="h-4 w-4" />
                  Editar acesso
                </button>
              </div>
            </article>
          ))}
        </div>
      )}

      <ModalShell
        open={dialogCriacaoAberto}
        onClose={() => {
          if (isCreating) return;
          setDialogCriacaoAberto(false);
        }}
        title="Novo usuario"
        subtitle="Cria o login no Supabase Auth e ja vincula o acesso interno."
      >
        <form
          onSubmit={(event) => {
            event.preventDefault();
            const formData = new FormData(event.currentTarget);
            void handleCreate(formData);
          }}
          className="space-y-4"
        >
          <div>
            <label htmlFor="nome" className="mb-1.5 block text-sm font-bold text-gray-800">
              Nome
            </label>
            <input
              id="nome"
              name="nome"
              required
              className="w-full rounded-xl border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-950 outline-none transition focus:border-red-500 focus:ring-2 focus:ring-red-100"
            />
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label htmlFor="email" className="mb-1.5 block text-sm font-bold text-gray-800">
                E-mail
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                className="w-full rounded-xl border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-950 outline-none transition focus:border-red-500 focus:ring-2 focus:ring-red-100"
              />
            </div>

            <div>
              <label htmlFor="senha" className="mb-1.5 block text-sm font-bold text-gray-800">
                Senha inicial
              </label>
              <input
                id="senha"
                name="senha"
                type="password"
                minLength={8}
                required
                className="w-full rounded-xl border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-950 outline-none transition focus:border-red-500 focus:ring-2 focus:ring-red-100"
              />
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label htmlFor="tipoConta" className="mb-1.5 block text-sm font-bold text-gray-800">
                Tipo de conta
              </label>
              <select
                id="tipoConta"
                name="tipoConta"
                defaultValue="erp"
                className="w-full rounded-xl border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-950 outline-none transition focus:border-red-500 focus:ring-2 focus:ring-red-100"
              >
                {opcoesTipoConta.map((opcao) => (
                  <option key={opcao.value} value={opcao.value}>
                    {opcao.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="status" className="mb-1.5 block text-sm font-bold text-gray-800">
                Status
              </label>
              <select
                id="status"
                name="status"
                defaultValue="ativo"
                className="w-full rounded-xl border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-950 outline-none transition focus:border-red-500 focus:ring-2 focus:ring-red-100"
              >
                {opcoesStatus.map((opcao) => (
                  <option key={opcao.value} value={opcao.value}>
                    {opcao.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <PerfilCheckboxes perfis={perfis} />

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={isCreating}
              className="inline-flex items-center gap-2 rounded-2xl bg-red-700 px-5 py-3 text-sm font-black text-white transition hover:bg-red-800 disabled:opacity-50"
            >
              {isCreating ? <Loader2 className="h-4 w-4 animate-spin" /> : <UserCog className="h-4 w-4" />}
              {isCreating ? "Salvando..." : "Criar usuario"}
            </button>
          </div>
        </form>
      </ModalShell>

      <ModalShell
        open={!!usuarioSelecionado}
        onClose={() => {
          if (isUpdating) return;
          setUsuarioSelecionadoId(null);
        }}
        title={usuarioSelecionado?.nome || "Editar usuario"}
        subtitle={usuarioSelecionado?.email || "Ajuste tipo de conta, status e perfis."}
      >
        {usuarioSelecionado && (
          <form
            onSubmit={(event) => {
              event.preventDefault();
              const formData = new FormData(event.currentTarget);
              void handleUpdate(formData);
            }}
            className="space-y-4"
          >
            <input type="hidden" name="usuarioId" value={usuarioSelecionado.id} />

            <div>
              <label className="mb-1.5 block text-sm font-bold text-gray-800">Nome</label>
              <input
                name="nome"
                defaultValue={usuarioSelecionado.nome ?? ""}
                required
                className="w-full rounded-xl border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-950 outline-none transition focus:border-red-500 focus:ring-2 focus:ring-red-100"
              />
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="mb-1.5 block text-sm font-bold text-gray-800">Tipo</label>
                <select
                  name="tipoConta"
                  defaultValue={usuarioSelecionado.tipoConta}
                  className="w-full rounded-xl border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-950 outline-none transition focus:border-red-500 focus:ring-2 focus:ring-red-100"
                >
                  {opcoesTipoConta.map((opcao) => (
                    <option key={opcao.value} value={opcao.value}>
                      {opcao.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-bold text-gray-800">Status</label>
                <select
                  name="status"
                  defaultValue={usuarioSelecionado.status}
                  className="w-full rounded-xl border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-950 outline-none transition focus:border-red-500 focus:ring-2 focus:ring-red-100"
                >
                  {opcoesStatus.map((opcao) => (
                    <option key={opcao.value} value={opcao.value}>
                      {opcao.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <PerfilCheckboxes perfis={perfis} selectedIds={usuarioSelecionado.perfilIds} />

            <div className="flex justify-end">
              <button
                type="submit"
                disabled={isUpdating}
                className="rounded-2xl bg-gray-950 px-5 py-3 text-sm font-black text-white transition hover:bg-black disabled:opacity-50"
              >
                <span className="inline-flex items-center gap-2">
                  {isUpdating && <Loader2 className="h-4 w-4 animate-spin" />}
                  {isUpdating ? "Salvando..." : "Salvar acesso"}
                </span>
              </button>
            </div>
          </form>
        )}
      </ModalShell>
    </div>
  );
}
