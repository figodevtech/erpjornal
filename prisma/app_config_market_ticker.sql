alter table public.app_configuracoes
  add column if not exists barra_mercado_ativa boolean not null default true;
