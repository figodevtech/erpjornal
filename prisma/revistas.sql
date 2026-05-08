create table if not exists public.revistas (
  id uuid primary key default gen_random_uuid(),
  titulo text not null,
  descricao text,
  edicao text not null,
  data_publicacao timestamp without time zone,
  capa_url text,
  created_at timestamp without time zone not null default now(),
  updated_at timestamp without time zone not null default now()
);

alter table public.artigos
  add column if not exists revista_id uuid,
  add column if not exists ordem_revista integer;

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'artigos_revista_id_fkey'
  ) then
    alter table public.artigos
      add constraint artigos_revista_id_fkey
      foreign key (revista_id) references public.revistas(id)
      on delete set null;
  end if;
end $$;

create index if not exists artigos_revista_ordem_idx on public.artigos (revista_id, ordem_revista);
