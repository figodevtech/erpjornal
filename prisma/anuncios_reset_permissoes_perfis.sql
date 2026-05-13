delete from public.perfis_permissoes pp
using public.permissoes p
where pp.permissao_id = p.id
  and p.modulo = 'anuncios';
