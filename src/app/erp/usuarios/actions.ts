"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { exigirPermissao } from "@/lib/auth";
import { criarClienteSupabaseAdmin } from "@/lib/supabase/admin";

function parsePerfis(formData: FormData) {
  return Array.from(
    new Set(
      formData
        .getAll("perfis")
        .map((value) => value.toString())
        .filter(Boolean)
    )
  );
}

async function sincronizarPerfis(usuarioId: string, perfilIds: string[]) {
  await prisma.usuarioPerfil.deleteMany({
    where: { usuarioId },
  });

  if (!perfilIds.length) {
    return;
  }

  await prisma.usuarioPerfil.createMany({
    data: perfilIds.map((perfilId) => ({
      usuarioId,
      perfilId,
    })),
    skipDuplicates: true,
  });
}

function redirecionarComErro(mensagem: string): never {
  throw new Error(mensagem);
}

function getSiteUrl() {
  if (process.env.NEXTAUTH_URL) return process.env.NEXTAUTH_URL;
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`;
  return "http://localhost:3000";
}

export async function criarUsuarioErp(formData: FormData) {
  await exigirPermissao("usuarios:gerir");

  const nome = formData.get("nome")?.toString().trim() ?? "";
  const email = formData.get("email")?.toString().trim().toLowerCase() ?? "";
  const senha = formData.get("senha")?.toString() ?? "";
  const tipoConta = formData.get("tipoConta")?.toString() ?? "erp";
  const status = formData.get("status")?.toString() ?? "ativo";
  const perfilIds = parsePerfis(formData);

  if (!nome || !email || !senha) {
    redirecionarComErro("Preencha nome, e-mail e senha para criar o usuário.");
  }

  if (senha.length < 8) {
    redirecionarComErro("A senha precisa ter pelo menos 8 caracteres.");
  }

  try {
    const supabaseAdmin = criarClienteSupabaseAdmin();
    const { data, error } = await supabaseAdmin.auth.admin.createUser({
      email,
      password: senha,
      email_confirm: true,
      user_metadata: {
        nome,
      },
    });

    if (error || !data.user) {
      throw error ?? new Error("Não foi possível criar o usuário no Supabase Auth.");
    }

    await prisma.usuario.upsert({
      where: { id: data.user.id },
      update: {
        nome,
        email,
        tipoConta,
        status,
      },
      create: {
        id: data.user.id,
        nome,
        email,
        tipoConta,
        status,
      },
    });

    await sincronizarPerfis(data.user.id, perfilIds);
  } catch (error) {
    const mensagem =
      error instanceof Error ? error.message : "Não foi possível criar o usuário.";
    redirecionarComErro(mensagem);
  }

  revalidatePath("/erp/usuarios");
  return { ok: true };
}

export async function atualizarUsuarioErp(formData: FormData) {
  await exigirPermissao("usuarios:gerir");

  const usuarioId = formData.get("usuarioId")?.toString() ?? "";
  const nome = formData.get("nome")?.toString().trim() ?? "";
  const tipoConta = formData.get("tipoConta")?.toString() ?? "portal";
  const status = formData.get("status")?.toString() ?? "ativo";
  const perfilIds = parsePerfis(formData);

  if (!usuarioId || !nome) {
    redirecionarComErro("Usuário inválido para atualização.");
  }

  try {
    const usuarioAtual = await prisma.usuario.findUnique({
      where: { id: usuarioId },
      select: { id: true },
    });

    if (!usuarioAtual) {
      throw new Error("Usuário não encontrado.");
    }

    await prisma.usuario.update({
      where: { id: usuarioId },
      data: {
        nome,
        tipoConta,
        status,
      },
    });

    await sincronizarPerfis(usuarioId, perfilIds);

    const supabaseAdmin = criarClienteSupabaseAdmin();
    const { error } = await supabaseAdmin.auth.admin.updateUserById(usuarioId, {
      user_metadata: { nome },
    });

    if (error) {
      throw error;
    }
  } catch (error) {
    const mensagem =
      error instanceof Error ? error.message : "Não foi possível atualizar o usuário.";
    redirecionarComErro(mensagem);
  }

  revalidatePath("/erp/usuarios");
  return { ok: true };
}

export async function definirSenhaUsuarioErp(formData: FormData) {
  await exigirPermissao("usuarios:gerir");

  const usuarioId = formData.get("usuarioId")?.toString() ?? "";
  const senha = formData.get("senha")?.toString() ?? "";

  if (!usuarioId) {
    throw new Error("Usuário inválido para redefinição de senha.");
  }

  if (senha.length < 8) {
    throw new Error("A nova senha precisa ter pelo menos 8 caracteres.");
  }

  const usuarioAtual = await prisma.usuario.findUnique({
    where: { id: usuarioId },
    select: { id: true },
  });

  if (!usuarioAtual) {
    throw new Error("Usuário não encontrado.");
  }

  const supabaseAdmin = criarClienteSupabaseAdmin();
  const { error } = await supabaseAdmin.auth.admin.updateUserById(usuarioId, {
    password: senha,
  });

  if (error) {
    throw error;
  }
}

export async function enviarRedefinicaoSenhaUsuarioErp(formData: FormData) {
  await exigirPermissao("usuarios:gerir");

  const usuarioId = formData.get("usuarioId")?.toString() ?? "";

  if (!usuarioId) {
    throw new Error("Usuário inválido para redefinição de senha.");
  }

  const usuario = await prisma.usuario.findUnique({
    where: { id: usuarioId },
    select: { email: true },
  });

  if (!usuario?.email) {
    throw new Error("Este usuário não possui e-mail cadastrado.");
  }

  const supabaseAdmin = criarClienteSupabaseAdmin();
  const { error } = await supabaseAdmin.auth.resetPasswordForEmail(usuario.email, {
    redirectTo: `${getSiteUrl()}/redefinir-senha`,
  });

  if (error) {
    throw error;
  }
}
