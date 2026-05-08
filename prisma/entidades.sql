alter table public.politicos
  alter column nome drop not null,
  add column if not exists cpf text,
  add column if not exists cnpj text,
  add column if not exists categoria_entidade text;

create unique index if not exists politicos_cpf_unique_idx
  on public.politicos (cpf)
  where cpf is not null and cpf <> '';

create unique index if not exists politicos_cnpj_unique_idx
  on public.politicos (cnpj)
  where cnpj is not null and cnpj <> '';
