/**
 * Edição 2 da revista (conteúdo de exemplo), portada do antigo
 * prisma/revista_edicao_2.sql com acentuação corrigida.
 */
import type { SlugCategoria } from "./conteudo";

export const REVISTA_EDICAO_2 = {
  titulo: "Edição 2",
  edicao: "2",
  descricao:
    "Segunda edição da Revista Gestão, com reportagens sobre gestão pública, economia, tecnologia, política e inovação.",
  capaUrl: "https://images.unsplash.com/photo-1495020689067-958852a7765e?auto=format&fit=crop&w=1200&q=80",
};

type ArtigoRevista = {
  titulo: string;
  slug: string;
  resumo: string;
  paragrafos: [string, string, string];
  imagem: string;
  estado: string;
  regiao: string;
  categoria: SlugCategoria;
};

export const ARTIGOS_EDICAO_2: ArtigoRevista[] = [
  {
    titulo: "Governança digital entra na fase de maturidade nos estados",
    slug: "revista-edicao-2-governanca-digital-estados",
    resumo: "Estados reorganizam estruturas digitais para integrar serviços, dados e atendimento ao cidadão.",
    paragrafos: [
      "A transformação digital deixou de ser uma vitrine de aplicativos isolados e passou a depender de governança, padrões de dados e continuidade administrativa.",
      "Na prática, as secretarias buscam reduzir retrabalho, integrar bases e transformar a experiência do cidadão em indicador de desempenho.",
      "Especialistas apontam que o próximo salto depende menos de novas plataformas e mais de coordenação entre equipes técnicas, gestores e áreas finalísticas.",
    ],
    imagem: "1497366754035-f200968a6e72",
    estado: "DF",
    regiao: "Nacional",
    categoria: "gestao-publica",
  },
  {
    titulo: "Cidades médias disputam investimentos com estratégia regional",
    slug: "revista-edicao-2-cidades-medias-investimentos",
    resumo: "Municípios fora dos grandes centros criam agendas de competitividade para atrair empresas e empregos qualificados.",
    paragrafos: [
      "Cidades médias passaram a disputar investimentos com uma estratégia mais profissional, baseada em infraestrutura, formação de mão de obra e segurança jurídica.",
      "O movimento mostra que desenvolvimento local exige articulação entre prefeitura, setor produtivo, universidades e governos estaduais.",
      "Quando essa rede funciona, a cidade deixa de vender apenas terreno barato e passa a oferecer ambiente de negócios.",
    ],
    imagem: "1486406146926-c627a92ad1ab",
    estado: "SP",
    regiao: "Sudeste",
    categoria: "economia",
  },
  {
    titulo: "Nova agenda fiscal pressiona gestores a medir resultado",
    slug: "revista-edicao-2-agenda-fiscal-resultados",
    resumo: "Com orçamentos mais apertados, governos buscam indicadores para proteger programas eficientes.",
    paragrafos: [
      "A pressão fiscal colocou a avaliação de políticas públicas no centro da gestão. Programas sem indicadores claros tendem a perder espaço.",
      "Secretarias de fazenda e planejamento procuram evidências para separar gastos essenciais, projetos prioritários e iniciativas que precisam ser redesenhadas.",
      "O desafio é criar métricas simples o bastante para orientar decisões e robustas o suficiente para evitar leituras distorcidas.",
    ],
    imagem: "1554224155-6726b3ff858f",
    estado: "DF",
    regiao: "Nacional",
    categoria: "economia",
  },
  {
    titulo: "Inteligência artificial vira ferramenta de triagem no setor público",
    slug: "revista-edicao-2-ia-triagem-setor-publico",
    resumo: "Órgãos públicos testam IA para organizar demandas, reduzir filas e apoiar decisões administrativas.",
    paragrafos: [
      "A inteligência artificial começa a entrar no setor público por tarefas de triagem, classificação e apoio operacional.",
      "O ganho imediato está na velocidade de leitura de documentos e na organização de demandas repetitivas, mas a adoção exige cuidado com vieses e auditoria.",
      "Governos que avançam com responsabilidade combinam experimentação, controle humano e regras claras de transparência.",
    ],
    imagem: "1677442136019-21780ecad995",
    estado: "MG",
    regiao: "Sudeste",
    categoria: "gestao-publica",
  },
  {
    titulo: "Educação profissional ganha peso na política industrial",
    slug: "revista-edicao-2-educacao-profissional-politica-industrial",
    resumo: "Formação técnica volta ao centro das discussões sobre produtividade, renda e inovação.",
    paragrafos: [
      "A política industrial contemporânea depende cada vez mais da capacidade de formar profissionais técnicos em ritmo compatível com a mudança tecnológica.",
      "Empresas relatam dificuldade para preencher vagas em automação, dados, manutenção avançada e segurança digital.",
      "Para governos, a resposta passa por currículos flexíveis, parcerias locais e monitoramento constante da demanda regional.",
    ],
    imagem: "1522202176988-66273c2fd55f",
    estado: "PR",
    regiao: "Sul",
    categoria: "economia",
  },
  {
    titulo: "Infraestrutura verde entra no planejamento urbano",
    slug: "revista-edicao-2-infraestrutura-verde-planejamento-urbano",
    resumo: "Projetos de drenagem, arborização e parques lineares passam a ser vistos como investimento em resiliência.",
    paragrafos: [
      "Eventos climáticos extremos tornaram a infraestrutura verde uma pauta de gestão urbana, não apenas ambiental.",
      "Cidades que combinam drenagem, recuperação de áreas degradadas e corredores verdes conseguem reduzir riscos e melhorar a qualidade de vida.",
      "O obstáculo segue sendo transformar projetos pontuais em carteira permanente de investimento.",
    ],
    imagem: "1449824913935-59a10b8d2000",
    estado: "PE",
    regiao: "Nordeste",
    categoria: "sustentabilidade",
  },
  {
    titulo: "Compras públicas buscam equilíbrio entre preço e inovação",
    slug: "revista-edicao-2-compras-publicas-inovacao",
    resumo: "Novas modelagens tentam evitar que a administração compre barato e receba soluções defasadas.",
    paragrafos: [
      "Compras públicas orientadas apenas pelo menor preço podem comprometer qualidade, manutenção e inovação.",
      "Gestores passaram a estudar critérios técnicos, provas de conceito e contratos com metas de desempenho para reduzir esse risco.",
      "A maturidade do processo exige equipes capacitadas e planejamento antes da licitação.",
    ],
    imagem: "1450101499163-c8848c66ca85",
    estado: "GO",
    regiao: "Centro-Oeste",
    categoria: "gestao-publica",
  },
  {
    titulo: "Segurança cibernética deixa de ser tema apenas técnico",
    slug: "revista-edicao-2-seguranca-cibernetica-gestao",
    resumo: "Ataques digitais elevam a cibersegurança ao nível de risco institucional para governos e empresas.",
    paragrafos: [
      "A segurança cibernética saiu da sala técnica e chegou aos gabinetes de decisão.",
      "Incidentes recentes mostram que continuidade de serviços, reputação e proteção de dados dependem de governança e investimento recorrente.",
      "Planos de resposta, treinamento e inventário de sistemas são hoje medidas básicas de gestão.",
    ],
    imagem: "1563986768609-322da13575f3",
    estado: "RJ",
    regiao: "Sudeste",
    categoria: "gestao-publica",
  },
  {
    titulo: "Saúde pública aposta em dados para antecipar gargalos",
    slug: "revista-edicao-2-saude-publica-dados",
    resumo: "Redes de saúde usam informação integrada para prever demanda e reorganizar o atendimento.",
    paragrafos: [
      "A gestão da saúde pública depende cada vez mais de dados oportunos para planejar equipes, leitos e fluxos de atendimento.",
      "Quando informações de atenção básica, urgência e regulação conversam, gestores conseguem antecipar gargalos.",
      "O desafio está em padronizar registros e transformar painéis em decisões operacionais.",
    ],
    imagem: "1576091160399-112ba8d25d1d",
    estado: "BA",
    regiao: "Nordeste",
    categoria: "gestao-publica",
  },
  {
    titulo: "Concessões regionais ganham novo desenho financeiro",
    slug: "revista-edicao-2-concessoes-regionais-financeiro",
    resumo: "Modelos híbridos tentam viabilizar projetos menores sem perder atratividade para investidores.",
    paragrafos: [
      "Concessões regionais exigem modelagens financeiras diferentes das grandes carteiras nacionais.",
      "Projetos menores dependem de garantias, agrupamento inteligente de ativos e indicadores de demanda realistas.",
      "O desenho adequado pode destravar investimentos em saneamento, transporte, iluminação e equipamentos urbanos.",
    ],
    imagem: "1503387762-592deb58ef4e",
    estado: "SC",
    regiao: "Sul",
    categoria: "economia",
  },
  {
    titulo: "Gestão de pessoas vira prioridade na transformação pública",
    slug: "revista-edicao-2-gestao-pessoas-transformacao-publica",
    resumo: "Capacitação, liderança e cultura organizacional aparecem como fatores decisivos para modernizar governos.",
    paragrafos: [
      "Modernizar sistemas sem preparar pessoas costuma produzir ganhos limitados.",
      "Por isso, governos passaram a tratar a gestão de pessoas como eixo da transformação pública, com foco em liderança, capacitação e colaboração.",
      "A mudança cultural exige tempo, mas define se novas ferramentas viram rotina ou apenas projeto-piloto.",
    ],
    imagem: "1552664730-d307ca884978",
    estado: "DF",
    regiao: "Nacional",
    categoria: "gestao-publica",
  },
  {
    titulo: "Agronegócio amplia rastreabilidade para atender mercados externos",
    slug: "revista-edicao-2-agronegocio-rastreabilidade",
    resumo: "Produtores e cooperativas investem em dados de origem, conformidade ambiental e logística.",
    paragrafos: [
      "A rastreabilidade no agronegócio deixou de ser diferencial e passou a ser condição de acesso a mercados mais exigentes.",
      "Cooperativas, produtores e empresas de logística buscam integrar dados de origem, transporte e conformidade.",
      "O ganho esperado envolve redução de risco, melhor precificação e maior previsibilidade comercial.",
    ],
    imagem: "1500937386664-56d1dfef3854",
    estado: "MT",
    regiao: "Centro-Oeste",
    categoria: "economia",
  },
  {
    titulo: "Energia distribuída muda a relação entre consumidor e rede",
    slug: "revista-edicao-2-energia-distribuida-rede",
    resumo: "Expansão da geração distribuída exige novas regras de planejamento, compensação e investimento.",
    paragrafos: [
      "A energia distribuída alterou a forma como consumidores, empresas e redes elétricas interagem.",
      "Com mais geração local, distribuidoras precisam planejar capacidade, estabilidade e remuneração de investimentos.",
      "Para o consumidor, o tema combina economia, previsibilidade e participação mais ativa no sistema elétrico.",
    ],
    imagem: "1509391366360-2e959784a276",
    estado: "CE",
    regiao: "Nordeste",
    categoria: "sustentabilidade",
  },
  {
    titulo: "Turismo de negócios impulsiona centros urbanos fora do eixo tradicional",
    slug: "revista-edicao-2-turismo-negocios-centros-urbanos",
    resumo: "Eventos corporativos e agendas setoriais movimentam hotéis, serviços e economia local.",
    paragrafos: [
      "O turismo de negócios se tornou uma estratégia para cidades que buscam ocupar equipamentos urbanos e gerar receita fora da alta temporada.",
      "Eventos setoriais, feiras e encontros técnicos atraem público qualificado e fortalecem cadeias de serviços.",
      "Para funcionar, a estratégia depende de calendário, conectividade e promoção institucional.",
    ],
    imagem: "1511578314322-379afb476865",
    estado: "ES",
    regiao: "Sudeste",
    categoria: "economia",
  },
  {
    titulo: "Planejamento metropolitano tenta superar fronteiras administrativas",
    slug: "revista-edicao-2-planejamento-metropolitano",
    resumo: "Mobilidade, saneamento e habitação exigem coordenação entre municípios vizinhos.",
    paragrafos: [
      "Problemas metropolitanos raramente respeitam limites administrativos.",
      "Mobilidade, saneamento, drenagem e habitação exigem governança compartilhada entre municípios, estados e prestadores de serviço.",
      "Sem essa coordenação, investimentos isolados tendem a resolver apenas parte do problema.",
    ],
    imagem: "1518005020951-eccb494ad742",
    estado: "PA",
    regiao: "Norte",
    categoria: "executivo",
  },
  {
    titulo: "Indicadores sociais entram no centro da avaliação de obras",
    slug: "revista-edicao-2-indicadores-sociais-obras",
    resumo: "Projetos de infraestrutura passam a ser analisados por impacto social, não apenas prazo e custo.",
    paragrafos: [
      "A avaliação de obras públicas passou a incluir indicadores sociais com mais frequência.",
      "A pergunta central deixou de ser apenas se a obra terminou, mas se ela melhorou acesso, renda, segurança ou qualidade de vida.",
      "Esse olhar muda a priorização de projetos e exige acompanhamento após a entrega.",
    ],
    imagem: "1541888946425-d81bb19240f5",
    estado: "MG",
    regiao: "Sudeste",
    categoria: "executivo",
  },
  {
    titulo: "Economia criativa ganha espaço em políticas de desenvolvimento",
    slug: "revista-edicao-2-economia-criativa-desenvolvimento",
    resumo: "Cultura, tecnologia e empreendedorismo local formam nova agenda de desenvolvimento urbano.",
    paragrafos: [
      "A economia criativa ganhou relevância em agendas de desenvolvimento que buscam diversificar a base econômica local.",
      "Espaços culturais, tecnologia, audiovisual, design e gastronomia podem gerar emprego e identidade territorial.",
      "O desafio é estruturar políticas que conectem talento, financiamento e mercado.",
    ],
    imagem: "1519389950473-47ba0277781c",
    estado: "PE",
    regiao: "Nordeste",
    categoria: "economia",
  },
  {
    titulo: "Transporte público testa modelos de financiamento mais flexíveis",
    slug: "revista-edicao-2-transporte-publico-financiamento",
    resumo: "Queda de passageiros e custo operacional pressionam cidades a repensar contratos e subsídios.",
    paragrafos: [
      "O transporte público enfrenta uma combinação de queda de demanda, custo elevado e exigência de qualidade.",
      "Cidades estudam modelos de financiamento que combinam tarifa, subsídio, receitas acessórias e metas de desempenho.",
      "Sem previsibilidade financeira, a renovação de frota e a melhoria do serviço ficam comprometidas.",
    ],
    imagem: "1544620347-c4fd4a3d5957",
    estado: "RS",
    regiao: "Sul",
    categoria: "executivo",
  },
  {
    titulo: "Gestores buscam linguagem simples para melhorar serviços",
    slug: "revista-edicao-2-linguagem-simples-servicos",
    resumo: "Comunicação clara reduz erros, melhora o atendimento e facilita o acesso a direitos.",
    paragrafos: [
      "A linguagem simples virou ferramenta de gestão pública ao reduzir barreiras entre governo e cidadão.",
      "Formulários, portais e comunicados claros diminuem retrabalho, chamadas de suporte e interpretações equivocadas.",
      "O ganho é operacional e democrático: serviços ficam mais eficientes e mais acessíveis.",
    ],
    imagem: "1455390582262-044cdead277a",
    estado: "DF",
    regiao: "Nacional",
    categoria: "direitos-civis",
  },
  {
    titulo: "Consórcios públicos assumem papel estratégico em projetos regionais",
    slug: "revista-edicao-2-consorcios-publicos-projetos-regionais",
    resumo: "Associações entre municípios ganham escala para compras, serviços e planejamento territorial.",
    paragrafos: [
      "Consórcios públicos voltaram a ganhar espaço como instrumento para problemas que ultrapassam a capacidade de um único município.",
      "Compras compartilhadas, serviços especializados e projetos regionais conseguem escala e melhor governança quando bem estruturados.",
      "A chave está em regras claras, transparência e capacidade técnica permanente.",
    ],
    imagem: "1529107386315-e1a2ed48a620",
    estado: "GO",
    regiao: "Centro-Oeste",
    categoria: "executivo",
  },
];
