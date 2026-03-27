"use server";

import { prisma } from "@/lib/prisma";
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

  const id = formData.get("id") as string | null;
  const name = formData.get("name") as string;
  const feed_url = formData.get("feed_url") as string;
  const tone = formData.get("tone") as string || "jornalistico";
  const regiao = formData.get("regiao") as string || "Nacional";
  const estado = (formData.get("estado") as string || "").toUpperCase().slice(0, 2) || null;
  const cache_ttl = parseInt(formData.get("cache_ttl") as string || "30");

  if (!name || !feed_url) throw new Error("Nome e URL são obrigatórios");

  const data = {
    name,
    feed_url,
    tone,
    regiao,
    estado,
    cache_ttl
  };

  if (id) {
    await prisma.rSSSource.update({ where: { id }, data });
  } else {
    await prisma.rSSSource.create({ data });
  }

  revalidatePath("/erp/curadoria/fontes");
  return { success: true };
}

export async function deleteRSSSource(id: string) {
  const session = await getServerSession(authOptions);
  if (session?.user?.role !== "admin") throw new Error("Não autorizado");

  await prisma.rSSSource.delete({ where: { id } });
  revalidatePath("/erp/curadoria/fontes");
  return { success: true };
}

// --- Harvester ---

export async function harvestFeed(sourceId: string) {
  try {
    const source = await prisma.rSSSource.findUnique({ where: { id: sourceId } });
    if (!source) throw new Error("Fonte não encontrada");

    const feed = await parser.parseURL(source.feed_url);

    let newItemsCount = 0;

    for (const item of feed.items) {
      const guid = item.guid || item.link;
      if (!guid) continue;

      const existing = await prisma.rSSItemRaw.findUnique({ where: { guid } });
      if (!existing) {
        await prisma.rSSItemRaw.create({
          data: {
            source_id: source.id,
            guid,
            original_title: item.title || "Sem título",
            original_link: item.link || "",
            original_author: item.creator || item.author || source.name,
            description: item.contentSnippet || item.content || "",
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

  const prompt = `
    Você é um editor sênior da Revista Gestão, sediada em Brasília. 
    Seu público são executivos, políticos e tomadores de decisão.
    
    TAREFA: Reescreva esta notícia para torná-la exclusiva, profissional e adaptada ao nosso tom.
    
    DIRETRIZES:
    - Tom de voz: ${item.source.tone || 'Profissional e Executivo'}
    - Foco Regional: ${item.source.regiao || 'Brasil/Nacional'}
    - Título: Deve ser impactante e sério.
    - Lead: Um resumo que prenda a atenção do tomador de decisão.
    - Corpo: Use HTML básico (<h2>, <p>) para formatação. Mantenha os fatos mas mude a narrativa.
    - Tags: Gere 3 a 5 tags relevantes.

    DADOS ORIGINAIS:
    Título: ${item.original_title}
    Descrição: ${item.description}
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
      status_id: "publicado",
      is_premium: false,
      publish_channels: ["portal"],
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
