"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { ChevronDown, KeyRound, Loader2, Mail, Pencil, Plus, Save, Shield, UserCog, Users, X } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import CustomSelect from "@/components/ui/CustomSelect";
import {
  atualizarUsuarioErp,
  criarUsuarioErp,
  definirSenhaUsuarioErp,
  enviarRedefinicaoSenhaUsuarioErp,
} from "../actions";

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
      <div className="flex max-h-[90vh] w-full max-w-3xl flex-col overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-2xl">
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
                {perfil.descricao || "Sem descrição"} · {perfil.usuariosCount} usuário(s)
              </span>
            </span>
          </label>
        ))}
      </div>
    </div>
  );
}

function UserActionsDropdown({
  usuario,
  sendingReset,
  onEdit,
  onSendReset,
  onSetPassword,
}: {
  usuario: UsuarioItem;
  sendingReset: boolean;
  onEdit: () => void;
  onSendReset: () => void;
  onSetPassword: () => void;
}) {
  const [open, setOpen] = useState(false);
  const [dropUp, setDropUp] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  function updateDropdownPosition() {
    const rect = rootRef.current?.getBoundingClientRect();
    if (!rect) return;

    const estimatedMenuHeight = 156;
    const spacing = 12;
    const availableBelow = window.innerHeight - rect.bottom;
    const availableAbove = rect.top;

    setDropUp(availableBelow < estimatedMenuHeight + spacing && availableAbove > availableBelow);
  }

  useEffect(() => {
    if (!open) return;

    const close = () => setOpen(false);
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") close();
    };

    window.addEventListener("click", close);
    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("resize", updateDropdownPosition);
    window.addEventListener("scroll", updateDropdownPosition, true);
    return () => {
      window.removeEventListener("click", close);
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("resize", updateDropdownPosition);
      window.removeEventListener("scroll", updateDropdownPosition, true);
    };
  }, [open]);

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        onClick={(event) => {
          event.stopPropagation();
          if (!open) updateDropdownPosition();
          setOpen((current) => !current);
        }}
        className="inline-flex items-center gap-2 rounded-2xl bg-gray-950 px-5 py-2.5 text-sm font-black text-white transition hover:bg-black"
        aria-haspopup="menu"
        aria-expanded={open}
      >
        <UserCog className="h-4 w-4" />
        Ações
        <ChevronDown className={`h-4 w-4 transition ${open ? "rotate-180" : ""}`} />
      </button>

      {open && (
        <div
          role="menu"
          onClick={(event) => event.stopPropagation()}
          className={`absolute right-0 z-20 w-64 overflow-hidden rounded-2xl border border-gray-200 bg-white p-1.5 shadow-2xl ${
            dropUp ? "bottom-full mb-2" : "top-full mt-2"
          }`}
        >
          <button
            type="button"
            role="menuitem"
            onClick={() => {
              setOpen(false);
              onEdit();
            }}
            className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-bold text-gray-700 transition hover:bg-gray-50"
          >
            <Pencil className="h-4 w-4 text-gray-400" />
            Editar acesso
          </button>
          <button
            type="button"
            role="menuitem"
            disabled={sendingReset || !usuario.email}
            onClick={() => {
              setOpen(false);
              onSendReset();
            }}
            className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-bold text-gray-700 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:text-gray-400"
          >
            {sendingReset ? <Loader2 className="h-4 w-4 animate-spin text-gray-400" /> : <Mail className="h-4 w-4 text-gray-400" />}
            Enviar redefinição por e-mail
          </button>
          <button
            type="button"
            role="menuitem"
            onClick={() => {
              setOpen(false);
              onSetPassword();
            }}
            className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-bold text-gray-700 transition hover:bg-gray-50"
          >
            <KeyRound className="h-4 w-4 text-gray-400" />
            Definir senha
          </button>
        </div>
      )}
    </div>
  );
}

export default function UserAccessManager({ usuarios, perfis }: UserAccessManagerProps) {
  const router = useRouter();
  const [dialogCriacaoAberto, setDialogCriacaoAberto] = useState(false);
  const [usuarioSelecionadoId, setUsuarioSelecionadoId] = useState<string | null>(null);
  const [usuarioSenhaId, setUsuarioSenhaId] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isSendingReset, setIsSendingReset] = useState(false);
  const [isSettingPassword, setIsSettingPassword] = useState(false);

  const usuarioSelecionado = useMemo(
    () => usuarios.find((usuario) => usuario.id === usuarioSelecionadoId) ?? null,
    [usuarioSelecionadoId, usuarios]
  );
  const usuarioSenha = useMemo(
    () => usuarios.find((usuario) => usuario.id === usuarioSenhaId) ?? null,
    [usuarioSenhaId, usuarios]
  );

  async function handleCreate(formData: FormData) {
    setIsCreating(true);
    try {
      await criarUsuarioErp(formData);
      toast.success("Usuário criado.");
      setDialogCriacaoAberto(false);
      router.refresh();
    } catch (error: unknown) {
      toast.error(error instanceof Error ? error.message : "Não foi possível criar o usuário.");
    } finally {
      setIsCreating(false);
    }
  }

  async function handleUpdate(formData: FormData) {
    setIsUpdating(true);
    try {
      await atualizarUsuarioErp(formData);
      toast.success("Usuário atualizado.");
      setUsuarioSelecionadoId(null);
      router.refresh();
    } catch (error: unknown) {
      toast.error(error instanceof Error ? error.message : "Não foi possível atualizar o usuário.");
    } finally {
      setIsUpdating(false);
    }
  }

  async function handleSendPasswordReset(usuarioId: string) {
    setIsSendingReset(true);
    try {
      const formData = new FormData();
      formData.set("usuarioId", usuarioId);
      await enviarRedefinicaoSenhaUsuarioErp(formData);
      toast.success("E-mail de redefinição enviado.");
    } catch (error: unknown) {
      toast.error(error instanceof Error ? error.message : "Não foi possível enviar o e-mail.");
    } finally {
      setIsSendingReset(false);
    }
  }

  async function handleSetPassword(formData: FormData) {
    setIsSettingPassword(true);
    try {
      const senha = formData.get("senha")?.toString() ?? "";
      const confirmacao = formData.get("confirmacao")?.toString() ?? "";

      if (senha !== confirmacao) {
        toast.error("As senhas informadas não conferem.");
        return;
      }

      await definirSenhaUsuarioErp(formData);
      toast.success("Senha atualizada.");
      setUsuarioSenhaId(null);
    } catch (error: unknown) {
      toast.error(error instanceof Error ? error.message : "Não foi possível atualizar a senha.");
    } finally {
      setIsSettingPassword(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-gray-950">Usuários e Acessos</h1>
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
            Editar permissões
          </Link>
          <button
            type="button"
            onClick={() => setDialogCriacaoAberto(true)}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-bold text-white shadow-sm transition hover:bg-indigo-700"
          >
            <Plus className="h-4 w-4" />
            Novo usuário
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
              {usuarios.length} usuário(s) com acesso mapeado no sistema.
            </p>
          </div>
        </div>
      </div>

      {usuarios.length === 0 ? (
        <div className="rounded-3xl border-2 border-dashed border-gray-200 bg-white px-6 py-16 text-center text-gray-500">
          Nenhum usuário cadastrado ainda.
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
                <UserActionsDropdown
                  usuario={usuario}
                  sendingReset={isSendingReset}
                  onEdit={() => setUsuarioSelecionadoId(usuario.id)}
                  onSendReset={() => void handleSendPasswordReset(usuario.id)}
                  onSetPassword={() => setUsuarioSenhaId(usuario.id)}
                />
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
        title="Novo usuário"
        subtitle="Cria o login no Supabase Auth e já vincula o acesso interno."
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
              <label className="mb-1.5 block text-sm font-bold text-gray-800">
                Tipo de conta
              </label>
              <CustomSelect
                name="tipoConta"
                defaultValue="erp"
                options={opcoesTipoConta}
              />
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-bold text-gray-800">
                Status
              </label>
              <CustomSelect
                name="status"
                defaultValue="ativo"
                options={opcoesStatus}
              />
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
              {isCreating ? "Salvando..." : "Criar usuário"}
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
        title={usuarioSelecionado?.nome || "Editar usuário"}
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
                <CustomSelect
                  name="tipoConta"
                  defaultValue={usuarioSelecionado.tipoConta}
                  options={opcoesTipoConta}
                />
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-bold text-gray-800">Status</label>
                <CustomSelect
                  name="status"
                  defaultValue={usuarioSelecionado.status}
                  options={opcoesStatus}
                />
              </div>
            </div>

            <PerfilCheckboxes perfis={perfis} selectedIds={usuarioSelecionado.perfilIds} />

            <div className="flex justify-end">
              <button
                type="submit"
                disabled={isUpdating}
                className="inline-flex items-center gap-2 rounded-2xl bg-gray-950 px-5 py-3 text-sm font-black text-white transition hover:bg-black disabled:opacity-50"
              >
                {isUpdating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                {isUpdating ? "Salvando..." : "Salvar usuário"}
              </button>
            </div>
          </form>
        )}
      </ModalShell>

      <ModalShell
        open={!!usuarioSenha}
        onClose={() => {
          if (isSettingPassword) return;
          setUsuarioSenhaId(null);
        }}
        title="Definir senha"
        subtitle={usuarioSenha?.email || "Atualize a senha manualmente para este usuário."}
      >
        {usuarioSenha && (
          <form
            onSubmit={(event) => {
              event.preventDefault();
              const formData = new FormData(event.currentTarget);
              void handleSetPassword(formData);
            }}
            className="space-y-4"
          >
            <input type="hidden" name="usuarioId" value={usuarioSenha.id} />

            <div className="rounded-2xl border border-gray-200 bg-gray-50 p-4">
              <div className="flex items-start gap-3">
                <div className="rounded-xl bg-white p-2 text-red-700 shadow-sm">
                  <KeyRound className="h-4 w-4" />
                </div>
                <div>
                  <h3 className="text-sm font-black text-gray-950">{usuarioSenha.nome || "Usuário sem nome"}</h3>
                  <p className="text-xs text-gray-500">A nova senha precisa ter pelo menos 8 caracteres.</p>
                </div>
              </div>
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-bold text-gray-800">Nova senha</label>
              <input
                name="senha"
                type="password"
                minLength={8}
                required
                className="w-full rounded-xl border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-950 outline-none transition focus:border-red-500 focus:ring-2 focus:ring-red-100"
              />
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-bold text-gray-800">Confirmar senha</label>
              <input
                name="confirmacao"
                type="password"
                minLength={8}
                required
                className="w-full rounded-xl border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-950 outline-none transition focus:border-red-500 focus:ring-2 focus:ring-red-100"
              />
            </div>

            <div className="flex justify-end">
              <button
                type="submit"
                disabled={isSettingPassword}
                className="inline-flex items-center gap-2 rounded-2xl bg-red-700 px-5 py-3 text-sm font-black text-white transition hover:bg-red-800 disabled:opacity-50"
              >
                {isSettingPassword ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                {isSettingPassword ? "Salvando..." : "Salvar senha"}
              </button>
            </div>
          </form>
        )}
      </ModalShell>
    </div>
  );
}
