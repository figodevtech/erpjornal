/** Perfis e permissões (RBAC) criados pelo seed. */

export const PERFIS = [
  { nome: "admin_erp", descricao: "Acesso total ao ERP" },
  { nome: "editor_erp", descricao: "Edita e publica conteúdo" },
  { nome: "reporter_erp", descricao: "Cria e edita conteúdo próprio" },
  { nome: "juridico_erp", descricao: "Responsável por revisão jurídica" },
  { nome: "leitor_portal", descricao: "Usuário autenticado do portal" },
  { nome: "autor_portal", descricao: "Pode salvar e comentar notícias" },
] as const;

export type NomePerfil = (typeof PERFIS)[number]["nome"];

export const PERMISSOES = [
  { modulo: "artigos", acao: "ler", descricao: "Visualizar artigos" },
  { modulo: "artigos", acao: "criar", descricao: "Criar artigos" },
  { modulo: "artigos", acao: "editar", descricao: "Editar artigos próprios" },
  { modulo: "artigos", acao: "editar_todos", descricao: "Editar artigos de qualquer autor" },
  { modulo: "artigos", acao: "publicar", descricao: "Publicar e despublicar artigos" },
  { modulo: "revistas", acao: "ler", descricao: "Visualizar revistas" },
  { modulo: "revistas", acao: "criar", descricao: "Criar revistas" },
  { modulo: "revistas", acao: "editar", descricao: "Editar revistas" },
  { modulo: "categorias", acao: "ler", descricao: "Visualizar categorias editoriais" },
  { modulo: "categorias", acao: "criar", descricao: "Criar categorias editoriais" },
  { modulo: "categorias", acao: "editar", descricao: "Editar categorias editoriais" },
  { modulo: "entidades", acao: "ler", descricao: "Visualizar entidades" },
  { modulo: "entidades", acao: "criar", descricao: "Criar entidades" },
  { modulo: "entidades", acao: "editar", descricao: "Editar entidades" },
  { modulo: "fontes", acao: "ler", descricao: "Visualizar fontes" },
  { modulo: "fontes", acao: "criar", descricao: "Criar fontes" },
  { modulo: "fontes", acao: "editar", descricao: "Editar fontes" },
  { modulo: "fontes", acao: "confidencial", descricao: "Visualizar fontes confidenciais" },
  { modulo: "curadoria", acao: "ler", descricao: "Visualizar curadoria" },
  { modulo: "curadoria", acao: "aprovar", descricao: "Aprovar itens de curadoria" },
  { modulo: "curadoria", acao: "gerir", descricao: "Gerenciar feeds e coleta RSS" },
  { modulo: "midia", acao: "ler", descricao: "Visualizar biblioteca de mídia" },
  { modulo: "midia", acao: "criar", descricao: "Cadastrar ativos de mídia" },
  { modulo: "midia", acao: "editar", descricao: "Editar ativos de mídia" },
  { modulo: "midia-kit", acao: "ler", descricao: "Visualizar mídia kits" },
  { modulo: "midia-kit", acao: "criar", descricao: "Criar mídia kits" },
  { modulo: "midia-kit", acao: "editar", descricao: "Editar mídia kits" },
  { modulo: "midia-kit", acao: "publicar", descricao: "Publicar mídia kits" },
  { modulo: "anuncios", acao: "ler", descricao: "Visualizar anúncios" },
  { modulo: "anuncios", acao: "criar", descricao: "Criar anúncios" },
  { modulo: "anuncios", acao: "editar", descricao: "Editar anúncios" },
  { modulo: "podcasts", acao: "ler", descricao: "Visualizar podcasts" },
  { modulo: "podcasts", acao: "criar", descricao: "Criar episódios de podcast" },
  { modulo: "podcasts", acao: "editar", descricao: "Editar episódios de podcast" },
  { modulo: "configuracoes", acao: "gerir", descricao: "Alterar configurações globais do sistema" },
  { modulo: "portal", acao: "salvar", descricao: "Salvar notícia" },
  { modulo: "portal", acao: "comentar", descricao: "Comentar notícia" },
  { modulo: "usuarios", acao: "gerir", descricao: "Gerenciar usuários e permissões" },
] as const;

export type ChavePermissao = `${(typeof PERMISSOES)[number]["modulo"]}:${(typeof PERMISSOES)[number]["acao"]}`;

const todas = PERMISSOES.map((p) => `${p.modulo}:${p.acao}` as ChavePermissao);

/**
 * Permissões padrão de cada perfil. O seed só ADICIONA o que falta:
 * ajustes feitos depois pelo ERP (tela de Permissões) são preservados.
 */
export const PERMISSOES_POR_PERFIL: Record<NomePerfil, ChavePermissao[]> = {
  admin_erp: todas,
  editor_erp: [
    "artigos:ler", "artigos:criar", "artigos:editar", "artigos:editar_todos", "artigos:publicar",
    "revistas:ler", "revistas:criar", "revistas:editar",
    "categorias:ler", "categorias:criar", "categorias:editar",
    "entidades:ler", "entidades:criar", "entidades:editar",
    "fontes:ler", "fontes:criar", "fontes:editar", "fontes:confidencial",
    "curadoria:ler", "curadoria:aprovar", "curadoria:gerir",
    "midia:ler", "midia:criar", "midia:editar",
    "midia-kit:ler", "midia-kit:criar", "midia-kit:editar", "midia-kit:publicar",
    "podcasts:ler", "podcasts:criar", "podcasts:editar",
  ],
  reporter_erp: [
    "artigos:ler", "artigos:criar", "artigos:editar",
    "revistas:ler",
    "categorias:ler",
    "entidades:ler",
    "fontes:ler", "fontes:criar",
    "curadoria:ler",
    "midia:ler",
    "podcasts:ler",
  ],
  juridico_erp: ["artigos:ler", "artigos:editar", "artigos:editar_todos", "curadoria:ler", "fontes:ler"],
  leitor_portal: ["portal:salvar"],
  autor_portal: ["portal:salvar", "portal:comentar"],
};
