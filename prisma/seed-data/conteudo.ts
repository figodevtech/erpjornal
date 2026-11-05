/**
 * Conteúdo de exemplo do portal e do ERP.
 *
 * Os textos são fictícios e genéricos, feitos para demonstrar o sistema.
 * Não atribuem fatos, números ou falas a pessoas reais.
 */
import type { StatusArtigo } from "../../src/generated/prisma/enums";

import type {
  MediaKitAboutData,
  MediaKitAdvertisingData,
  MediaKitContactData,
  MediaKitHeroData,
  MediaKitStatsData,
  MediaKitTheme,
} from "../../src/types/media-kit";

const img = (id: string, w = 1600) =>
  `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=${w}&q=80`;

// ---------------------------------------------------------------------------
// Taxonomia (categorias primárias do PRD)
// ---------------------------------------------------------------------------

export const CATEGORIAS = [
  { slug: "executivo", nome: "Executivo", esfera: "Executivo", cor: "#991b1b", metaDescricao: "Governo federal, estados e municípios: agenda, decisões e políticas públicas." },
  { slug: "legislativo", nome: "Legislativo", esfera: "Legislativo", cor: "#1d4ed8", metaDescricao: "Câmara, Senado, assembleias e câmaras municipais." },
  { slug: "judiciario", nome: "Judiciário", esfera: "Judiciário", cor: "#6d28d9", metaDescricao: "Tribunais, Ministério Público e decisões com impacto institucional." },
  { slug: "economia", nome: "Economia", esfera: "Nacional", cor: "#047857", metaDescricao: "Orçamento, investimento, mercado e ambiente de negócios." },
  { slug: "gestao-publica", nome: "Gestão Pública", esfera: "Nacional", cor: "#0f766e", metaDescricao: "Governança, serviços digitais e modernização administrativa." },
  { slug: "internacional", nome: "Internacional", esfera: "Internacional", cor: "#b45309", metaDescricao: "Diplomacia, comércio exterior e geopolítica." },
  { slug: "sustentabilidade", nome: "Sustentabilidade", esfera: "Nacional", cor: "#15803d", metaDescricao: "Clima, energia e desenvolvimento sustentável." },
  { slug: "direitos-civis", nome: "Direitos Civis", esfera: "Nacional", cor: "#be185d", metaDescricao: "Cidadania, direitos humanos e acesso a serviços." },
] as const;

export type SlugCategoria = (typeof CATEGORIAS)[number]["slug"];

// ---------------------------------------------------------------------------
// Entidades (CRM de políticos) — apenas dados públicos de cargo
// ---------------------------------------------------------------------------

export const ENTIDADES = [
  { chave: "lula", nome: "Luiz Inácio Lula da Silva", categoriaEntidade: "Politico", cargo: "Presidente da República", partido: "PT", regiao: "Nacional", estado: "DF", biografia: "Presidente da República." },
  { chave: "tarcisio", nome: "Tarcísio de Freitas", categoriaEntidade: "Politico", cargo: "Governador de São Paulo", partido: "Republicanos", regiao: "Sudeste", estado: "SP", biografia: "Governador do estado de São Paulo." },
] as const;

export type ChaveEntidade = (typeof ENTIDADES)[number]["chave"];

// ---------------------------------------------------------------------------
// CRM de fontes (fictícias)
// ---------------------------------------------------------------------------

export const FONTES = [
  { chave: "fonte-planejamento", nome: "Laura Mendonça", cargo: "Assessora especial", organizacao: "Secretaria de Planejamento (fictícia)", email: "laura.mendonca@example.com", telefone: "(61) 90000-1001", nivelSigilo: "reservado", notas: "Acompanha a carteira de investimentos e os cronogramas de obras." },
  { chave: "fonte-industria", nome: "Patrícia Silveira", cargo: "Diretora de estratégia", organizacao: "Associação setorial (fictícia)", email: "patricia.silveira@example.com", telefone: "(11) 90000-3003", nivelSigilo: "confidencial", notas: "Boa leitura sobre cadeia industrial e digitalização fabril." },
] as const;

// ---------------------------------------------------------------------------
// Fontes RSS reais para a curadoria (Agência Brasil — licença CC BY)
// ---------------------------------------------------------------------------

export const FONTES_RSS = [
  { name: "Agência Brasil — Política", urlFeed: "https://agenciabrasil.ebc.com.br/rss/politica/feed.xml", tone: "jornalistico", regiao: "Nacional", estado: "DF", cacheTtl: 30 },
  { name: "Agência Brasil — Economia", urlFeed: "https://agenciabrasil.ebc.com.br/rss/economia/feed.xml", tone: "jornalistico", regiao: "Nacional", estado: "DF", cacheTtl: 30 },
  { name: "Agência Brasil — Últimas notícias", urlFeed: "https://agenciabrasil.ebc.com.br/rss/ultimasnoticias/feed.xml", tone: "jornalistico", regiao: "Nacional", estado: "DF", cacheTtl: 15 },
] as const;

// ---------------------------------------------------------------------------
// Artigos avulsos: cobrem as 6 etapas do fluxo + arquivado + agendado + premium
// ---------------------------------------------------------------------------

export type AutorSeed = "admin" | "editor" | "reporter";

export type ArtigoSeed = {
  chave: string;
  titulo: string;
  slug: string;
  resumo: string;
  corpoTexto: string;
  categoria: SlugCategoria;
  status: StatusArtigo;
  /** Autor preferido; sem usuários de demonstração, vira o admin. */
  autor: AutorSeed;
  /** Horas atrás da publicação. Negativo = agendado para o futuro. */
  publicadoHaHoras?: number;
  visualizacoes?: number;
  urlImagemOg: string;
  estado: string;
  regiao: string;
  ehPremium?: boolean;
  canaisPublicacao?: string[];
  statusLegal?: string;
  observacoesLegais?: string;
  revisorHumano?: string;
  entidades?: { chave: ChaveEntidade; papel: string }[];
  checagens?: { urlFonte: string; statusVerificacao: string }[];
};

const p = (...paragrafos: string[]) => paragrafos.map((texto) => `<p>${texto}</p>`).join("");

export const ARTIGOS: ArtigoSeed[] = [
  {
    chave: "infraestrutura-governanca",
    titulo: "Pacote de infraestrutura pressiona estados a elevar a governança de projetos",
    slug: "pacote-infraestrutura-governanca-projetos",
    resumo: "Nova carteira de investimentos combina repasses, indicadores de desempenho e transparência para acelerar entregas.",
    corpoTexto:
      p(
        "O novo pacote de investimentos em infraestrutura pressiona estados e municípios a profissionalizar o acompanhamento de entregas. A proposta combina repasses, indicadores de desempenho e um painel público de monitoramento para reduzir atrasos e ampliar a transparência.",
        "Gestores ouvidos pela reportagem afirmam que a principal novidade está na governança: cada projeto nasce com metas, riscos mapeados e gatilhos de reprogramação. Isso melhora a leitura sobre custo, prazo e impacto social.",
        "O desafio, segundo especialistas, é manter equipes técnicas estáveis para que o monitoramento não dependa de cada troca de gestão."
      ) +
      "<h2>O que muda para os municípios</h2>" +
      p("Prefeituras menores tendem a precisar de apoio técnico para cumprir as novas exigências de planejamento e prestação de contas."),
    categoria: "gestao-publica",
    status: "publicado",
    autor: "editor",
    publicadoHaHoras: 20,
    visualizacoes: 1842,
    urlImagemOg: img("1486406146926-c627a92ad1ab"),
    estado: "DF",
    regiao: "Nacional",
    canaisPublicacao: ["portal", "newsletter"],
    statusLegal: "aprovado",
    entidades: [{ chave: "lula", papel: "Mencionado" }],
    checagens: [{ urlFonte: "https://www.gov.br/", statusVerificacao: "verificado" }],
  },
  {
    chave: "rastreabilidade-industria",
    titulo: "Rastreabilidade vira critério de financiamento na indústria exportadora",
    slug: "rastreabilidade-criterio-financiamento-industria-exportadora",
    resumo: "Companhias com dados mais confiáveis ganham vantagem em auditoria, financiamento e acesso a mercados.",
    corpoTexto: p(
      "Empresas industriais aceleraram projetos de rastreabilidade depois que financiamento e exportação passaram a depender de evidências mais robustas de origem, energia e conformidade. O tema saiu da prateleira regulatória e virou agenda de margem e reputação.",
      "O desafio agora é padronizar a troca de dados entre fornecedores, operação e auditoria. Sem interoperabilidade, boa parte do valor da rastreabilidade se perde na execução.",
      "Consultorias do setor recomendam começar pelos elos mais críticos da cadeia e expandir o modelo de forma gradual."
    ),
    categoria: "economia",
    status: "publicado",
    autor: "reporter",
    publicadoHaHoras: 30,
    visualizacoes: 973,
    urlImagemOg: img("1565008447742-97f6f38c985c"),
    estado: "SP",
    regiao: "Sudeste",
    ehPremium: true,
    statusLegal: "aprovado",
  },
  {
    chave: "marco-compras-digitais",
    titulo: "Senado conclui votação de marco para compras públicas digitais",
    slug: "senado-marco-compras-publicas-digitais",
    resumo: "Texto define regras para contratação de software como serviço e cria critérios de interoperabilidade.",
    corpoTexto: p(
      "O plenário concluiu a votação de um marco para compras públicas de tecnologia, com regras específicas para contratação de software como serviço e serviços em nuvem.",
      "O texto prevê critérios mínimos de interoperabilidade, portabilidade de dados e planos de saída, para evitar dependência excessiva de um único fornecedor.",
      "A proposta segue agora para a etapa seguinte de tramitação, onde pode receber ajustes de redação."
    ),
    categoria: "legislativo",
    status: "publicado",
    autor: "editor",
    publicadoHaHoras: 6,
    visualizacoes: 655,
    urlImagemOg: img("1450101499163-c8848c66ca85"),
    estado: "DF",
    regiao: "Nacional",
    statusLegal: "aprovado",
  },
  {
    chave: "metas-climaticas-planos-diretores",
    titulo: "Cidades adotam metas climáticas na revisão de planos diretores",
    slug: "cidades-metas-climaticas-planos-diretores",
    resumo: "Drenagem, arborização e uso do solo passam a ser tratados como política de adaptação climática.",
    corpoTexto: p(
      "Prefeituras que revisam seus planos diretores passaram a incluir metas de adaptação climática, com foco em drenagem, arborização e ocupação de áreas de risco.",
      "A mudança aproxima o planejamento urbano da gestão de riscos e cria indicadores que podem orientar investimentos nos próximos anos.",
      "Para urbanistas, o teste real virá na execução: metas precisam de orçamento e acompanhamento contínuo."
    ),
    categoria: "sustentabilidade",
    status: "publicado",
    autor: "admin",
    publicadoHaHoras: 50,
    visualizacoes: 412,
    urlImagemOg: img("1449824913935-59a10b8d2000"),
    estado: "PE",
    regiao: "Nordeste",
    statusLegal: "aprovado",
  },
  {
    chave: "julgamento-transparencia-agendado",
    titulo: "Tribunal deve retomar julgamento sobre transparência de emendas",
    slug: "tribunal-retoma-julgamento-transparencia-emendas",
    resumo: "Matéria agendada: só deve aparecer no portal na data de publicação programada.",
    corpoTexto: p(
      "Esta matéria de exemplo está publicada com data futura, para demonstrar o agendamento de publicação.",
      "Enquanto a data não chegar, ela não deve aparecer no portal, no sitemap nem nas APIs públicas."
    ),
    categoria: "judiciario",
    status: "publicado",
    autor: "editor",
    publicadoHaHoras: -48,
    urlImagemOg: img("1455390582262-044cdead277a"),
    estado: "DF",
    regiao: "Nacional",
    statusLegal: "aprovado",
  },
  {
    chave: "pauta-reforma-tributaria-municipios",
    titulo: "Pauta: impacto da reforma tributária na arrecadação dos municípios",
    slug: "pauta-reforma-tributaria-arrecadacao-municipios",
    resumo: "Levantar simulações de secretarias de fazenda e ouvir entidades municipalistas.",
    corpoTexto: p(
      "Sugestão de pauta: comparar simulações de arrecadação de diferentes portes de município e ouvir entidades municipalistas sobre a transição."
    ),
    categoria: "economia",
    status: "pauta",
    autor: "reporter",
    urlImagemOg: img("1554224155-6726b3ff858f"),
    estado: "DF",
    regiao: "Nacional",
  },
  {
    chave: "apuracao-consorcios-saude",
    titulo: "Consórcios de saúde ampliam compras conjuntas no Nordeste",
    slug: "consorcios-saude-compras-conjuntas-nordeste",
    resumo: "Em apuração: confirmar volume de compras e economia obtida com os consórcios.",
    corpoTexto: p(
      "Em apuração. Consórcios intermunicipais de saúde estariam ampliando compras conjuntas de medicamentos e insumos.",
      "Próximos passos: confirmar dados com as secretarias e ouvir gestores de ao menos dois consórcios."
    ),
    categoria: "gestao-publica",
    status: "apuracao",
    autor: "reporter",
    urlImagemOg: img("1576091160399-112ba8d25d1d"),
    estado: "BA",
    regiao: "Nordeste",
  },
  {
    chave: "redacao-diplomacia-comercial",
    titulo: "Diplomacia comercial busca novos mercados na Ásia",
    slug: "diplomacia-comercial-novos-mercados-asia",
    resumo: "Missões comerciais priorizam agronegócio, tecnologia e serviços.",
    corpoTexto: p(
      "Missões comerciais recentes priorizaram agronegócio, tecnologia e serviços, em busca de diversificar a pauta exportadora.",
      "Texto em redação: falta incluir a visão de entidades exportadoras e o contexto da balança comercial."
    ),
    categoria: "internacional",
    status: "redacao",
    autor: "editor",
    urlImagemOg: img("1500937386664-56d1dfef3854"),
    estado: "DF",
    regiao: "Nacional",
  },
  {
    chave: "revisao-consorcio-nuvem",
    titulo: "Consórcio regional para compras de nuvem avança entre governadores",
    slug: "consorcio-regional-compras-nuvem-governadores",
    resumo: "Estados negociam padrões técnicos e compras cooperadas para reduzir custo e elevar a resiliência digital.",
    corpoTexto: p(
      "Governadores discutem um consórcio para compras de nuvem, observabilidade e cibersegurança. A leitura é que contratos cooperados podem reduzir o custo unitário e elevar a resiliência de serviços digitais críticos.",
      "O debate ainda passa por governança, autonomia estadual e definição de lotes técnicos. Se der certo, o modelo pode virar referência para compras conjuntas em outras frentes do governo digital."
    ),
    categoria: "executivo",
    status: "revisao",
    autor: "admin",
    urlImagemOg: img("1551288049-bebda4e38f71"),
    estado: "GO",
    regiao: "Centro-Oeste",
    entidades: [{ chave: "tarcisio", papel: "Mencionado" }],
  },
  {
    chave: "juridico-contratos-limpeza",
    titulo: "Investigação sobre contratos de limpeza urbana chega à fase de depoimentos",
    slug: "investigacao-contratos-limpeza-urbana-depoimentos",
    resumo: "Matéria sensível aguardando revisão jurídica antes da publicação.",
    corpoTexto: p(
      "Exemplo de matéria em revisão jurídica: o texto cita uma investigação em andamento e precisa de validação antes de ir ao ar.",
      "Os nomes de empresas e pessoas foram omitidos neste exemplo."
    ),
    categoria: "judiciario",
    status: "juridico",
    autor: "reporter",
    urlImagemOg: img("1563986768609-322da13575f3"),
    estado: "RJ",
    regiao: "Sudeste",
    statusLegal: "pendente",
    observacoesLegais: "Confirmar com a assessoria jurídica a menção a investigados antes de publicar.",
  },
  {
    chave: "arquivado-balanco-semestre",
    titulo: "Balanço do semestre legislativo (cobertura especial encerrada)",
    slug: "balanco-semestre-legislativo",
    resumo: "Cobertura especial arquivada.",
    corpoTexto: p("Exemplo de matéria arquivada: fica fora do Kanban e do portal, mas continua no histórico do ERP."),
    categoria: "legislativo",
    status: "arquivado",
    autor: "admin",
    urlImagemOg: img("1529107386315-e1a2ed48a620"),
    estado: "DF",
    regiao: "Nacional",
  },
];

// ---------------------------------------------------------------------------
// Anúncios-modelo (apontam para o mídia kit de exemplo)
// ---------------------------------------------------------------------------

const LINK_MIDIA_KIT = "/midia-kit/revista-gestao";

export const ANUNCIOS = [
  { chave: "banner-topo", titulo: "Modelo - Banner institucional topo", imagemUrl: img("1486406146926-c627a92ad1ab"), linkUrl: LINK_MIDIA_KIT, altText: "Banner institucional da Revista Gestão", tamanho: "banner_largo", paginas: ["home", "noticia", "revista"], posicoes: ["topo"], ativo: true, prioridade: 100 },
  { chave: "quadrado-lateral", titulo: "Modelo - Quadrado lateral", imagemUrl: img("1551288049-bebda4e38f71", 1200), linkUrl: LINK_MIDIA_KIT, altText: "Anúncio quadrado para a coluna lateral", tamanho: "quadrado", paginas: ["home", "categoria", "revista"], posicoes: ["lateral"], ativo: true, prioridade: 80 },
  { chave: "banner-meio", titulo: "Modelo - Banner horizontal meio", imagemUrl: img("1497366754035-f200968a6e72"), linkUrl: LINK_MIDIA_KIT, altText: "Banner horizontal para área intermediária", tamanho: "banner_horizontal", paginas: ["home", "categoria", "noticia", "revista"], posicoes: ["meio"], ativo: true, prioridade: 60 },
  { chave: "quadrado-apoio", titulo: "Modelo - Quadrado de apoio", imagemUrl: img("1520607162513-77705c0f0d4a", 1000), linkUrl: LINK_MIDIA_KIT, altText: "Anúncio quadrado para campanhas menores", tamanho: "quadrado", paginas: ["home", "categoria"], posicoes: ["meio", "feed", "lateral"], ativo: false, prioridade: 40 },
  { chave: "vertical-noticia", titulo: "Modelo - Vertical em notícia", imagemUrl: img("1460925895917-afdab827c52f", 900), linkUrl: LINK_MIDIA_KIT, altText: "Anúncio vertical para páginas de notícia", tamanho: "vertical", paginas: ["revista"], posicoes: ["meio", "apos_imagem", "lateral"], ativo: false, prioridade: 20 },
];

// ---------------------------------------------------------------------------
// Mídia kit de exemplo (publicado em /midia-kit/revista-gestao)
// ---------------------------------------------------------------------------

export const MIDIA_KIT = {
  nome: "Mídia Kit Revista Gestão",
  slug: "revista-gestao",
  tema: {
    primaryColor: "#b91c1c",
    secondaryColor: "#0f172a",
    backgroundColor: "#ffffff",
    textColor: "#0f172a",
  } satisfies MediaKitTheme,
  secoes: [
    {
      tipo: "hero",
      titulo: "Hero",
      data: {
        title: "Anuncie para quem decide",
        subtitle: "Jornalismo político e de gestão pública para executivos, gestores e tomadores de decisão.",
        backgroundImage: img("1497366754035-f200968a6e72"),
        ctaText: "Fale com o comercial",
        ctaLink: "#contato",
      } satisfies MediaKitHeroData,
    },
    {
      tipo: "about",
      titulo: "Sobre",
      data: {
        title: "Sobre a Revista Gestão",
        content: "Cobertura das esferas Executiva, Legislativa e Judiciária, com foco em gestão pública, economia e políticas que afetam empresas e governos.",
        imageUrl: img("1552664730-d307ca884978", 1200),
      } satisfies MediaKitAboutData,
    },
    {
      tipo: "stats",
      titulo: "Números",
      data: {
        title: "Audiência (dados ilustrativos)",
        items: [
          { value: "120", suffix: "mil", label: "leitores únicos por mês" },
          { value: "35", suffix: "mil", label: "assinantes da newsletter" },
          { value: "4", suffix: "min", label: "tempo médio de leitura" },
        ],
      } satisfies MediaKitStatsData,
    },
    {
      tipo: "advertising",
      titulo: "Formatos",
      data: {
        title: "Formatos de anúncio",
        subtitle: "Valores ilustrativos para demonstração.",
        items: [
          { id: "banner", modalidade: "Banner no topo", descricao: "Exibição em destaque na home e nas notícias.", preco: "Sob consulta", destaque: true },
          { id: "newsletter", modalidade: "Newsletter", descricao: "Bloco patrocinado na edição diária.", preco: "Sob consulta", destaque: false },
          { id: "conteudo", modalidade: "Conteúdo patrocinado", descricao: "Matéria especial identificada como publicidade.", preco: "Sob consulta", destaque: false },
        ],
      } satisfies MediaKitAdvertisingData,
    },
    {
      tipo: "contact",
      titulo: "Contato",
      data: {
        title: "Fale com o comercial",
        email: "comercial@example.com",
        phone: "(61) 90000-0000",
        address: "Brasília - DF",
      } satisfies MediaKitContactData,
    },
  ],
} as const;
