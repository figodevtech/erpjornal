"use client";

import { useMemo, useState, useTransition } from "react";
import { BriefcaseBusiness, Building2, Pencil, Plus, Save, Trash2, UserCircle, X } from "lucide-react";

import ConfirmationDialog from "@/components/ui/ConfirmationDialog";
import CustomSelect from "@/components/ui/CustomSelect";

import { deletePolitician, upsertPolitician } from "../actions";

const cpfCategories = [
  "Politico",
  "Agente publico / Autoridade",
  "Empresario / Executivo",
  "Artista / Celebridade",
  "Influenciador",
  "Atleta",
  "Especialista",
  "Lider religioso",
  "Figura publica",
  "Cidadao / Pessoa comum",
];

const cnpjCategories = [
  "Empresa privada",
  "Empresa publica",
  "Orgao publico",
  "ONG",
  "Associacao",
  "Fundacao",
  "Partido politico",
  "Instituicao de ensino",
  "Veiculo de comunicacao",
  "Instituicao financeira",
];

export interface Politician {
  id?: string;
  nome: string | null;
  cpf: string | null;
  cnpj: string | null;
  categoriaEntidade: string | null;
  cargo: string | null;
  partido: string | null;
  biografia: string | null;
  regiao: string | null;
  estado: string | null;
}

function emptyEntity(): Politician {
  return {
    nome: "",
    cpf: "",
    cnpj: "",
    categoriaEntidade: "",
    cargo: "",
    partido: "",
    biografia: "",
    regiao: "",
    estado: "",
  };
}

function formatCpf(value: string | null) {
  const digits = (value ?? "").replace(/\D/g, "");
  if (digits.length !== 11) return value ?? "";
  return digits.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, "$1.$2.$3-$4");
}

function formatCnpj(value: string | null) {
  const digits = (value ?? "").replace(/\D/g, "");
  if (digits.length !== 14) return value ?? "";
  return digits.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, "$1.$2.$3/$4-$5");
}

function getDocumentType(entity: Politician) {
  if (entity.cnpj) return "cnpj";
  return "cpf";
}

export default function PoliticianManager({
  initialPoliticians,
  podeCriar,
  podeEditar,
}: {
  initialPoliticians: Politician[];
  podeCriar: boolean;
  podeEditar: boolean;
}) {
  const [politicians] = useState<Politician[]>(initialPoliticians);
  const [editing, setEditing] = useState<Politician | null>(null);
  const [entityToDelete, setEntityToDelete] = useState<Politician | null>(null);
  const [deleteError, setDeleteError] = useState("");
  const [documentType, setDocumentType] = useState<"cpf" | "cnpj">("cpf");
  const [isPending, startTransition] = useTransition();

  const categoryOptions = useMemo(() => (documentType === "cpf" ? cpfCategories : cnpjCategories), [documentType]);

  function openEditor(entity?: Politician) {
    const selected = entity ?? emptyEntity();
    setEditing(selected);
    setDocumentType(getDocumentType(selected));
  }

  const handleSave = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);

    if (documentType === "cpf") {
      formData.set("cnpj", "");
    } else {
      formData.set("cpf", "");
    }

    startTransition(async () => {
      try {
        await upsertPolitician(formData);
        setEditing(null);
        window.location.reload();
      } catch {
        alert("Erro ao salvar entidade");
      }
    });
  };

  const handleDelete = async () => {
    if (!entityToDelete?.id) return;

    startTransition(async () => {
      try {
        await deletePolitician(entityToDelete.id!);
        setEntityToDelete(null);
        window.location.reload();
      } catch {
        setDeleteError("Nao foi possivel excluir. Verifique se a entidade esta vinculada a artigos.");
      }
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-black text-gray-800">Diretorio de Entidades</h1>
          <p className="mt-1 text-sm text-gray-500">Cadastro de pessoas fisicas e juridicas citadas na cobertura.</p>
        </div>
        {podeCriar && (
          <button
            onClick={() => openEditor()}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-bold text-white shadow-sm transition hover:bg-indigo-700"
          >
            <Plus className="h-4 w-4" />
            Nova Entidade
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        {politicians.map((entity) => {
          const isCompany = Boolean(entity.cnpj);
          return (
            <div key={entity.id} className="group rounded-xl border border-gray-200 bg-white p-4 shadow-sm transition-shadow hover:shadow-md">
              <div className="flex items-start justify-between gap-3">
                <div className="flex min-w-0 gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gray-100 text-gray-400">
                    {isCompany ? <Building2 className="h-6 w-6" /> : <UserCircle className="h-6 w-6" />}
                  </div>
                  <div className="min-w-0">
                    <h3 className="truncate font-bold text-gray-800">{entity.nome || "Entidade sem nome"}</h3>
                    <p className="mt-1 text-xs font-medium text-gray-500">
                      {entity.categoriaEntidade || (isCompany ? "Pessoa juridica" : "Pessoa fisica")}
                    </p>
                    <p className="mt-1 inline-block rounded border border-gray-100 bg-gray-50 px-1.5 py-0.5 text-[10px] text-gray-400">
                      {isCompany ? formatCnpj(entity.cnpj) || "CNPJ nao informado" : formatCpf(entity.cpf) || "CPF nao informado"}
                    </p>
                    {(entity.regiao || entity.estado) && (
                      <p className="mt-1 text-[10px] text-gray-400">
                        {entity.regiao} {entity.estado ? `(${entity.estado})` : ""}
                      </p>
                    )}
                  </div>
                </div>
                {podeEditar && (
                  <div className="flex gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                    <button onClick={() => openEditor(entity)} className="rounded p-1.5 text-gray-400 hover:bg-indigo-50 hover:text-indigo-600">
                      <Pencil className="h-4 w-4" />
                    </button>
                    {entity.id && (
                    <button
                      onClick={() => {
                        setDeleteError("");
                        setEntityToDelete(entity);
                      }}
                      className="rounded p-1.5 text-gray-400 hover:bg-rose-50 hover:text-rose-600"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                    )}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {politicians.length === 0 && (
        <div className="rounded-xl border-2 border-dashed border-gray-200 bg-gray-50 py-16 text-center">
          <BriefcaseBusiness className="mx-auto mb-3 h-10 w-10 text-gray-300" />
          <p className="font-medium text-gray-500">Nenhuma entidade cadastrada.</p>
        </div>
      )}

      {editing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/40 p-4 backdrop-blur-sm">
          <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl border border-gray-200 bg-white shadow-2xl animate-in zoom-in-95 duration-200">
            <form onSubmit={handleSave} className="space-y-4 p-6">
              <div className="mb-2 flex items-center justify-between">
                <h2 className="text-xl font-bold text-gray-800">{editing.id ? "Editar Entidade" : "Nova Entidade"}</h2>
                <button type="button" onClick={() => setEditing(null)} className="text-gray-400 hover:text-gray-600">
                  <X className="h-6 w-6" />
                </button>
              </div>

              {editing.id && <input type="hidden" name="id" value={editing.id} />}

              <div className="grid grid-cols-2 rounded-xl bg-gray-100 p-1">
                <button
                  type="button"
                  onClick={() => setDocumentType("cpf")}
                  className={`rounded-lg px-3 py-2 text-sm font-bold transition ${
                    documentType === "cpf" ? "bg-white text-indigo-700 shadow-sm" : "text-gray-500 hover:text-gray-800"
                  }`}
                >
                  CPF
                </button>
                <button
                  type="button"
                  onClick={() => setDocumentType("cnpj")}
                  className={`rounded-lg px-3 py-2 text-sm font-bold transition ${
                    documentType === "cnpj" ? "bg-white text-indigo-700 shadow-sm" : "text-gray-500 hover:text-gray-800"
                  }`}
                >
                  CNPJ
                </button>
              </div>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div className="md:col-span-2">
                  <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-gray-400">Nome / Razao social</label>
                  <input
                    name="nome"
                    defaultValue={editing.nome || ""}
                    className="w-full rounded-lg border border-gray-200 bg-gray-50 p-2.5 outline-none transition-all focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-gray-400">
                    {documentType === "cpf" ? "CPF" : "CNPJ"}
                  </label>
                  {documentType === "cpf" ? (
                    <input
                      name="cpf"
                      defaultValue={editing.cpf || ""}
                      maxLength={14}
                      className="w-full rounded-lg border border-gray-200 bg-gray-50 p-2.5 outline-none transition-all focus:ring-2 focus:ring-indigo-500"
                    />
                  ) : (
                    <input
                      name="cnpj"
                      defaultValue={editing.cnpj || ""}
                      maxLength={18}
                      className="w-full rounded-lg border border-gray-200 bg-gray-50 p-2.5 outline-none transition-all focus:ring-2 focus:ring-indigo-500"
                    />
                  )}
                </div>

                <div>
                  <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-gray-400">Categoria</label>
                  <CustomSelect
                    key={documentType}
                    name="categoriaEntidade"
                    defaultValue={categoryOptions.includes(editing.categoriaEntidade || "") ? editing.categoriaEntidade || "" : ""}
                    placeholder="Sem categoria"
                    options={[
                      { value: "", label: "Sem categoria" },
                      ...categoryOptions.map((category) => ({ value: category, label: category })),
                    ]}
                  />
                </div>

                <div>
                  <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-gray-400">Cargo / Funcao</label>
                  <input
                    name="cargo"
                    defaultValue={editing.cargo || ""}
                    className="w-full rounded-lg border border-gray-200 bg-gray-50 p-2.5 outline-none transition-all focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-gray-400">Partido / Organizacao</label>
                  <input
                    name="partido"
                    defaultValue={editing.partido || ""}
                    className="w-full rounded-lg border border-gray-200 bg-gray-50 p-2.5 outline-none transition-all focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-gray-400">Esfera / Regiao</label>
                  <input
                    name="regiao"
                    defaultValue={editing.regiao || ""}
                    className="w-full rounded-lg border border-gray-200 bg-gray-50 p-2.5 outline-none transition-all focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-gray-400">Estado</label>
                  <input
                    name="estado"
                    maxLength={2}
                    defaultValue={editing.estado || ""}
                    className="w-full rounded-lg border border-gray-200 bg-gray-50 p-2.5 uppercase outline-none transition-all focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-gray-400">Observacoes / Biografia</label>
                  <textarea
                    name="biografia"
                    rows={3}
                    defaultValue={editing.biografia || ""}
                    className="w-full resize-none rounded-lg border border-gray-200 bg-gray-50 p-2.5 outline-none transition-all focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-3 border-t border-gray-100 pt-5 sm:flex-row sm:items-center sm:justify-end">
                <button
                  type="button"
                  onClick={() => setEditing(null)}
                  disabled={isPending}
                  className="inline-flex items-center justify-center rounded-xl border border-gray-200 px-5 py-3 text-sm font-bold text-gray-600 transition hover:bg-gray-50 disabled:opacity-60"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isPending}
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-5 py-3 text-sm font-bold text-white transition hover:bg-indigo-700 disabled:opacity-60"
                >
                  <Save className="h-4 w-4" />
                  {isPending ? "Salvando..." : "Salvar Entidade"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <ConfirmationDialog
        open={Boolean(entityToDelete)}
        title="Excluir entidade"
        description={`Esta acao remove ${entityToDelete?.nome || "esta entidade"} do cadastro. Vinculos editoriais existentes podem impedir a exclusao.`}
        confirmLabel="Excluir"
        cancelLabel="Cancelar"
        tone="danger"
        pending={isPending}
        onConfirm={handleDelete}
        onClose={() => {
          if (!isPending) {
            setEntityToDelete(null);
            setDeleteError("");
          }
        }}
      >
        {deleteError && <p className="text-xs font-medium text-rose-600">{deleteError}</p>}
      </ConfirmationDialog>
    </div>
  );
}
