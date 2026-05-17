do $$
begin
  if not exists (select 1 from public.usuarios limit 1) then
    raise exception 'Cadastre pelo menos um usuario antes de inserir a revista.';
  end if;
end $$;

insert into public.revistas (
  id,
  titulo,
  descricao,
  edicao,
  data_publicacao,
  capa_url,
  created_at,
  updated_at
)
values (
  '9b4e8e3c-4db8-4c6f-91f9-56f71f3e0202',
  'Edicao 2',
  'Segunda edicao da Revista Gestao, com reportagens sobre gestao publica, economia, tecnologia, politica e inovacao.',
  '2',
  now(),
  'https://images.unsplash.com/photo-1495020689067-958852a7765e?auto=format&fit=crop&w=1200&q=80',
  now(),
  now()
)
on conflict (id) do update
set
  titulo = excluded.titulo,
  descricao = excluded.descricao,
  edicao = excluded.edicao,
  data_publicacao = excluded.data_publicacao,
  capa_url = excluded.capa_url,
  updated_at = now();

with base as (
  select
    '9b4e8e3c-4db8-4c6f-91f9-56f71f3e0202'::uuid as revista_id,
    (
      select u.id
      from public.usuarios u
      order by
        case when u.tipo_conta in ('erp', 'misto') then 0 else 1 end,
        u.criado_em asc
      limit 1
    ) as autor_id,
    (
      select c.id
      from public.categorias c
      order by c.nome asc
      limit 1
    ) as categoria_id
),
artigos (
  id,
  titulo,
  slug,
  resumo,
  corpo_texto,
  url_imagem_og,
  ordem_revista,
  estado,
  regiao
) as (
  values
    (
      '9b4e8e3c-4db8-4c6f-91f9-56f71f3e0211'::uuid,
      'Governanca digital entra na fase de maturidade nos estados',
      'revista-edicao-2-governanca-digital-estados',
      'Estados reorganizam estruturas digitais para integrar servicos, dados e atendimento ao cidadao.',
      '<p>A transformacao digital deixou de ser uma vitrine de aplicativos isolados e passou a depender de governanca, padroes de dados e continuidade administrativa.</p><p>Na pratica, as secretarias buscam reduzir retrabalho, integrar bases e transformar a experiencia do cidadao em indicador de desempenho.</p><p>Especialistas apontam que o proximo salto depende menos de novas plataformas e mais de coordencao entre equipes tecnicas, gestores e areas finalisticas.</p>',
      'https://images.unsplash.com/photo-1497366754035-f200968a6e72?auto=format&fit=crop&w=1600&q=80',
      1,
      'DF',
      'Nacional'
    ),
    (
      '9b4e8e3c-4db8-4c6f-91f9-56f71f3e0212'::uuid,
      'Cidades medias disputam investimentos com estrategia regional',
      'revista-edicao-2-cidades-medias-investimentos',
      'Municipios fora dos grandes centros criam agendas de competitividade para atrair empresas e empregos qualificados.',
      '<p>Cidades medias passaram a disputar investimentos com uma estrategia mais profissional, baseada em infraestrutura, formacao de mao de obra e seguranca juridica.</p><p>O movimento mostra que desenvolvimento local exige articulacao entre prefeitura, setor produtivo, universidades e governos estaduais.</p><p>Quando essa rede funciona, a cidade deixa de vender apenas terreno barato e passa a oferecer ambiente de negocios.</p>',
      'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=1600&q=80',
      2,
      'SP',
      'Sudeste'
    ),
    (
      '9b4e8e3c-4db8-4c6f-91f9-56f71f3e0213'::uuid,
      'Nova agenda fiscal pressiona gestores a medir resultado',
      'revista-edicao-2-agenda-fiscal-resultados',
      'Com orcamentos mais apertados, governos buscam indicadores para proteger programas eficientes.',
      '<p>A pressao fiscal colocou a avaliacao de politicas publicas no centro da gestao. Programas sem indicadores claros tendem a perder espaco.</p><p>Secretarias de fazenda e planejamento procuram evidencias para separar gastos essenciais, projetos prioritarios e iniciativas que precisam ser redesenhadas.</p><p>O desafio e criar metricas simples o bastante para orientar decisoes e robustas o suficiente para evitar leitura distorcida.</p>',
      'https://images.unsplash.com/photo-1554224155-6726b3ff858f?auto=format&fit=crop&w=1600&q=80',
      3,
      'DF',
      'Nacional'
    ),
    (
      '9b4e8e3c-4db8-4c6f-91f9-56f71f3e0214'::uuid,
      'Inteligencia artificial vira ferramenta de triagem no setor publico',
      'revista-edicao-2-ia-triagem-setor-publico',
      'Orgaos publicos testam IA para organizar demandas, reduzir filas e apoiar decisoes administrativas.',
      '<p>A inteligencia artificial comeca a entrar no setor publico por tarefas de triagem, classificacao e apoio operacional.</p><p>O ganho imediato esta na velocidade de leitura de documentos e na organizacao de demandas repetitivas, mas a adocao exige cuidado com vieses e auditoria.</p><p>Governos que avancam com responsabilidade combinam experimentacao, controle humano e regras claras de transparencia.</p>',
      'https://images.unsplash.com/photo-1677442136019-21780ecad995?auto=format&fit=crop&w=1600&q=80',
      4,
      'MG',
      'Sudeste'
    ),
    (
      '9b4e8e3c-4db8-4c6f-91f9-56f71f3e0215'::uuid,
      'Educacao profissional ganha peso na politica industrial',
      'revista-edicao-2-educacao-profissional-politica-industrial',
      'Formacao tecnica volta ao centro das discussoes sobre produtividade, renda e inovacao.',
      '<p>A politica industrial contemporanea depende cada vez mais da capacidade de formar profissionais tecnicos em ritmo compativel com a mudanca tecnologica.</p><p>Empresas relatam dificuldade para preencher vagas em automacao, dados, manutencao avancada e seguranca digital.</p><p>Para governos, a resposta passa por curriculos flexiveis, parcerias locais e monitoramento constante da demanda regional.</p>',
      'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=1600&q=80',
      5,
      'PR',
      'Sul'
    ),
    (
      '9b4e8e3c-4db8-4c6f-91f9-56f71f3e0216'::uuid,
      'Infraestrutura verde entra no planejamento urbano',
      'revista-edicao-2-infraestrutura-verde-planejamento-urbano',
      'Projetos de drenagem, arborizacao e parques lineares passam a ser vistos como investimento em resiliencia.',
      '<p>Eventos climaticos extremos tornaram a infraestrutura verde uma pauta de gestao urbana, nao apenas ambiental.</p><p>Cidades que combinam drenagem, recuperacao de areas degradadas e corredores verdes conseguem reduzir riscos e melhorar qualidade de vida.</p><p>O obstaculo segue sendo transformar projetos pontuais em carteira permanente de investimento.</p>',
      'https://images.unsplash.com/photo-1449824913935-59a10b8d2000?auto=format&fit=crop&w=1600&q=80',
      6,
      'PE',
      'Nordeste'
    ),
    (
      '9b4e8e3c-4db8-4c6f-91f9-56f71f3e0217'::uuid,
      'Compras publicas buscam equilibrio entre preco e inovacao',
      'revista-edicao-2-compras-publicas-inovacao',
      'Novas modelagens tentam evitar que a administracao compre barato e receba solucoes defasadas.',
      '<p>Compras publicas orientadas apenas pelo menor preco podem comprometer qualidade, manutencao e inovacao.</p><p>Gestores passaram a estudar criterios tecnicos, provas de conceito e contratos com metas de desempenho para reduzir esse risco.</p><p>A maturidade do processo exige equipes capacitadas e planejamento antes da licitacao.</p>',
      'https://images.unsplash.com/photo-1450101499163-c8848c66ca85?auto=format&fit=crop&w=1600&q=80',
      7,
      'GO',
      'Centro-Oeste'
    ),
    (
      '9b4e8e3c-4db8-4c6f-91f9-56f71f3e0218'::uuid,
      'Seguranca cibernetica deixa de ser tema apenas tecnico',
      'revista-edicao-2-seguranca-cibernetica-gestao',
      'Ataques digitais elevam a ciberseguranca ao nivel de risco institucional para governos e empresas.',
      '<p>A seguranca cibernetica saiu da sala tecnica e chegou aos gabinetes de decisao.</p><p>Incidentes recentes mostram que continuidade de servicos, reputacao e protecao de dados dependem de governanca e investimento recorrente.</p><p>Planos de resposta, treinamento e inventario de sistemas sao hoje medidas basicas de gestao.</p>',
      'https://images.unsplash.com/photo-1563986768609-322da13575f3?auto=format&fit=crop&w=1600&q=80',
      8,
      'RJ',
      'Sudeste'
    ),
    (
      '9b4e8e3c-4db8-4c6f-91f9-56f71f3e0219'::uuid,
      'Saude publica aposta em dados para antecipar gargalos',
      'revista-edicao-2-saude-publica-dados',
      'Redes de saude usam informacao integrada para prever demanda e reorganizar atendimento.',
      '<p>A gestao da saude publica depende cada vez mais de dados oportunos para planejar equipes, leitos e fluxos de atendimento.</p><p>Quando informacoes de atencao basica, urgencia e regulacao conversam, gestores conseguem antecipar gargalos.</p><p>O desafio esta em padronizar registros e transformar paineis em decisoes operacionais.</p>',
      'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&w=1600&q=80',
      9,
      'BA',
      'Nordeste'
    ),
    (
      '9b4e8e3c-4db8-4c6f-91f9-56f71f3e0220'::uuid,
      'Concessoes regionais ganham novo desenho financeiro',
      'revista-edicao-2-concessoes-regionais-financeiro',
      'Modelos hibridos tentam viabilizar projetos menores sem perder atratividade para investidores.',
      '<p>Concessoes regionais exigem modelagens financeiras diferentes das grandes carteiras nacionais.</p><p>Projetos menores dependem de garantias, agrupamento inteligente de ativos e indicadores de demanda realistas.</p><p>O desenho adequado pode destravar investimentos em saneamento, transporte, iluminacao e equipamentos urbanos.</p>',
      'https://images.unsplash.com/photo-1503387762-592deb58ef4e?auto=format&fit=crop&w=1600&q=80',
      10,
      'SC',
      'Sul'
    ),
    (
      '9b4e8e3c-4db8-4c6f-91f9-56f71f3e0221'::uuid,
      'Gestao de pessoas vira prioridade na transformacao publica',
      'revista-edicao-2-gestao-pessoas-transformacao-publica',
      'Capacitacao, lideranca e cultura organizacional aparecem como fatores decisivos para modernizar governos.',
      '<p>Modernizar sistemas sem preparar pessoas costuma produzir ganhos limitados.</p><p>Por isso, governos passaram a tratar gestao de pessoas como eixo da transformacao publica, com foco em lideranca, capacitacao e colaboracao.</p><p>A mudanca cultural exige tempo, mas define se novas ferramentas viram rotina ou apenas projeto piloto.</p>',
      'https://images.unsplash.com/photo-1552664730-d307ca884978?auto=format&fit=crop&w=1600&q=80',
      11,
      'DF',
      'Nacional'
    ),
    (
      '9b4e8e3c-4db8-4c6f-91f9-56f71f3e0222'::uuid,
      'Agronegocio amplia rastreabilidade para atender mercados externos',
      'revista-edicao-2-agronegocio-rastreabilidade',
      'Produtores e cooperativas investem em dados de origem, conformidade ambiental e logistica.',
      '<p>A rastreabilidade no agronegocio deixou de ser diferencial e passou a condicao de acesso a mercados mais exigentes.</p><p>Cooperativas, produtores e empresas de logistica buscam integrar dados de origem, transporte e conformidade.</p><p>O ganho esperado envolve reducao de risco, melhor precificacao e maior previsibilidade comercial.</p>',
      'https://images.unsplash.com/photo-1500937386664-56d1dfef3854?auto=format&fit=crop&w=1600&q=80',
      12,
      'MT',
      'Centro-Oeste'
    ),
    (
      '9b4e8e3c-4db8-4c6f-91f9-56f71f3e0223'::uuid,
      'Energia distribuida muda relacao entre consumidor e rede',
      'revista-edicao-2-energia-distribuida-rede',
      'Expansao da geracao distribuida exige novas regras de planejamento, compensacao e investimento.',
      '<p>A energia distribuida alterou a forma como consumidores, empresas e redes eletricas interagem.</p><p>Com mais geracao local, distribuidoras precisam planejar capacidade, estabilidade e remuneracao de investimentos.</p><p>Para o consumidor, o tema combina economia, previsibilidade e participacao mais ativa no sistema eletrico.</p>',
      'https://images.unsplash.com/photo-1509391366360-2e959784a276?auto=format&fit=crop&w=1600&q=80',
      13,
      'CE',
      'Nordeste'
    ),
    (
      '9b4e8e3c-4db8-4c6f-91f9-56f71f3e0224'::uuid,
      'Turismo de negocios impulsiona centros urbanos fora do eixo tradicional',
      'revista-edicao-2-turismo-negocios-centros-urbanos',
      'Eventos corporativos e agendas setoriais movimentam hoteis, servicos e economia local.',
      '<p>O turismo de negocios se tornou uma estrategia para cidades que buscam ocupar equipamentos urbanos e gerar receita fora da alta temporada.</p><p>Eventos setoriais, feiras e encontros tecnicos atraem publico qualificado e fortalecem cadeias de servicos.</p><p>Para funcionar, a estrategia depende de calendario, conectividade e promocao institucional.</p>',
      'https://images.unsplash.com/photo-1511578314322-379afb476865?auto=format&fit=crop&w=1600&q=80',
      14,
      'ES',
      'Sudeste'
    ),
    (
      '9b4e8e3c-4db8-4c6f-91f9-56f71f3e0225'::uuid,
      'Planejamento metropolitano tenta superar fronteiras administrativas',
      'revista-edicao-2-planejamento-metropolitano',
      'Mobilidade, saneamento e habitacao exigem coordenacao entre municipios vizinhos.',
      '<p>Problemas metropolitanos raramente respeitam limites administrativos.</p><p>Mobilidade, saneamento, drenagem e habitacao exigem governanca compartilhada entre municipios, estados e prestadores de servico.</p><p>Sem essa coordenacao, investimentos isolados tendem a resolver apenas parte do problema.</p>',
      'https://images.unsplash.com/photo-1518005020951-eccb494ad742?auto=format&fit=crop&w=1600&q=80',
      15,
      'PA',
      'Norte'
    ),
    (
      '9b4e8e3c-4db8-4c6f-91f9-56f71f3e0226'::uuid,
      'Indicadores sociais entram no centro da avaliacao de obras',
      'revista-edicao-2-indicadores-sociais-obras',
      'Projetos de infraestrutura passam a ser analisados por impacto social, nao apenas prazo e custo.',
      '<p>A avaliacao de obras publicas passou a incluir indicadores sociais com mais frequencia.</p><p>A pergunta central deixou de ser apenas se a obra terminou, mas se ela melhorou acesso, renda, seguranca ou qualidade de vida.</p><p>Esse olhar muda a priorizacao de projetos e exige acompanhamento apos a entrega.</p>',
      'https://images.unsplash.com/photo-1541888946425-d81bb19240f5?auto=format&fit=crop&w=1600&q=80',
      16,
      'MG',
      'Sudeste'
    ),
    (
      '9b4e8e3c-4db8-4c6f-91f9-56f71f3e0227'::uuid,
      'Economia criativa ganha espaco em politicas de desenvolvimento',
      'revista-edicao-2-economia-criativa-desenvolvimento',
      'Cultura, tecnologia e empreendedorismo local formam nova agenda de desenvolvimento urbano.',
      '<p>A economia criativa ganhou relevancia em agendas de desenvolvimento que buscam diversificar a base economica local.</p><p>Espacos culturais, tecnologia, audiovisual, design e gastronomia podem gerar emprego e identidade territorial.</p><p>O desafio e estruturar politicas que conectem talento, financiamento e mercado.</p>',
      'https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&fit=crop&w=1600&q=80',
      17,
      'PE',
      'Nordeste'
    ),
    (
      '9b4e8e3c-4db8-4c6f-91f9-56f71f3e0228'::uuid,
      'Transporte publico testa modelos de financiamento mais flexiveis',
      'revista-edicao-2-transporte-publico-financiamento',
      'Queda de passageiros e custo operacional pressionam cidades a repensar contratos e subsidios.',
      '<p>O transporte publico enfrenta uma combinacao de queda de demanda, custo elevado e exigencia de qualidade.</p><p>Cidades estudam modelos de financiamento que combinam tarifa, subsidio, receitas acessorias e metas de desempenho.</p><p>Sem previsibilidade financeira, a renovacao de frota e a melhoria do servico ficam comprometidas.</p>',
      'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?auto=format&fit=crop&w=1600&q=80',
      18,
      'RS',
      'Sul'
    ),
    (
      '9b4e8e3c-4db8-4c6f-91f9-56f71f3e0229'::uuid,
      'Gestores buscam linguagem simples para melhorar servicos',
      'revista-edicao-2-linguagem-simples-servicos',
      'Comunicacao clara reduz erros, melhora atendimento e facilita acesso a direitos.',
      '<p>A linguagem simples virou ferramenta de gestao publica ao reduzir barreiras entre governo e cidadao.</p><p>Formularios, portais e comunicados claros diminuem retrabalho, chamadas de suporte e interpretacoes equivocadas.</p><p>O ganho e operacional e democratico: servicos ficam mais eficientes e mais acessiveis.</p>',
      'https://images.unsplash.com/photo-1455390582262-044cdead277a?auto=format&fit=crop&w=1600&q=80',
      19,
      'DF',
      'Nacional'
    ),
    (
      '9b4e8e3c-4db8-4c6f-91f9-56f71f3e0230'::uuid,
      'Consorcios publicos assumem papel estrategico em projetos regionais',
      'revista-edicao-2-consorcios-publicos-projetos-regionais',
      'Associacoes entre municipios ganham escala para compras, servicos e planejamento territorial.',
      '<p>Consorcios publicos voltaram a ganhar espaco como instrumento para problemas que ultrapassam a capacidade de um unico municipio.</p><p>Compras compartilhadas, servicos especializados e projetos regionais conseguem escala e melhor governanca quando bem estruturados.</p><p>A chave esta em regras claras, transparencia e capacidade tecnica permanente.</p>',
      'https://images.unsplash.com/photo-1529107386315-e1a2ed48a620?auto=format&fit=crop&w=1600&q=80',
      20,
      'GO',
      'Centro-Oeste'
    )
)
insert into public.artigos (
  id,
  titulo,
  slug,
  corpo_texto,
  resumo,
  autor_id,
  categoria_id,
  status,
  data_publicacao,
  url_imagem_og,
  estado,
  status_legal,
  regiao,
  canais_publicacao,
  revista_id,
  ordem_revista,
  criado_em,
  atualizado_em
)
select
  artigos.id,
  artigos.titulo,
  artigos.slug,
  artigos.corpo_texto,
  artigos.resumo,
  base.autor_id,
  base.categoria_id,
  'publicado'::public.status_artigo,
  now() - (artigos.ordem_revista || ' hours')::interval,
  artigos.url_imagem_og,
  artigos.estado,
  'aprovado',
  artigos.regiao,
  array['portal']::text[],
  base.revista_id,
  artigos.ordem_revista,
  now(),
  now()
from artigos
cross join base
on conflict (slug) do update
set
  titulo = excluded.titulo,
  corpo_texto = excluded.corpo_texto,
  resumo = excluded.resumo,
  autor_id = excluded.autor_id,
  categoria_id = excluded.categoria_id,
  status = excluded.status,
  data_publicacao = excluded.data_publicacao,
  url_imagem_og = excluded.url_imagem_og,
  estado = excluded.estado,
  status_legal = excluded.status_legal,
  regiao = excluded.regiao,
  canais_publicacao = excluded.canais_publicacao,
  revista_id = excluded.revista_id,
  ordem_revista = excluded.ordem_revista,
  atualizado_em = now();
