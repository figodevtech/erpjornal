create table if not exists public.anuncios (
  id uuid primary key default gen_random_uuid(),
  titulo text not null,
  imagem_url text not null,
  link_url text not null,
  alt_text text,
  tamanho text not null default 'banner_horizontal',
  paginas text[] not null default array['home']::text[],
  posicoes text[] not null default array['topo']::text[],
  ativo boolean not null default true,
  prioridade integer not null default 0,
  data_inicio timestamptz,
  data_fim timestamptz,
  criado_em timestamptz not null default now(),
  atualizado_em timestamptz not null default now()
);

create index if not exists anuncios_ativo_data_fim_idx
  on public.anuncios (ativo, data_fim);

insert into public.permissoes (id, modulo, acao, descricao)
values
  (gen_random_uuid(), 'anuncios', 'ler', 'Visualizar anuncios'),
  (gen_random_uuid(), 'anuncios', 'criar', 'Criar anuncios'),
  (gen_random_uuid(), 'anuncios', 'editar', 'Editar anuncios')
on conflict (modulo, acao) do update
set descricao = excluded.descricao;
