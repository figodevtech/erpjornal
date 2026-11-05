/**
 * Seed do banco: perfis/permissões, usuário admin (Supabase Auth) e conteúdo de exemplo.
 *
 * Uso: npm run db:seed   (depois de `npm run db:deploy` e `npm run db:setup`)
 *
 * Idempotente:
 * - Conteúdo: só cria o que ainda não existe (não sobrescreve edições feitas no ERP).
 * - Permissões: só ADICIONA as que faltam aos perfis padrão (preserva ajustes do ERP).
 * - Usuários: se o e-mail já existe no Supabase Auth, reaproveita (a senha não é alterada).
 */
import "dotenv/config";

import { createClient, type SupabaseClient } from "@supabase/supabase-js";

import { Prisma, type StatusArtigo } from "../src/generated/prisma/client";
import { prisma } from "../src/lib/prisma";

import { PERFIS, PERMISSOES, PERMISSOES_POR_PERFIL, type NomePerfil } from "./seed-data/acesso";
import {
  ANUNCIOS,
  ARTIGOS,
  CATEGORIAS,
  ENTIDADES,
  FONTES,
  FONTES_RSS,
  MIDIA_KIT,
  type AutorSeed,
  type SlugCategoria,
} from "./seed-data/conteudo";
import { idEstavel } from "./seed-data/ids";
import { ARTIGOS_EDICAO_2, REVISTA_EDICAO_2 } from "./seed-data/revista-edicao-2";

const HORA = 60 * 60 * 1000;
const resumo: string[] = [];

function exigirEnv(nome: string) {
  const valor = process.env[nome]?.trim();
  if (!valor) throw new Error(`Variável ${nome} não definida no .env (veja .env.example).`);
  return valor;
}

const json = (valor: unknown) => JSON.parse(JSON.stringify(valor)) as Prisma.InputJsonValue;

// ---------------------------------------------------------------------------
// Acesso (RBAC)
// ---------------------------------------------------------------------------

async function seedAcesso() {
  for (const perfil of PERFIS) {
    await prisma.perfil.upsert({
      where: { nome: perfil.nome },
      update: { descricao: perfil.descricao },
      create: perfil,
    });
  }

  for (const permissao of PERMISSOES) {
    await prisma.permissao.upsert({
      where: { modulo_acao: { modulo: permissao.modulo, acao: permissao.acao } },
      update: { descricao: permissao.descricao },
      create: permissao,
    });
  }

  const perfis = new Map((await prisma.perfil.findMany()).map((p) => [p.nome, p.id]));
  const permissoes = new Map(
    (await prisma.permissao.findMany()).map((p) => [`${p.modulo}:${p.acao}`, p.id])
  );

  let vinculos = 0;
  for (const [perfilNome, chaves] of Object.entries(PERMISSOES_POR_PERFIL)) {
    const perfilId = perfis.get(perfilNome)!;
    const { count } = await prisma.perfilPermissao.createMany({
      data: chaves.map((chave) => ({ perfilId, permissaoId: permissoes.get(chave)! })),
      skipDuplicates: true,
    });
    vinculos += count;
  }

  resumo.push(`Acesso: ${PERFIS.length} perfis, ${PERMISSOES.length} permissões, ${vinculos} vínculo(s) novo(s)`);
  return perfis;
}

// ---------------------------------------------------------------------------
// Usuários (Supabase Auth + tabela usuarios)
// ---------------------------------------------------------------------------

async function buscarUsuarioAuth(supabase: SupabaseClient, email: string) {
  const porPagina = 200;
  for (let pagina = 1; ; pagina++) {
    const { data, error } = await supabase.auth.admin.listUsers({ page: pagina, perPage: porPagina });
    if (error) throw new Error(`Supabase Auth: ${error.message}`);
    const encontrado = data.users.find((u) => u.email?.toLowerCase() === email);
    if (encontrado) return encontrado;
    if (data.users.length < porPagina) return null;
  }
}

async function garantirUsuario(
  supabase: SupabaseClient,
  perfis: Map<string, string>,
  dados: { email: string; senha: string; nome: string; perfis: NomePerfil[] }
) {
  const email = dados.email.toLowerCase();
  let authUser = await buscarUsuarioAuth(supabase, email);
  let situacao = "já existia";

  if (!authUser) {
    const { data, error } = await supabase.auth.admin.createUser({
      email,
      password: dados.senha,
      email_confirm: true,
      user_metadata: { nome: dados.nome },
    });
    if (error || !data.user) throw new Error(`Não foi possível criar ${email}: ${error?.message}`);
    authUser = data.user;
    situacao = "criado";
  }

  const conflito = await prisma.usuario.findFirst({
    where: { email, NOT: { id: authUser.id } },
    select: { id: true },
  });
  if (conflito) {
    throw new Error(
      `A tabela usuarios já tem ${email} com outro id (${conflito.id}). Remova o registro antigo e rode o seed de novo.`
    );
  }

  await prisma.usuario.upsert({
    where: { id: authUser.id },
    update: { email, status: "ativo" },
    create: { id: authUser.id, nome: dados.nome, email, tipoConta: "erp", status: "ativo" },
  });

  await prisma.usuarioPerfil.createMany({
    data: dados.perfis.map((nome) => ({ usuarioId: authUser.id, perfilId: perfis.get(nome)! })),
    skipDuplicates: true,
  });

  resumo.push(`Usuário ${email} (${dados.perfis.join(", ")}): ${situacao}`);
  return authUser.id;
}

async function seedUsuarios(perfis: Map<string, string>): Promise<Record<AutorSeed, string>> {
  const supabase = createClient(
    exigirEnv("NEXT_PUBLIC_SUPABASE_URL"),
    exigirEnv("SUPABASE_SERVICE_ROLE_KEY"),
    { auth: { autoRefreshToken: false, persistSession: false } }
  );

  const senhaAdmin = exigirEnv("SEED_ADMIN_PASSWORD");
  if (senhaAdmin.length < 8) throw new Error("SEED_ADMIN_PASSWORD precisa ter pelo menos 8 caracteres.");

  const admin = await garantirUsuario(supabase, perfis, {
    email: exigirEnv("SEED_ADMIN_EMAIL"),
    senha: senhaAdmin,
    nome: exigirEnv("SEED_ADMIN_NOME"),
    perfis: ["admin_erp"],
  });

  const senhaDemo = process.env.SEED_DEMO_PASSWORD?.trim();
  if (!senhaDemo) {
    resumo.push("Usuários de demonstração: não criados (SEED_DEMO_PASSWORD vazia)");
    return { admin, editor: admin, reporter: admin };
  }
  if (senhaDemo.length < 8) throw new Error("SEED_DEMO_PASSWORD precisa ter pelo menos 8 caracteres.");

  const editor = await garantirUsuario(supabase, perfis, {
    email: "editor.demo@example.com",
    senha: senhaDemo,
    nome: "Helena Duarte (demo)",
    perfis: ["editor_erp"],
  });
  const reporter = await garantirUsuario(supabase, perfis, {
    email: "reporter.demo@example.com",
    senha: senhaDemo,
    nome: "Caio Nogueira (demo)",
    perfis: ["reporter_erp"],
  });
  await garantirUsuario(supabase, perfis, {
    email: "juridico.demo@example.com",
    senha: senhaDemo,
    nome: "Renata Paes (demo)",
    perfis: ["juridico_erp"],
  });

  return { admin, editor, reporter };
}

// ---------------------------------------------------------------------------
// Conteúdo de exemplo
// ---------------------------------------------------------------------------

async function seedCategorias() {
  const ids = {} as Record<SlugCategoria, string>;
  let criadas = 0;
  for (const categoria of CATEGORIAS) {
    const existente = await prisma.categoria.findUnique({ where: { slug: categoria.slug }, select: { id: true } });
    if (existente) {
      ids[categoria.slug] = existente.id;
      continue;
    }
    const criada = await prisma.categoria.create({
      data: { id: idEstavel(`categoria:${categoria.slug}`), ...categoria },
    });
    ids[categoria.slug] = criada.id;
    criadas++;
  }
  resumo.push(`Categorias: ${criadas} criada(s) de ${CATEGORIAS.length}`);
  return ids;
}

async function seedEntidadesEFontes(adminId: string) {
  const entidadeIds: Record<string, string> = {};
  for (const { chave, ...entidade } of ENTIDADES) {
    const id = idEstavel(`entidade:${chave}`);
    await prisma.politico.upsert({ where: { id }, update: {}, create: { id, ...entidade } });
    entidadeIds[chave] = id;
  }

  for (const { chave, ...fonte } of FONTES) {
    const id = idEstavel(`fonte:${chave}`);
    await prisma.fonte.upsert({ where: { id }, update: {}, create: { id, ...fonte, criadorId: adminId } });
  }

  for (const fonteRss of FONTES_RSS) {
    await prisma.fonteRss.upsert({
      where: { urlFeed: fonteRss.urlFeed },
      update: {},
      create: { id: idEstavel(`rss:${fonteRss.urlFeed}`), ...fonteRss, ativa: true },
    });
  }

  resumo.push(
    `Entidades: ${ENTIDADES.length} | Fontes (CRM): ${FONTES.length} | Feeds RSS: ${FONTES_RSS.length}`
  );
  return entidadeIds;
}

async function seedArtigos(
  autores: Record<AutorSeed, string>,
  categorias: Record<SlugCategoria, string>,
  entidades: Record<string, string>
) {
  const agora = Date.now();
  let criados = 0;

  for (const artigo of ARTIGOS) {
    const existe = await prisma.artigo.findUnique({ where: { slug: artigo.slug }, select: { id: true } });
    if (existe) continue;

    const publicado = artigo.status === "publicado";
    await prisma.artigo.create({
      data: {
        id: idEstavel(`artigo:${artigo.chave}`),
        titulo: artigo.titulo,
        slug: artigo.slug,
        resumo: artigo.resumo,
        corpoTexto: artigo.corpoTexto,
        status: artigo.status,
        categoriaId: categorias[artigo.categoria],
        autorId: autores[artigo.autor],
        editorId: publicado ? autores.editor : null,
        dataPublicacao: publicado ? new Date(agora - (artigo.publicadoHaHoras ?? 0) * HORA) : null,
        visualizacoes: artigo.visualizacoes ?? 0,
        urlImagemOg: artigo.urlImagemOg,
        estado: artigo.estado,
        regiao: artigo.regiao,
        ehPremium: artigo.ehPremium ?? false,
        canaisPublicacao: artigo.canaisPublicacao ?? ["portal"],
        statusLegal: artigo.statusLegal ?? "pendente",
        observacoesLegais: artigo.observacoesLegais ?? null,
        revisorHumano: artigo.revisorHumano ?? null,
        artigosPoliticos: {
          create: (artigo.entidades ?? []).map(({ chave, papel }) => ({
            papel,
            politico: { connect: { id: entidades[chave] } },
          })),
        },
        checagensFato: { create: artigo.checagens ?? [] },
      },
    });
    criados++;
  }

  resumo.push(`Artigos avulsos: ${criados} criado(s) de ${ARTIGOS.length}`);
}

async function seedRevista(autorId: string, categorias: Record<SlugCategoria, string>) {
  const revistaId = idEstavel("revista:edicao-2");
  await prisma.revista.upsert({
    where: { id: revistaId },
    update: {},
    create: { id: revistaId, ...REVISTA_EDICAO_2, dataPublicacao: new Date() },
  });

  const agora = Date.now();
  let criados = 0;
  for (const [indice, artigo] of ARTIGOS_EDICAO_2.entries()) {
    const existe = await prisma.artigo.findUnique({ where: { slug: artigo.slug }, select: { id: true } });
    if (existe) continue;

    const ordem = indice + 1;
    await prisma.artigo.create({
      data: {
        id: idEstavel(`artigo:${artigo.slug}`),
        titulo: artigo.titulo,
        slug: artigo.slug,
        resumo: artigo.resumo,
        corpoTexto: artigo.paragrafos.map((paragrafo) => `<p>${paragrafo}</p>`).join(""),
        status: "publicado" satisfies StatusArtigo,
        categoriaId: categorias[artigo.categoria],
        autorId,
        dataPublicacao: new Date(agora - ordem * HORA),
        urlImagemOg: `https://images.unsplash.com/photo-${artigo.imagem}?auto=format&fit=crop&w=1600&q=80`,
        estado: artigo.estado,
        regiao: artigo.regiao,
        statusLegal: "aprovado",
        canaisPublicacao: ["portal"],
        revistaId,
        ordemNaRevista: ordem,
      },
    });
    criados++;
  }

  resumo.push(`Revista "${REVISTA_EDICAO_2.titulo}": ${criados} artigo(s) criado(s) de ${ARTIGOS_EDICAO_2.length}`);
}

async function seedAnunciosEMidiaKit() {
  let anuncios = 0;
  for (const { chave, ...anuncio } of ANUNCIOS) {
    const id = idEstavel(`anuncio:${chave}`);
    const existe = await prisma.anuncio.findUnique({ where: { id }, select: { id: true } });
    if (existe) continue;
    await prisma.anuncio.create({ data: { id, ...anuncio, dataInicio: new Date(), dataFim: null } });
    anuncios++;
  }

  const kitExiste = await prisma.mediaKit.findUnique({ where: { slug: MIDIA_KIT.slug }, select: { id: true } });
  if (!kitExiste) {
    await prisma.mediaKit.create({
      data: {
        id: idEstavel(`midia-kit:${MIDIA_KIT.slug}`),
        nome: MIDIA_KIT.nome,
        slug: MIDIA_KIT.slug,
        status: "PUBLISHED",
        publicadoEm: new Date(),
        tema: json(MIDIA_KIT.tema),
        secoes: {
          create: MIDIA_KIT.secoes.map((secao, ordem) => ({
            tipo: secao.tipo,
            titulo: secao.titulo,
            ordem,
            data: json(secao.data),
          })),
        },
      },
    });
  }

  resumo.push(
    `Anúncios-modelo: ${anuncios} criado(s) de ${ANUNCIOS.length} | Mídia kit /midia-kit/${MIDIA_KIT.slug}: ${kitExiste ? "já existia" : "criado"}`
  );
}

async function main() {
  const perfis = await seedAcesso();
  const autores = await seedUsuarios(perfis);
  const categorias = await seedCategorias();
  const entidades = await seedEntidadesEFontes(autores.admin);
  await seedArtigos(autores, categorias, entidades);
  await seedRevista(autores.admin, categorias);
  await seedAnunciosEMidiaKit();

  console.log("Seed concluído:");
  for (const linha of resumo) console.log(`  ✓ ${linha}`);
}

main()
  .catch((erro) => {
    console.error("✗ Seed falhou:", erro instanceof Error ? erro.message : erro);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
