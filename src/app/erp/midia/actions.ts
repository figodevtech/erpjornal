"use server";

import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

export async function suggestMediaTags(nome: string, tipo: string) {
  // Simulação de IA: em produção chamaria Gemini/Vision API
  const lowerNome = nome.toLowerCase();
  const tags = ["Revista Gestão", "Mídia Oficial", tipo];
  
  if (lowerNome.includes("plenário") || lowerNome.includes("câmara")) tags.push("Legislativo", "Política", "Parlamento");
  if (lowerNome.includes("votação") || lowerNome.includes("urna")) tags.push("Democracia", "Eleições");
  if (lowerNome.includes("governo") || lowerNome.includes("ministro")) tags.push("Executivo", "Governo Federal");
  
  return Array.from(new Set(tags));
}

export async function saveMedia(formData: FormData) {
  const session = await getServerSession(authOptions);
  if (!session?.user) throw new Error("Não autorizado");

  const id = formData.get("id") as string | null;
  const url = formData.get("url") as string;
  const nome = formData.get("nome") as string;
  const tipo = formData.get("tipo") as string;
  const mimetype = formData.get("mimetype") as string || null;
  const tamanhoRaw = formData.get("tamanho") as string;
  const tamanho = tamanhoRaw ? parseInt(tamanhoRaw) : null;
  const direitos_autorais = formData.get("direitos_autorais") as string || null;
  const tipo_licenca = formData.get("tipo_licenca") as string || null;
  const fonte = formData.get("fonte") as string || null;
  const dataExpiracaoRaw = formData.get("data_expiracao") as string;
  const data_expiracao = dataExpiracaoRaw ? new Date(dataExpiracaoRaw) : null;
  const tags_ia_raw = formData.get("tags_ia") as string; // JSON string from hidden field or input
  const tags_ia = tags_ia_raw ? JSON.parse(tags_ia_raw) : null;

  if (!url || !nome || !tipo) throw new Error("Campos obrigatórios ausentes");

  const data = {
    url,
    nome,
    tipo,
    mimetype,
    tamanho,
    direitos_autorais,
    tipo_licenca,
    fonte,
    data_expiracao,
    tags_ia,
  };

  if (id) {
    await prisma.media.update({ where: { id }, data });
  } else {
    await prisma.media.create({ data });
  }

  revalidatePath("/erp/midia");
  redirect("/erp/midia");
}
