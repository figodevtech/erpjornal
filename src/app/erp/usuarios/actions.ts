"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { exigirPermissao } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { registrarAuditoria } from "@/lib/auditoria";
import { getSiteUrl } from "@/lib/site-url";
import { criarClienteSupabaseAdmin } from "@/lib/supabase/admin";

/**
 * Gestão de usuários do ERP.
 *
 * As actions retornam { ok, error } em vez de lançar: o Next esconde a
 * mensagem de erros lançados por server actions em produção.
 */
type Resultado = { ok: true } | { ok: false; error: string };

const PERFIL_ADMIN = "admin_erp";

const TipoConta = z.enum(["erp", "portal", "misto"]);
const StatusUsuario = z.enum(["ativo", "inativo", "bloqueado"]);
const Senha = z
  .string()
  .min(8, "A senha precisa ter pelo menos 8 caracteres.")
  .max(72, "A senha pode ter no máximo 72 caracteres.");

const DadosCriacao = z.object({
  nome: z.string().trim().min(1, "Informe o nome.").max(120),
  email: z.email("Informe um e-mail válido.").max(254).transform((email) => email.trim().toLowerCase()),
  senha: Senha,
  tipoConta: TipoConta.catch("erp"),
  status: StatusUsuario.catch("ativo"),
  perfis: z.array(z.uuid()).max(20),
});

const DadosAtualizacao = z.object({
  usuarioId: z.uuid("Usuário inválido para atualização."),
  nome: z.string().trim().min(1, "Informe o nome.").max(120),
  tipoConta: TipoConta.catch("portal"),
  status: StatusUsuario.catch("ativo"),
  perfis: z.array(z.uuid()).max(20),
});

function lerFormulario(formData: FormData) {
  return {
    ...Object.fromEntries(
      ["usuarioId", "nome", "email", "senha", "tipoConta", "status"].map((campo) => [
        campo,
        formData.get(campo)?.toString() ?? undefined,
      ])
    ),
    perfis: Array.from(new Set(formData.getAll("perfis").map(String).filter(Boolean))),
  };
}

function primeiroErro(erro: z.ZodError) {
  return erro.issues[0]?.message ?? "Dados inválidos.";
}

function mensagemDe(error: unknown, padrao: string) {
  return error instanceof Error && error.message ? error.message : padrao;
}

async function perfisExistem(perfilIds: string[]) {
  if (!perfilIds.length) return true;
  const total = await prisma.perfil.count({ where: { id: { in: perfilIds } } });
  return total === perfilIds.length;
}

/**
 * Impede que a alteração deixe o sistema sem administrador ativo
 * ou que alguém remova o próprio acesso de administrador.
 */
async function verificarProtecaoAdmin(params: {
  usuarioId: string;
  sessaoUsuarioId: string;
  novosPerfilIds: string[];
  novoStatus: string;
}): Promise<string | null> {
  const perfilAdmin = await prisma.perfil.findUnique({ where: { nome: PERFIL_ADMIN }, select: { id: true } });
  if (!perfilAdmin) return null;

  const eraAdmin = await prisma.usuarioPerfil.findUnique({
    where: { usuarioId_perfilId: { usuarioId: params.usuarioId, perfilId: perfilAdmin.id } },
  });
  const continuaAdmin = params.novosPerfilIds.includes(perfilAdmin.id) && params.novoStatus === "ativo";
  if (!eraAdmin || continuaAdmin) return null;

  if (params.usuarioId === params.sessaoUsuarioId) {
    return "Você não pode remover o seu próprio acesso de administrador.";
  }

  const outrosAdminsAtivos = await prisma.usuarioPerfil.count({
    where: {
      perfilId: perfilAdmin.id,
      usuarioId: { not: params.usuarioId },
      usuario: { status: "ativo" },
    },
  });
  return outrosAdminsAtivos === 0 ? "O sistema precisa ter pelo menos um administrador ativo." : null;
}

export async function criarUsuarioErp(formData: FormData): Promise<Resultado> {
  const sessao = await exigirPermissao("usuarios:gerir");

  const dados = DadosCriacao.safeParse(lerFormulario(formData));
  if (!dados.success) return { ok: false, error: primeiroErro(dados.error) };
  const { nome, email, senha, tipoConta, status, perfis } = dados.data;

  if (!(await perfisExistem(perfis))) {
    return { ok: false, error: "Um ou mais perfis selecionados não existem." };
  }

  const supabaseAdmin = criarClienteSupabaseAdmin();
  const { data, error } = await supabaseAdmin.auth.admin.createUser({
    email,
    password: senha,
    email_confirm: true,
    user_metadata: { nome },
  });
  if (error || !data.user) {
    return { ok: false, error: mensagemDe(error, "Não foi possível criar o usuário no Supabase Auth.") };
  }
  const usuarioId = data.user.id;

  try {
    await prisma.$transaction([
      prisma.usuario.upsert({
        where: { id: usuarioId },
        update: { nome, email, tipoConta, status },
        create: { id: usuarioId, nome, email, tipoConta, status },
      }),
      prisma.usuarioPerfil.deleteMany({ where: { usuarioId } }),
      prisma.usuarioPerfil.createMany({
        data: perfis.map((perfilId) => ({ usuarioId, perfilId })),
        skipDuplicates: true,
      }),
    ]);
  } catch (erroBanco) {
    // Compensação: sem o registro no banco, o login no Supabase ficaria órfão.
    await supabaseAdmin.auth.admin.deleteUser(usuarioId).catch(() => {});
    return { ok: false, error: mensagemDe(erroBanco, "Não foi possível criar o usuário.") };
  }

  await registrarAuditoria({ usuarioId: sessao.user.id, acao: "CRIACAO", entidade: "usuario", entidadeId: usuarioId, depois: { nome, email, tipoConta, status, perfis } });

  revalidatePath("/erp/usuarios");
  return { ok: true };
}

export async function atualizarUsuarioErp(formData: FormData): Promise<Resultado> {
  const sessao = await exigirPermissao("usuarios:gerir");

  const dados = DadosAtualizacao.safeParse(lerFormulario(formData));
  if (!dados.success) return { ok: false, error: primeiroErro(dados.error) };
  const { usuarioId, nome, tipoConta, status, perfis } = dados.data;

  const usuarioAtual = await prisma.usuario.findUnique({ where: { id: usuarioId }, select: { id: true } });
  if (!usuarioAtual) return { ok: false, error: "Usuário não encontrado." };

  if (!(await perfisExistem(perfis))) {
    return { ok: false, error: "Um ou mais perfis selecionados não existem." };
  }

  const bloqueio = await verificarProtecaoAdmin({
    usuarioId,
    sessaoUsuarioId: sessao.user.id,
    novosPerfilIds: perfis,
    novoStatus: status,
  });
  if (bloqueio) return { ok: false, error: bloqueio };

  try {
    // Atualização e troca de perfis juntas: uma falha no meio não deixa o usuário sem perfis.
    await prisma.$transaction([
      prisma.usuario.update({ where: { id: usuarioId }, data: { nome, tipoConta, status } }),
      prisma.usuarioPerfil.deleteMany({ where: { usuarioId } }),
      prisma.usuarioPerfil.createMany({
        data: perfis.map((perfilId) => ({ usuarioId, perfilId })),
        skipDuplicates: true,
      }),
    ]);

    const { error } = await criarClienteSupabaseAdmin().auth.admin.updateUserById(usuarioId, {
      user_metadata: { nome },
    });
    if (error) throw error;
  } catch (error) {
    return { ok: false, error: mensagemDe(error, "Não foi possível atualizar o usuário.") };
  }

  await registrarAuditoria({ usuarioId: sessao.user.id, acao: "EDICAO", entidade: "usuario", entidadeId: usuarioId, depois: { nome, tipoConta, status, perfis } });

  revalidatePath("/erp/usuarios");
  return { ok: true };
}

export async function definirSenhaUsuarioErp(formData: FormData): Promise<Resultado> {
  const sessao = await exigirPermissao("usuarios:gerir");

  const dados = z
    .object({ usuarioId: z.uuid("Usuário inválido para redefinição de senha."), senha: Senha })
    .safeParse(lerFormulario(formData));
  if (!dados.success) return { ok: false, error: primeiroErro(dados.error) };

  const usuario = await prisma.usuario.findUnique({ where: { id: dados.data.usuarioId }, select: { id: true } });
  if (!usuario) return { ok: false, error: "Usuário não encontrado." };

  const { error } = await criarClienteSupabaseAdmin().auth.admin.updateUserById(usuario.id, {
    password: dados.data.senha,
  });
  if (error) return { ok: false, error: mensagemDe(error, "Não foi possível atualizar a senha.") };

  // Registra só o fato; a senha nunca vai para o log.
  await registrarAuditoria({ usuarioId: sessao.user.id, acao: "DEFINICAO_SENHA", entidade: "usuario", entidadeId: usuario.id });
  return { ok: true };
}

export async function enviarRedefinicaoSenhaUsuarioErp(formData: FormData): Promise<Resultado> {
  const sessao = await exigirPermissao("usuarios:gerir");

  const usuarioId = z.uuid().safeParse(formData.get("usuarioId")?.toString());
  if (!usuarioId.success) return { ok: false, error: "Usuário inválido para redefinição de senha." };

  const usuario = await prisma.usuario.findUnique({ where: { id: usuarioId.data }, select: { email: true } });
  if (!usuario?.email) return { ok: false, error: "Este usuário não possui e-mail cadastrado." };

  const { error } = await criarClienteSupabaseAdmin().auth.resetPasswordForEmail(usuario.email, {
    redirectTo: `${getSiteUrl()}/redefinir-senha`,
  });
  if (error) return { ok: false, error: mensagemDe(error, "Não foi possível enviar o e-mail.") };

  await registrarAuditoria({ usuarioId: sessao.user.id, acao: "ENVIO_REDEFINICAO_SENHA", entidade: "usuario", entidadeId: usuarioId.data });
  return { ok: true };
}

/**
 * Remove os autenticadores (MFA) de um usuário que perdeu o celular: no próximo
 * login ele cadastra um novo. Ninguém redefine o próprio segundo fator.
 */
export async function redefinirMfaUsuarioErp(formData: FormData): Promise<Resultado> {
  const sessao = await exigirPermissao("usuarios:gerir");

  const usuarioId = z.uuid().safeParse(formData.get("usuarioId")?.toString());
  if (!usuarioId.success) return { ok: false, error: "Usuário inválido para redefinição do MFA." };
  if (usuarioId.data === sessao.user.id) {
    return { ok: false, error: "Você não pode redefinir o seu próprio MFA. Peça a outro administrador." };
  }

  const admin = criarClienteSupabaseAdmin().auth.admin;
  const { data, error } = await admin.mfa.listFactors({ userId: usuarioId.data });
  if (error) return { ok: false, error: mensagemDe(error, "Não foi possível consultar o MFA do usuário.") };

  const fatores = data?.factors ?? [];
  if (fatores.length === 0) return { ok: false, error: "Este usuário não tem autenticador cadastrado." };

  for (const fator of fatores) {
    const { error: erroRemocao } = await admin.mfa.deleteFactor({ id: fator.id, userId: usuarioId.data });
    if (erroRemocao) return { ok: false, error: mensagemDe(erroRemocao, "Não foi possível remover o autenticador.") };
  }

  await registrarAuditoria({
    usuarioId: sessao.user.id,
    acao: "REDEFINICAO_MFA",
    entidade: "usuario",
    entidadeId: usuarioId.data,
    depois: { autenticadoresRemovidos: fatores.length },
  });
  return { ok: true };
}
