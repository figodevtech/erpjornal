import { PrismaClient, StatusArtigo } from "@prisma/client";

const prisma = new PrismaClient();

const ids = {
  admin: "11111111-1111-4111-8111-111111111111",
  editora: "22222222-2222-4222-8222-222222222222",
  reporter: "33333333-3333-4333-8333-333333333333",
  catPolitica: "a1111111-1111-4111-8111-111111111111",
  catEconomia: "a2222222-2222-4222-8222-222222222222",
  catGestao: "a3333333-3333-4333-8333-333333333333",
  lula: "b1111111-1111-4111-8111-111111111111",
  tarcisio: "b2222222-2222-4222-8222-222222222222",
  fontePlanejamento: "c1111111-1111-4111-8111-111111111111",
  fonteIndustria: "c2222222-2222-4222-8222-222222222222",
  rssPolitica: "d1111111-1111-4111-8111-111111111111",
  rssEconomia: "d2222222-2222-4222-8222-222222222222",
  rssItem1: "d3333333-3333-4333-8333-333333333333",
  rssItem2: "d4444444-4444-4444-8444-444444444444",
  artigo1: "e1111111-1111-4111-8111-111111111111",
  artigo2: "e2222222-2222-4222-8222-222222222222",
  artigo3: "e3333333-3333-4333-8333-333333333333",
};

const perfis = [
  { nome: "admin_erp", descricao: "Acesso total ao ERP" },
  { nome: "editor_erp", descricao: "Edita e publica conteudo" },
  { nome: "reporter_erp", descricao: "Cria e edita conteudo proprio" },
  { nome: "juridico_erp", descricao: "Responsavel por revisao juridica" },
  { nome: "leitor_portal", descricao: "Usuario autenticado do portal" },
  { nome: "autor_portal", descricao: "Pode salvar e comentar noticias" },
];

const permissoes = [
  { modulo: "artigos", acao: "ler", descricao: "Visualizar artigos" },
  { modulo: "artigos", acao: "criar", descricao: "Criar artigos" },
  { modulo: "artigos", acao: "editar", descricao: "Editar artigos" },
  { modulo: "artigos", acao: "publicar", descricao: "Publicar artigos" },
  { modulo: "categorias", acao: "gerir", descricao: "Gerenciar categorias editoriais" },
  { modulo: "fontes", acao: "ler", descricao: "Visualizar fontes" },
  { modulo: "fontes", acao: "criar", descricao: "Criar fontes" },
  { modulo: "fontes", acao: "editar", descricao: "Editar fontes" },
  { modulo: "curadoria", acao: "ler", descricao: "Visualizar curadoria" },
  { modulo: "curadoria", acao: "aprovar", descricao: "Aprovar itens de curadoria" },
  { modulo: "curadoria", acao: "gerir", descricao: "Gerenciar feeds e coleta RSS" },
  { modulo: "midia", acao: "ler", descricao: "Visualizar biblioteca de midia" },
  { modulo: "midia", acao: "criar", descricao: "Cadastrar ativos de midia" },
  { modulo: "midia", acao: "editar", descricao: "Editar ativos de midia" },
  { modulo: "podcasts", acao: "ler", descricao: "Visualizar podcasts" },
  { modulo: "podcasts", acao: "criar", descricao: "Criar episodios de podcast" },
  { modulo: "podcasts", acao: "editar", descricao: "Editar episodios de podcast" },
  { modulo: "politicos", acao: "gerir", descricao: "Gerenciar politicos" },
  { modulo: "portal", acao: "salvar", descricao: "Salvar noticia" },
  { modulo: "portal", acao: "comentar", descricao: "Comentar noticia" },
  { modulo: "usuarios", acao: "gerir", descricao: "Gerenciar acessos" },
];

const permissoesPorPerfil: Record<string, string[]> = {
  admin_erp: permissoes.map((p) => `${p.modulo}:${p.acao}`),
  editor_erp: [
    "artigos:ler", "artigos:criar", "artigos:editar", "artigos:publicar",
    "categorias:gerir",
    "fontes:ler", "fontes:criar", "fontes:editar",
    "curadoria:ler", "curadoria:aprovar", "curadoria:gerir",
    "midia:ler", "midia:criar", "midia:editar",
    "podcasts:ler", "podcasts:criar", "podcasts:editar",
    "politicos:gerir",
  ],
  reporter_erp: [
    "artigos:ler", "artigos:criar", "artigos:editar",
    "fontes:ler", "fontes:criar",
    "curadoria:ler",
    "midia:ler",
    "podcasts:ler",
  ],
  juridico_erp: ["artigos:ler", "artigos:editar", "curadoria:ler", "fontes:ler"],
  leitor_portal: ["portal:salvar"],
  autor_portal: ["portal:salvar", "portal:comentar"],
};

const html1 = "<p>O novo pacote de investimentos em infraestrutura pressiona estados e municipios a profissionalizar o acompanhamento de entregas. A proposta combina repasses, indicadores de desempenho e um painel publico de monitoramento para reduzir atrasos e ampliar transparencia.</p><p>Gestores ouvidos pela reportagem afirmam que a principal novidade esta na governanca: cada projeto nasce com metas, risco mapeado e gatilhos de reprogramacao. Isso melhora a leitura sobre custo, prazo e impacto social.</p>";
const html2 = "<p>Empresas industriais aceleraram projetos de rastreabilidade depois que financiamento e exportacao passaram a depender de evidencias mais robustas de origem, energia e conformidade. O tema saiu da prateleira regulatoria e virou agenda de margem e reputacao.</p><p>O desafio agora e padronizar a troca de dados entre fornecedores, operacao e auditoria. Sem interoperabilidade, a maior parte do valor da rastreabilidade se perde na execucao.</p>";
const html3 = "<p>Governadores discutem um consorcio para compras de nuvem, observabilidade e ciberseguranca. A leitura e que contratos cooperados podem reduzir custo unitario e elevar resiliencia em servicos digitais criticos.</p><p>O debate ainda passa por governanca, autonomia estadual e definicao de lotes tecnicos. Se der certo, o modelo pode virar referencia para compras conjuntas em outras frentes do governo digital.</p>";

async function main() {
  for (const perfil of perfis) {
    await prisma.perfil.upsert({ where: { nome: perfil.nome }, update: perfil, create: perfil });
  }
  for (const permissao of permissoes) {
    await prisma.permissao.upsert({
      where: { modulo_acao: { modulo: permissao.modulo, acao: permissao.acao } },
      update: { descricao: permissao.descricao },
      create: permissao,
    });
  }

  const perfisDb = await prisma.perfil.findMany();
  const permissoesDb = await prisma.permissao.findMany();
  const perfilPorNome = new Map(perfisDb.map((p) => [p.nome, p]));
  const permissaoPorChave = new Map(permissoesDb.map((p) => [`${p.modulo}:${p.acao}`, p]));

  for (const [perfilNome, lista] of Object.entries(permissoesPorPerfil)) {
    const perfil = perfilPorNome.get(perfilNome);
    if (!perfil) continue;
    await prisma.perfilPermissao.deleteMany({ where: { perfilId: perfil.id } });
    await prisma.perfilPermissao.createMany({
      data: lista.map((chave) => permissaoPorChave.get(chave)).filter(Boolean).map((p) => ({ perfilId: perfil.id, permissaoId: p!.id })),
      skipDuplicates: true,
    });
  }

  const usuarios = [
    { id: ids.admin, nome: "Marina Campos", email: "marina.campos@revistagestao.local", tipoConta: "misto", perfis: ["admin_erp", "autor_portal"] },
    { id: ids.editora, nome: "Helena Duarte", email: "helena.duarte@revistagestao.local", tipoConta: "erp", perfis: ["editor_erp"] },
    { id: ids.reporter, nome: "Caio Nogueira", email: "caio.nogueira@revistagestao.local", tipoConta: "erp", perfis: ["reporter_erp"] },
  ];

  for (const usuario of usuarios) {
    await prisma.usuario.upsert({
      where: { id: usuario.id },
      update: { nome: usuario.nome, email: usuario.email, tipoConta: usuario.tipoConta, status: "ativo" },
      create: { id: usuario.id, nome: usuario.nome, email: usuario.email, tipoConta: usuario.tipoConta, status: "ativo" },
    });
    await prisma.usuarioPerfil.deleteMany({ where: { usuarioId: usuario.id } });
    await prisma.usuarioPerfil.createMany({
      data: usuario.perfis.map((nome) => ({ usuarioId: usuario.id, perfilId: perfilPorNome.get(nome)!.id })),
      skipDuplicates: true,
    });
  }

  for (const categoria of [
    { id: ids.catPolitica, nome: "Politica Institucional", slug: "politica-institucional", esfera: "Nacional", cor: "#991b1b", metaDescricao: "Cobertura de negociacao politica e agenda institucional." },
    { id: ids.catEconomia, nome: "Economia e Orcamento", slug: "economia-orcamento", esfera: "Nacional", cor: "#1d4ed8", metaDescricao: "Investimento, orcamento e ambiente economico." },
    { id: ids.catGestao, nome: "Gestao Publica", slug: "gestao-publica", esfera: "Nacional", cor: "#047857", metaDescricao: "Governanca, servicos digitais e modernizacao administrativa." },
  ]) {
    await prisma.categoria.upsert({ where: { slug: categoria.slug }, update: categoria, create: categoria });
  }

  for (const politico of [
    { id: ids.lula, nome: "Luiz Inacio Lula da Silva", cargo: "Presidente da Republica", partido: "PT", biografia: "Presidente com foco em investimento, federacao e agenda social.", regiao: "Nacional", estado: "DF" },
    { id: ids.tarcisio, nome: "Tarcisio de Freitas", cargo: "Governador", partido: "Republicanos", biografia: "Governador com agenda de infraestrutura e digitalizacao.", regiao: "Sudeste", estado: "SP" },
  ]) {
    await prisma.politico.upsert({ where: { id: politico.id }, update: politico, create: politico });
  }

  for (const fonte of [
    { id: ids.fontePlanejamento, nome: "Laura Mendonca", cargo: "Assessora especial", organizacao: "Ministerio do Planejamento", email: "laura@planejamento.local", telefone: "(61) 99999-1001", nivelSigilo: "reservado", notas: "Acompanha carteira de investimentos e cronogramas.", criadorId: ids.editora },
    { id: ids.fonteIndustria, nome: "Patricia Silveira", cargo: "Diretora de estrategia", organizacao: "Associacao da Industria Digital", email: "patricia@industria.local", telefone: "(11) 99999-3003", nivelSigilo: "confidencial", notas: "Tem boa leitura de cadeia industrial e digitalizacao fabril.", criadorId: ids.admin },
  ]) {
    await prisma.fonte.upsert({ where: { id: fonte.id }, update: fonte, create: fonte });
  }

  for (const fonteRss of [
    { id: ids.rssPolitica, name: "Radar Politico Nacional", urlFeed: "https://exemplo.local/rss/politica.xml", tone: "jornalistico", regiao: "Nacional", estado: "DF", cacheTtl: 30, ativa: true },
    { id: ids.rssEconomia, name: "Economia em Movimento", urlFeed: "https://exemplo.local/rss/economia.xml", tone: "direto", regiao: "Sudeste", estado: "SP", cacheTtl: 15, ativa: true },
  ]) {
    await prisma.fonteRss.upsert({ where: { urlFeed: fonteRss.urlFeed }, update: fonteRss, create: fonteRss });
  }

  for (const item of [
    { id: ids.rssItem1, sourceId: ids.rssPolitica, guid: "rss-item-investimentos-regionais", tituloOriginal: "Governo acelera carteira de investimentos regionais", linkOriginal: "https://exemplo.local/noticias/investimentos-regionais", autorOriginal: "Radar Politico Nacional", description: "Nova rodada de projetos prioriza conectividade, saude e monitoramento publico.", thumbnail: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=1600&q=80", dataPublicacao: new Date("2026-04-02T10:30:00.000Z"), status: "published" },
    { id: ids.rssItem2, sourceId: ids.rssEconomia, guid: "rss-item-rastreabilidade-industrial", tituloOriginal: "Industria amplia uso de rastreabilidade em linhas exportadoras", linkOriginal: "https://exemplo.local/noticias/rastreabilidade-industrial", autorOriginal: "Economia em Movimento", description: "Empresas aceleram projetos para elevar conformidade e visibilidade de cadeia.", thumbnail: "https://images.unsplash.com/photo-1565008447742-97f6f38c985c?auto=format&fit=crop&w=1600&q=80", dataPublicacao: new Date("2026-04-05T14:00:00.000Z"), status: "selected" },
  ]) {
    await prisma.itemRssBruto.upsert({ where: { guid: item.guid }, update: item, create: item });
  }

  for (const artigo of [
    { id: ids.artigo1, titulo: "Pacote de infraestrutura pressiona estados a elevar governanca de projetos", slug: "pacote-infraestrutura-governanca-projetos", corpoTexto: html1, resumo: "Nova carteira de investimentos combina repasse, indicador de desempenho e transparencia para acelerar entregas.", autorId: ids.editora, editorId: ids.admin, categoriaId: ids.catGestao, status: StatusArtigo.publicado, dataPublicacao: new Date("2026-04-03T12:00:00.000Z"), visualizacoes: 1842, urlImagemOg: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=1600&q=80", estado: "DF", statusLegal: "aprovado", regiao: "Nacional", canaisPublicacao: ["portal", "newsletter"], autorExterno: "Radar Politico Nacional", urlFonte: "https://exemplo.local/noticias/investimentos-regionais", revisorHumano: "Renata Paes", itemRssId: ids.rssItem1 },
    { id: ids.artigo2, titulo: "Rastreabilidade vira criterio de financiamento na industria exportadora", slug: "rastreabilidade-criterio-financiamento-industria-exportadora", corpoTexto: html2, resumo: "Companhias com dados mais confiaveis ganham vantagem em auditoria, financiamento e acesso a mercados.", autorId: ids.reporter, editorId: ids.editora, categoriaId: ids.catEconomia, status: StatusArtigo.publicado, dataPublicacao: new Date("2026-04-06T11:15:00.000Z"), visualizacoes: 973, urlImagemOg: "https://images.unsplash.com/photo-1565008447742-97f6f38c985c?auto=format&fit=crop&w=1600&q=80", estado: "SP", statusLegal: "aprovado", regiao: "Sudeste", ehPremium: true, canaisPublicacao: ["portal"], autorExterno: "Economia em Movimento", urlFonte: "https://exemplo.local/noticias/rastreabilidade-industrial", revisorHumano: "Renata Paes" },
    { id: ids.artigo3, titulo: "Consorcio regional para compras de nuvem avanca entre governadores", slug: "consorcio-regional-compras-nuvem-governadores", corpoTexto: html3, resumo: "Estados negociam padroes tecnicos e compras cooperadas para reduzir custo e elevar resiliencia digital.", autorId: ids.admin, editorId: ids.editora, categoriaId: ids.catPolitica, status: StatusArtigo.revisao, visualizacoes: 214, urlImagemOg: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=1600&q=80", estado: "GO", statusLegal: "pendente", regiao: "Centro-Oeste", canaisPublicacao: ["portal"], revisorHumano: "Renata Paes" },
  ]) {
    await prisma.artigo.upsert({ where: { slug: artigo.slug }, update: artigo, create: artigo });
  }

  await prisma.artigoPolitico.createMany({
    data: [
      { artigoId: ids.artigo1, politicoId: ids.lula },
      { artigoId: ids.artigo3, politicoId: ids.tarcisio },
    ],
    skipDuplicates: true,
  });

  console.log("Seed concluido: perfis, usuarios e conteudo editorial de exemplo criados.");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
}).finally(async () => {
  await prisma.$disconnect();
});
