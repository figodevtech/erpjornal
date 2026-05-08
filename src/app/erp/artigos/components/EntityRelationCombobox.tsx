"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Check, Search, UserPlus, X } from "lucide-react";

import CustomSelect from "@/components/ui/CustomSelect";

type Entity = {
  id: string;
  nome: string | null;
  partido: string | null;
  categoriaEntidade?: string | null;
};

type SelectedEntity = {
  id: string;
  papel?: string | null;
};

type EntityRelationComboboxProps = {
  entities: Entity[];
  initialSelected?: SelectedEntity[];
};

const roleOptions = [
  { value: "", label: "Sem papel definido" },
  { value: "Vítima", label: "Vítima" },
  { value: "Suspeito", label: "Suspeito" },
  { value: "Investigado", label: "Investigado" },
  { value: "Acusado / Réu", label: "Acusado / Réu" },
  { value: "Testemunha", label: "Testemunha" },
  { value: "Fonte", label: "Fonte" },
  { value: "Porta-voz", label: "Porta-voz" },
  { value: "Denunciante", label: "Denunciante" },
  { value: "Envolvido", label: "Envolvido" },
  { value: "Homenageado", label: "Homenageado" },
];

function getEntityLabel(entity: Entity) {
  return entity.nome || "Entidade sem nome";
}

function getEntityDescription(entity: Entity) {
  return entity.categoriaEntidade || entity.partido || "Sem categoria";
}

export default function EntityRelationCombobox({ entities, initialSelected = [] }: EntityRelationComboboxProps) {
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState<SelectedEntity[]>(initialSelected);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handlePointerDown(event: MouseEvent) {
      if (!rootRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
    }

    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  const selectedIds = useMemo(() => new Set(selected.map((item) => item.id)), [selected]);
  const selectedEntities = selected
    .map((item) => ({
      relation: item,
      entity: entities.find((entity) => entity.id === item.id),
    }))
    .filter((item): item is { relation: SelectedEntity; entity: Entity } => Boolean(item.entity));

  const filteredEntities = entities
    .filter((entity) => !selectedIds.has(entity.id))
    .filter((entity) => {
      const searchable = `${entity.nome ?? ""} ${entity.partido ?? ""} ${entity.categoriaEntidade ?? ""}`.toLowerCase();
      return searchable.includes(query.trim().toLowerCase());
    })
    .slice(0, 12);

  function addEntity(entityId: string) {
    setSelected((current) => [...current, { id: entityId, papel: "" }]);
    setQuery("");
    setOpen(false);
  }

  function removeEntity(entityId: string) {
    setSelected((current) => current.filter((item) => item.id !== entityId));
  }

  function updateRole(entityId: string, papel: string) {
    setSelected((current) => current.map((item) => (item.id === entityId ? { ...item, papel } : item)));
  }

  return (
    <div ref={rootRef} className="space-y-3">
      <div className="relative">
        <div className="flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-3 py-2.5 shadow-sm focus-within:border-indigo-500 focus-within:ring-2 focus-within:ring-indigo-500">
          <Search className="h-4 w-4 text-gray-400" />
          <input
            value={query}
            onChange={(event) => {
              setQuery(event.target.value);
              setOpen(true);
            }}
            onFocus={() => setOpen(true)}
            placeholder="Pesquisar entidade..."
            className="min-w-0 flex-1 bg-transparent text-sm text-gray-800 outline-none placeholder:text-gray-400"
          />
        </div>

        {open && (
          <div className="absolute z-[70] mt-2 max-h-72 w-full overflow-y-auto rounded-xl border border-gray-200 bg-white p-1.5 shadow-2xl">
            {filteredEntities.length === 0 ? (
              <div className="px-3 py-4 text-center text-xs font-medium text-gray-400">
                Nenhuma entidade encontrada.
              </div>
            ) : (
              filteredEntities.map((entity) => (
                <button
                  key={entity.id}
                  type="button"
                  onMouseDown={(event) => event.preventDefault()}
                  onClick={() => addEntity(entity.id)}
                  className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left transition hover:bg-indigo-50"
                >
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gray-100 text-gray-500">
                    <UserPlus className="h-4 w-4" />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-semibold text-gray-800">{getEntityLabel(entity)}</span>
                    <span className="block truncate text-xs text-gray-400">{getEntityDescription(entity)}</span>
                  </span>
                </button>
              ))
            )}
          </div>
        )}
      </div>

      <div className="space-y-2">
        {selectedEntities.map(({ entity, relation }) => (
          <div key={entity.id} className="rounded-xl border border-gray-200 bg-white p-3 shadow-sm">
            <input type="hidden" name="politicoIds" value={entity.id} />
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-indigo-600" />
                  <p className="truncate text-sm font-bold text-gray-800">{getEntityLabel(entity)}</p>
                </div>
                <p className="mt-1 text-xs text-gray-400">{getEntityDescription(entity)}</p>
              </div>
              <button
                type="button"
                onClick={() => removeEntity(entity.id)}
                className="rounded-lg p-1.5 text-gray-400 transition hover:bg-rose-50 hover:text-rose-600"
                aria-label={`Remover ${getEntityLabel(entity)}`}
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="mt-3">
              <label className="mb-1.5 block text-[10px] font-bold uppercase tracking-widest text-gray-400">
                Papel na matéria
              </label>
              <CustomSelect
                name={`entidadePapel_${entity.id}`}
                defaultValue={relation.papel || ""}
                options={roleOptions}
                onChange={(value) => updateRole(entity.id, value)}
              />
            </div>
          </div>
        ))}

        {selectedEntities.length === 0 && (
          <div className="rounded-xl border border-dashed border-gray-200 bg-gray-50 px-4 py-5 text-center text-xs font-medium text-gray-400">
            Nenhuma entidade vinculada.
          </div>
        )}
      </div>
    </div>
  );
}
