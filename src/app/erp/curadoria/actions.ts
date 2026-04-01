"use server";

import { prisma } from "@/lib/prisma";
import { ArticleStatus } from "@/lib/types/article-status";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import Parser from "rss-parser";
import { GoogleGenerativeAI } from "@google/generative-ai";

const parser = new Parser();
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

// --- RSS Sources (Admin Only) ---

export async function saveRSSSource(formData: FormData) {
  const session = await getServerSession(authOptions);
  if (session?.user?.role !== "admin") throw new Error("Apenas administradores podem gerenciar feeds RSS.");

  try {
    const id = formData.get("id") as string | null;
    const name = formData.get("name") as string;
    const feed_url = formData.get("feed_url") as string;
    const tone = formData.get("tone") as string || "jornalistico";
    const regiao = formData.get("regiao") as string || "Nacional";
    const estado = (formData.get("estado") as string || "").toUpperCase().slice(0, 2) || null;
    const cache_ttl = parseInt(formData.get("cache_ttl") as string || "30");
    const is_active = formData.get("is_active") === "true";

    if (!name || !feed_url) throw new Error("Nome e URL são obrigatórios");

    const data = {
      name,
      feed_url,
      tone,
      regiao,
      estado,
      cache_ttl,
      is_active
    };

    if (id) {
      await prisma.rSSSource.update({ where: { id }, data });
    } else {
      await prisma.rSSSource.create({ data });
    }

    revalidatePath("/erp/curadoria/fontes");
    return { success: true };
  } catch (error: any) {
    console.error("Erro ao salvar fonte:", error);
    if (error.code === 'P2002') {
      throw new Error("Já existe uma fonte com esta URL de feed.");
    }
    throw new Error(error.message || "Erro ao salvar fonte");
  }
}

export async function deleteRSSSource(id: string) {
  const session = await getServerSession(authOptions);
  if (session?.user?.role !== "admin") throw new Error("Não autorizado");

  await prisma.rSSSource.delete({ where: { id } });
  revalidatePath("/erp/curadoria/fontes");
  return { success: true };
}

export async function toggleRSSSourceStatus(id: string, currentStatus: boolean) {
  const session = await getServerSession(authOptions);
  if (session?.user?.role !== "admin") throw new Error("Não autorizado");

  await prisma.rSSSource.update({
    where: { id },
    data: { is_active: !currentStatus } as any
  });

  revalidatePath("/erp/curadoria/fontes");
  return { success: true };
}

// --- Harvester ---

function extractImage(item: any): string | null {
  // 1. Tenta enclosure (padrão RSS 2.0)
  if (item.enclosure?.url && item.enclosure?.type?.startsWith("image/")) {
    return item.enclosure.url;
  }

  // 2. Tenta media:content (padrão MediaRSS)
  const mediaContent = item["media:content"] || item["media:thumbnail"];
  if (mediaContent) {
    if (Array.isArray(mediaContent) && mediaContent[0]?.$.url) return mediaContent[0].$.url;
    if (mediaContent.$?.url) return mediaContent.$.url;
  }

  // 3. Tenta extrair do HTML da descrição (Fallback comum)
  const content = item.content || item.description || "";
  const imgMatch = content.match(/<img[^>]+src="([^">]+)"/);
  if (imgMatch && imgMatch[1]) {
    // Evita trackers minúsculos de 1px
    if (!imgMatch[1].includes("feedburner.com") && !imgMatch[1].includes("doubleclick.net")) {
      return imgMatch[1];
    }
  }

  return null;
}

export async function harvestFeed(sourceId: string, limit: number = 10) {
  try {
    const source = await prisma.rSSSource.findUnique({ where: { id: sourceId } });
    if (!source) throw new Error("Fonte não encontrada");

    // Adicionado customFields para capturar tags de mídia comuns
    const parserWithMedia = new Parser({
      customFields: {
        item: [
          ["media:content", "media:content"],
          ["media:thumbnail", "media:thumbnail"],
          ["image", "image"],
        ],
      },
    });

    const feed = await parserWithMedia.parseURL(source.feed_url);

    let newItemsCount = 0;

    for (const item of feed.items) {
      if (limit > 0 && newItemsCount >= limit) break;

      const guid = item.guid || item.link;
      if (!guid) continue;

      const existing = await prisma.rSSItemRaw.findUnique({ where: { guid } });
      if (!existing) {
        const imageUrl = extractImage(item);

        await prisma.rSSItemRaw.create({
          data: {
            source_id: source.id,
            guid,
            original_title: item.title || "Sem título",
            original_link: item.link || "",
            original_author: (item as any).creator || (item as any).author || source.name,
            description: item.contentSnippet || item.content || "",
            thumbnail: imageUrl,
            pub_date: item.isoDate ? new Date(item.isoDate) : new Date(),
            status: "pending"
          }
        });
        newItemsCount++;
      }
    }

    await prisma.rSSSource.update({
      where: { id: sourceId },
      data: { last_harvest: new Date() }
    });

    revalidatePath("/erp/curadoria/fontes");
    revalidatePath("/erp/curadoria/dashboard");
    return { success: true, count: newItemsCount };
  } catch (error) {
    console.error("Harvest Error:", error);
    throw new Error("Erro ao coletar feed: " + (error instanceof Error ? error.message : "Desconhecido"));
  }
}

// --- Workflow ---

export async function selectRSSItem(id: string) {
  const session = await getServerSession(authOptions);
  if (!session) throw new Error("Não autorizado");

  await prisma.rSSItemRaw.update({
    where: { id },
    data: { status: "selected" }
  });
  revalidatePath("/erp/curadoria/dashboard");
  return { success: true };
}

export async function rejectRSSItem(id: string) {
  await prisma.rSSItemRaw.update({
    where: { id },
    data: { status: "rejected" }
  });
  revalidatePath("/erp/curadoria/dashboard");
  return { success: true };
}

// --- AI REWRITE (Task 5) ---

export async function rewriteWithAI(itemId: string) {
  const session = await getServerSession(authOptions);
  if (!session) throw new Error("Não autorizado");

  const item = await prisma.rSSItemRaw.findUnique({
    where: { id: itemId },
    include: { source: true }
  });
  if (!item) throw new Error("Item não encontrado");

  // --- Gemini Real (Atualizado para o ambiente 2026) ---
  const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

  // Limpa a descrição para evitar que a IA tente "refazer" imagens ou mídias
  const cleanDescription = (item.description || "").replace(/<img[^>]*>/g, '');

  const prompt = `
    Você é um editor sênior da Revista Gestão, sediada em Brasília. 
    Seu público são executivos, políticos e tomadores de decisão.
    
    TAREFA: Reescreva esta notícia para torná-la exclusiva, profissional e adaptada ao nosso tom.
    
    DIRETRIZES:
    - Tom de voz: ${item.source.tone || 'Profissional e Executivo'}
    - Foco Regional: ${item.source.regiao || 'Brasil/Nacional'}
    - Título: Deve ser impactante e sério.
    - Lead: Um resumo que prenda a atenção do tomador de decisão.
    - Corpo HTML (ai_body): Use HTML básico (<h2>, <p>). 
    - IMPORTANTE: NÃO inclua NENHUMA imagem (tags <img>) ou referências a mídias no corpo do texto. O sistema já cuidará da imagem de destaque. Remova qualquer tag de imagem que venha no texto original.
    - Tags: Gere 3 a 5 tags relevantes baseadas no conteúdo.

    DADOS ORIGINAIS:
    Título: ${item.original_title}
    Descrição: ${cleanDescription} 
    Fonte original: ${item.source.name}

    RETORNE APENAS UM JSON VÁLIDO NO SEGUINTE FORMATO:
    {
      "ai_title": "...",
      "ai_lead": "...",
      "ai_body": "...",
      "ai_tags": ["tag1", "tag2"],
      "word_count": 0
    }
  `;

  try {
    const result = await model.generateContent(prompt);
    const textResponse = result.response.text().trim();

    // Extrai JSON se houver markdown code blocks
    const jsonMatch = textResponse.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error("Falha ao gerar formato JSON");

    const parsed = JSON.parse(jsonMatch[0]);

    const finalResponse = {
      ...parsed,
      original_source: item.source.name,
      original_link: item.original_link,
      confidence: 0.99
    };

    await prisma.rSSItemRaw.update({
      where: { id: itemId },
      data: { status: "ai_generated" }
    });

    await prisma.rewriteLog.create({
      data: {
        rss_item_id: itemId,
        ai_prompt: prompt,
        ai_response: finalResponse as any,
      }
    });

    revalidatePath(`/erp/curadoria/review/${itemId}`);
    return { success: true, aiResponse: finalResponse };

  } catch (error: any) {
    console.error("Erro Gemini:", error);
    throw new Error("Erro na comunicação com a IA: " + error.message);
  }
}

// --- FINAL PUBLISH (Task 7) ---

export async function approveAndPublish(itemId: string, finalData: any) {
  const session = await getServerSession(authOptions);
  if (!session) throw new Error("Não autorizado");

  const item = await prisma.rSSItemRaw.findUnique({
    where: { id: itemId },
    include: { source: true }
  });
  if (!item) throw new Error("Item não encontrado");

  // Encontra uma categoria compatível ou usa uma padrão
  const category = await prisma.category.findFirst();

  // Cria o Artigo Final
  const article = await prisma.article.create({
    data: {
      titulo: finalData.titulo,
      slug: finalData.titulo.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, ''),
      resumo: finalData.resumo,
      corpo_texto: finalData.corpo_texto,
      categoria_id: category?.id,
      autor_id: session.user.id,
      status_id: ArticleStatus.publicado,
      is_premium: false,
      publish_channels: ["portal"],
      og_image_url: item.thumbnail, // Propaga a imagem do RSS para o artigo
      source_url: item.original_link,
      external_author: item.source.name,
      human_reviewer: (session.user as any).name || (session.user as any).nome || "Editor",
      rss_item_id: item.id
    }
  });

  await prisma.rSSItemRaw.update({
    where: { id: itemId },
    data: { status: "published" }
  });

  revalidatePath("/erp/curadoria/dashboard");
  revalidatePath("/erp/artigos");
  return { success: true, articleId: article.id };
}
