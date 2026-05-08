insert into public.permissoes (id, modulo, acao, descricao)
values
  (gen_random_uuid(), 'artigos', 'ler', 'Visualizar artigos'),
  (gen_random_uuid(), 'artigos', 'criar', 'Criar artigos'),
  (gen_random_uuid(), 'artigos', 'editar', 'Editar artigos'),
  (gen_random_uuid(), 'artigos', 'publicar', 'Publicar artigos'),
  (gen_random_uuid(), 'revistas', 'ler', 'Visualizar revistas'),
  (gen_random_uuid(), 'revistas', 'criar', 'Criar revistas'),
  (gen_random_uuid(), 'revistas', 'editar', 'Editar revistas'),
  (gen_random_uuid(), 'categorias', 'ler', 'Visualizar categorias editoriais'),
  (gen_random_uuid(), 'categorias', 'criar', 'Criar categorias editoriais'),
  (gen_random_uuid(), 'categorias', 'editar', 'Editar categorias editoriais'),
  (gen_random_uuid(), 'entidades', 'ler', 'Visualizar entidades'),
  (gen_random_uuid(), 'entidades', 'criar', 'Criar entidades'),
  (gen_random_uuid(), 'entidades', 'editar', 'Editar entidades'),
  (gen_random_uuid(), 'fontes', 'ler', 'Visualizar fontes'),
  (gen_random_uuid(), 'fontes', 'criar', 'Criar fontes'),
  (gen_random_uuid(), 'fontes', 'editar', 'Editar fontes'),
  (gen_random_uuid(), 'curadoria', 'ler', 'Visualizar curadoria'),
  (gen_random_uuid(), 'curadoria', 'aprovar', 'Aprovar itens de curadoria'),
  (gen_random_uuid(), 'curadoria', 'gerir', 'Gerenciar feeds e coleta RSS'),
  (gen_random_uuid(), 'midia', 'ler', 'Visualizar biblioteca de mídia'),
  (gen_random_uuid(), 'midia', 'criar', 'Cadastrar ativos de mídia'),
  (gen_random_uuid(), 'midia', 'editar', 'Editar ativos de mídia'),
  (gen_random_uuid(), 'podcasts', 'ler', 'Visualizar podcasts'),
  (gen_random_uuid(), 'podcasts', 'criar', 'Criar episódios de podcast'),
  (gen_random_uuid(), 'podcasts', 'editar', 'Editar episódios de podcast'),
  (gen_random_uuid(), 'portal', 'salvar', 'Salvar notícia'),
  (gen_random_uuid(), 'portal', 'comentar', 'Comentar notícia'),
  (gen_random_uuid(), 'usuarios', 'gerir', 'Gerenciar acessos')
on conflict (modulo, acao) do update
set descricao = excluded.descricao;

insert into public.perfis_permissoes (perfil_id, permissao_id)
select pp.perfil_id, nova.id
from public.perfis_permissoes pp
join public.permissoes antiga on antiga.id = pp.permissao_id
join public.permissoes nova on nova.modulo = 'entidades' and nova.acao in ('ler', 'criar', 'editar')
where antiga.modulo = 'politicos' and antiga.acao = 'gerir'
on conflict do nothing;

insert into public.perfis_permissoes (perfil_id, permissao_id)
select pp.perfil_id, nova.id
from public.perfis_permissoes pp
join public.permissoes antiga on antiga.id = pp.permissao_id
join public.permissoes nova on nova.modulo = 'entidades' and nova.acao in ('ler', 'criar', 'editar')
where antiga.modulo = 'entidades' and antiga.acao = 'gerir'
on conflict do nothing;

insert into public.perfis_permissoes (perfil_id, permissao_id)
select pp.perfil_id, nova.id
from public.perfis_permissoes pp
join public.permissoes antiga on antiga.id = pp.permissao_id
join public.permissoes nova on nova.modulo = 'categorias' and nova.acao in ('ler', 'criar', 'editar')
where antiga.modulo = 'categorias' and antiga.acao = 'gerir'
on conflict do nothing;

insert into public.perfis_permissoes (perfil_id, permissao_id)
select pp.perfil_id, nova.id
from public.perfis_permissoes pp
join public.permissoes antiga on antiga.id = pp.permissao_id
join public.permissoes nova on nova.modulo = 'revistas' and nova.acao = antiga.acao
where antiga.modulo = 'artigos'
  and antiga.acao in ('ler', 'criar', 'editar')
on conflict do nothing;

insert into public.perfis_permissoes (perfil_id, permissao_id)
select pp.perfil_id, nova.id
from public.perfis_permissoes pp
join public.permissoes antiga on antiga.id = pp.permissao_id
join public.permissoes nova on nova.modulo = 'revistas' and nova.acao = 'editar'
where antiga.modulo = 'artigos'
  and antiga.acao = 'publicar'
on conflict do nothing;

delete from public.perfis_permissoes
where permissao_id in (
  select id
  from public.permissoes
  where modulo = 'politicos'
    or (modulo in ('categorias', 'entidades') and acao = 'gerir')
);

delete from public.permissoes
where modulo = 'politicos'
  or (modulo in ('categorias', 'entidades') and acao = 'gerir');
