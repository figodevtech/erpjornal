"use server";

import { GoogleGenerativeAI } from "@google/generative-ai";
import Parser from "rss-parser";
import { revalidatePath } from "next/cache";
import { gunzipSync, inflateSync } from "node:zlib";

import { exigirPermissao } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { extractPlainTextFromHtml, sanitizeHtmlForRender } from "@/lib/tts-utils";
import { ArticleStatus } from "@/lib/types/article-status";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

type RssItem = {
  title?: string;
  link?: string;
  guid?: string;
  isoDate?: string;
  content?: string;
  contentSnippet?: string;
  description?: string;
  enclosure?: {
    url?: string;
    type?: string;
  };
  image?: { url?: string } | string;
  thumbnail?: string;
  author?: string;
  creator?: string;
  "imagem-destaque"?: string;
  "content:encoded"?: string;
  "media:content"?: Array<{ $?: { url?: string }; url?: string }> | { $?: { url?: string }; url?: string };
  "media:thumbnail"?: Array<{ $?: { url?: string }; url?: string }> | { $?: { url?: string }; url?: string };
};

export async function saveRSSSource(formData: FormData) {
  await exigirPermissao("curadoria:gerir");

  try {
    const id = formData.get("id") as string | null;
    const name = formData.get("name") as string;
    const urlFeed = formData.get("urlFeed") as string;
    const tone = ((formData.get("tone") as string) || "jornalistico").trim();
    const regiao = ((formData.get("regiao") as string) || "Nacional").trim();
    const estado = ((formData.get("estado") as string) || "").toUpperCase().slice(0, 2) || null;
    const cacheTtl = parseInt((formData.get("cacheTtl") as string) || "30", 10);
    const ativa = formData.get("ativa") === "true";

    if (!name || !urlFeed) {
      throw new Error("Nome e URL sao obrigatorios");
    }

    const data = {
      name,
      urlFeed,
      tone,
      regiao,
      estado,
      cacheTtl,
      ativa,
    };

    if (id) {
      await prisma.fonteRss.update({ where: { id }, data });
    } else {
      await prisma.fonteRss.create({ data });
    }

    revalidatePath("/erp/curadoria/fontes");
    return { success: true };
  } catch (error: any) {
    console.error("Erro ao salvar fonte:", error);
    if (error?.code === "P2002") {
      throw new Error("Ja existe uma fonte com esta URL de feed.");
    }
    throw new Error(error?.message || "Erro ao salvar fonte");
  }
}

export async function deleteRSSSource(id: string) {
  await exigirPermissao("curadoria:gerir");

  await prisma.fonteRss.delete({ where: { id } });
  revalidatePath("/erp/curadoria/fontes");
  return { success: true };
}

export async function toggleRSSSourceStatus(id: string, currentStatus: boolean) {
  await exigirPermissao("curadoria:gerir");

  await prisma.fonteRss.update({
    where: { id },
    data: { ativa: !currentStatus },
  });

  revalidatePath("/erp/curadoria/fontes");
  return { success: true };
}

function normalizeHtmlText(html?: string | null) {
  if (!html) return "";
  return html
    .replace(/&quot;/gi, '"')
    .replace(/&#34;/gi, '"')
    .replace(/&#39;/gi, "'")
    .replace(/&amp;/gi, "&");
}

function pickImageFromHtml(html?: string | null) {
  const normalized = normalizeHtmlText(html);
  if (!normalized) return null;

  const candidates = [
    ...normalized.matchAll(/<img[^>]+src=["']?([^"'>\s]+)["']?/gi),
    ...normalized.matchAll(/<source[^>]+srcset=["']?([^"'>\s,]+)[^"'>]*["']?/gi),
  ];

  for (const match of candidates) {
    const url = match[1];
    if (!url) continue;
    if (url.includes("feedburner.com") || url.includes("doubleclick.net")) continue;
    return url;
  }

  return null;
}

function isUsableImageUrl(url?: string | null) {
  if (!url) return false;

  const normalized = url.toLowerCase();

  if (
    normalized.includes("feedburner.com") ||
    normalized.includes("doubleclick.net") ||
    normalized.includes("/ebc.png") ||
    normalized.includes("/ebc.gif") ||
    normalized.includes("logo-agenciabrasil") ||
    normalized.includes("/logo") ||
    normalized.endsWith(".svg")
  ) {
    return false;
  }

  return true;
}

function extractImage(item: RssItem) {
  if (isUsableImageUrl(item["imagem-destaque"])) {
    return item["imagem-destaque"];
  }

  if (item.enclosure?.url && item.enclosure?.type?.startsWith("image/")) {
    if (isUsableImageUrl(item.enclosure.url)) {
      return item.enclosure.url;
    }
  }

  const mediaCandidates = [item["media:content"], item["media:thumbnail"]];
  for (const mediaContent of mediaCandidates) {
    if (!mediaContent) continue;
    if (Array.isArray(mediaContent)) {
      const firstItem = mediaContent[0];
      if (isUsableImageUrl(firstItem?.$?.url)) return firstItem?.$?.url ?? null;
      if (isUsableImageUrl(firstItem?.url)) return firstItem?.url ?? null;
      continue;
    }

    if (isUsableImageUrl(mediaContent.$?.url)) return mediaContent.$?.url ?? null;
    if (isUsableImageUrl(mediaContent.url)) return mediaContent.url ?? null;
  }

  if (typeof item.image === "string" && isUsableImageUrl(item.image)) return item.image;
  if (typeof item.image === "object" && typeof item.image?.url === "string" && isUsableImageUrl(item.image.url)) {
    return item.image.url;
  }
  if (typeof item.thumbnail === "string" && isUsableImageUrl(item.thumbnail)) return item.thumbnail;

  const htmlImage =
    pickImageFromHtml(item["content:encoded"]) ||
    pickImageFromHtml(item.content) ||
    pickImageFromHtml(item.contentSnippet) ||
    pickImageFromHtml(item.description);

  return isUsableImageUrl(htmlImage) ? htmlImage : null;
}

async function downloadFeedXml(url: string) {
  const response = await fetch(url, {
    headers: {
      "user-agent": "Mozilla/5.0 (compatible; RevistaGestaoBot/1.0; +https://revistagestao.local)",
      accept: "application/rss+xml, application/xml, text/xml, application/atom+xml, */*",
      "accept-encoding": "gzip, deflate, br",
      "cache-control": "no-cache",
    },
    next: { revalidate: 0 },
  });

  if (!response.ok) {
    throw new Error(`Feed respondeu com status ${response.status}.`);
  }

  const arrayBuffer = await response.arrayBuffer();
  let buffer = Buffer.from(arrayBuffer);

  if (buffer.length >= 2 && buffer[0] === 0x1f && buffer[1] === 0x8b) {
    buffer = gunzipSync(buffer);
  } else if (buffer.length >= 2 && buffer[0] === 0x78) {
    try {
      buffer = inflateSync(buffer);
    } catch {
      // keep original buffer when payload is not deflate
    }
  }

  let xml = buffer.toString("utf-8");

  if (xml.charCodeAt(0) === 0xfeff) {
    xml = xml.slice(1);
  }

  return xml.trimStart();
}

async function fetchOriginalPageImage(url: string) {
  const response = await fetch(url, {
    headers: {
      "user-agent": "Mozilla/5.0 (compatible; RevistaGestaoBot/1.0; +https://revistagestao.local)",
      accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
      "cache-control": "no-cache",
    },
    next: { revalidate: 0 },
  });

  if (!response.ok) return null;

  const html = await response.text();
  const patterns = [
    /<meta[^>]+property=["']og:image["'][^>]+content=["']([^"']+)["']/i,
    /<meta[^>]+content=["']([^"']+)["'][^>]+property=["']og:image["']/i,
    /<meta[^>]+name=["']twitter:image["'][^>]+content=["']([^"']+)["']/i,
    /<meta[^>]+content=["']([^"']+)["'][^>]+name=["']twitter:image["']/i,
  ];

  for (const pattern of patterns) {
    const match = html.match(pattern);
    if (match?.[1]) {
      return match[1];
    }
  }

  return null;
}

function createRssParser() {
  return new Parser<RssItem>({
    customFields: {
      item: [
        ["media:content", "media:content"],
        ["media:thumbnail", "media:thumbnail"],
        ["imagem-destaque", "imagem-destaque"],
        ["content:encoded", "content:encoded"],
        ["image", "image"],
      ],
    },
  });
}

async function findFeedItemInSource(sourceUrl: string, guid?: string | null, link?: string | null) {
  if (!guid && !link) return null;

  const xml = await downloadFeedXml(sourceUrl);
  const feed = await createRssParser().parseString(xml);

  return (
    feed.items.find((item) => (guid && item.guid === guid) || (link && item.link === link)) || null
  );
}

function slugify(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "");
}

async function createUniqueSlug(title: string) {
  const base = slugify(title) || `artigo-${Date.now()}`;
  let slug = base;
  let suffix = 2;

  while (await prisma.artigo.findUnique({ where: { slug }, select: { id: true } })) {
    slug = `${base}-${suffix}`;
    suffix += 1;
  }

  return slug;
}

function escapeHtml(text: string) {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function convertPlainTextToHtml(text: string) {
  const normalized = text
    .replace(/\r/g, "")
    .replace(/\u00a0/g, " ")
    .replace(/[ \t]+/g, " ")
    .trim();

  if (!normalized) {
    return "";
  }

  const paragraphs = normalized.includes("\n\n")
    ? normalized
        .split(/\n{2,}/)
        .map((paragraph) => paragraph.trim())
        .filter(Boolean)
    : normalized
        .split(/(?<=[.!?])\s+(?=[A-ZÀ-Ú0-9])/)
        .reduce<string[]>((acc, sentence, index) => {
          const current = acc[acc.length - 1];
          if (!current || index % 3 === 0) {
            acc.push(sentence.trim());
          } else {
            acc[acc.length - 1] = `${current} ${sentence.trim()}`.trim();
          }
          return acc;
        }, []);

  return paragraphs.map((paragraph) => `<p>${escapeHtml(paragraph)}</p>`).join("");
}

function normalizeArticleHtml(html: string) {
  const stripped = html
    .replace(/<p[^>]*>\s*<a[^>]*>\s*<img[^>]*(logo|svg|brand)[^>]*>\s*<\/a>\s*<\/p>/gi, "")
    .replace(/<a[^>]*>\s*<img[^>]*(logo-agenciabrasil|\.svg)[^>]*>\s*<\/a>/gi, "")
    .replace(/<img[^>]+src=["'][^"']*(ebc\.png|ebc\.gif|logo-agenciabrasil|\.svg)[^"']*["'][^>]*>/gi, "")
    .replace(/<p[^>]*>\s*<img[^>]+src=["'][^"']*(ebc\.png|ebc\.gif)[^"']*["'][^>]*>\s*<\/p>/gi, "")
    .replace(/<p[^>]*>\s*<p\b/gi, "<p")
    .replace(/<\/p>\s*<\/p>/gi, "</p>")
    .replace(/<p>\s*<(h2|h3|h4|ul|ol|blockquote|figure)\b/gi, "<$1")
    .replace(/<\/(h2|h3|h4|ul|ol|blockquote|figure)>\s*<\/p>/gi, "</$1>")
    .replace(/<h3[^>]*>\s*Noticias relacionadas:\s*<\/h3>\s*<ul[\s\S]*?<\/ul>/gi, "")
    .replace(/<aside[\s\S]*?<\/aside>/gi, "")
    .replace(/<section[^>]*class=["'][^"']*gallery[^"']*["'][^>]*>[\s\S]*?<\/section>/gi, "")
    .replace(/<div[^>]*class=["'][^"']*(custom__ad__element|post__video|cnn component-video|gallery__|read-too)[^"']*["'][^>]*>[\s\S]*?<\/div>/gi, "")
    .replace(/<div[^>]*id=["']mid\d+["'][^>]*>[\s\S]*?<\/div>/gi, "")
    .replace(/<iframe[\s\S]*?<\/iframe>/gi, "")
    .replace(/<video[\s\S]*?<\/video>/gi, "")
    .replace(/<script[\s\S]*?<\/script>/gi, "")
    .replace(/<button[\s\S]*?<\/button>/gi, "")
    .replace(/<svg[\s\S]*?<\/svg>/gi, "")
    .replace(/<input[^>]*>/gi, "")
    .replace(/<label[\s\S]*?<\/label>/gi, "")
    .replace(/<source[^>]*>/gi, "")
    .replace(/<picture[^>]*>/gi, "")
    .replace(/<\/picture>/gi, "")
    .replace(/<figure[^>]*>/gi, "<figure>")
    .replace(/<figcaption[^>]*>/gi, "<figcaption>")
    .replace(/<(\/?)(div|section|article)[^>]*>/gi, "")
    .replace(/<br\s*\/?>\s*(<br\s*\/?>\s*)+/gi, "<br />")
    .replace(/<p>\s*(?:&nbsp;|\s)*<\/p>/gi, "");

  const sanitized = sanitizeHtmlForRender(stripped)
    .replace(/<iframe[\s\S]*?<\/iframe>/gi, "")
    .replace(/<video[\s\S]*?<\/video>/gi, "")
    .replace(/<script[\s\S]*?<\/script>/gi, "")
    .replace(/<p>\s*(?:&nbsp;|\s)*<\/p>/gi, "")
    .replace(/<figure>\s*<figcaption[\s\S]*?<\/figcaption>\s*<\/figure>/gi, "")
    .replace(/<figure>\s*(?![\s\S]*?<img\b)(?![\s\S]*?<video\b)[\s\S]*?<\/figure>/gi, "")
    .replace(/<figcaption[\s\S]*?<\/figcaption>/gi, "")
    .replace(/<figure>\s*(<img[^>]*>)\s*<\/figure>/gi, "$1")
    .replace(/<p>\s*<\/p>/gi, "")
    .trim();

  if (!sanitized) {
    return "";
  }

  if (/<(p|h2|h3|blockquote|ul|ol|li|figure|img|figcaption)\b/i.test(sanitized)) {
    return sanitized;
  }

  const plainText = extractPlainTextFromHtml(sanitized);
  return convertPlainTextToHtml(plainText);
}

function buildOriginalContentHtml(item: {
  description: string | null;
  source: { name: string };
  linkOriginal: string;
  dataPublicacao: Date;
}) {
  const contentHtml =
    normalizeArticleHtml(item.description || "") ||
    "<p>O feed original nao disponibilizou o corpo integral da noticia para republicacao.</p>";

  return `${contentHtml}
    <hr />
    <p><strong>Credito da fonte:</strong> ${escapeHtml(item.source.name)}</p>
    <p><strong>Link original:</strong> <a href="${escapeHtml(item.linkOriginal)}" target="_blank" rel="noopener noreferrer">${escapeHtml(item.linkOriginal)}</a></p>
    <p><strong>Data da publicacao original:</strong> ${item.dataPublicacao.toLocaleDateString("pt-BR")} as ${item.dataPublicacao.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}</p>`;
}

export async function harvestFeed(sourceId: string, limit: number = 10) {
  await exigirPermissao("curadoria:gerir");

  try {
    const source = await prisma.fonteRss.findUnique({ where: { id: sourceId } });
    if (!source) throw new Error("Fonte nao encontrada");

    const xml = await downloadFeedXml(source.urlFeed);
    const feed = await createRssParser().parseString(xml);

    let newItemsCount = 0;

    for (const item of feed.items) {
      if (limit > 0 && newItemsCount >= limit) break;

      const guid = item.guid || item.link;
      if (!guid) continue;

      const existing = await prisma.itemRssBruto.findUnique({ where: { guid } });
      if (existing) continue;

      const imageUrl = extractImage(item) || (item.link ? await fetchOriginalPageImage(item.link) : null);
      const rawContent =
        item["content:encoded"] ||
        item.content ||
        item.contentSnippet ||
        item.description ||
        "";

      await prisma.itemRssBruto.create({
        data: {
          sourceId: source.id,
          guid,
          tituloOriginal: item.title || "Sem titulo",
          linkOriginal: item.link || "",
          autorOriginal: item.creator || item.author || source.name,
          description: rawContent,
          thumbnail: imageUrl,
          dataPublicacao: item.isoDate ? new Date(item.isoDate) : new Date(),
          status: "pending",
        },
      });

      newItemsCount += 1;
    }

    await prisma.fonteRss.update({
      where: { id: sourceId },
      data: { lastHarvest: new Date() },
    });

    revalidatePath("/erp/curadoria/fontes");
    revalidatePath("/erp/curadoria/dashboard");
    return { success: true, count: newItemsCount };
  } catch (error) {
    console.error("Harvest Error:", error);
    throw new Error(
      "Erro ao coletar feed: " + (error instanceof Error ? error.message : "Desconhecido"),
    );
  }
}

export async function selectRSSItem(id: string) {
  await exigirPermissao("curadoria:aprovar");

  await prisma.itemRssBruto.update({
    where: { id },
    data: { status: "selected" },
  });

  revalidatePath("/erp/curadoria/dashboard");
  return { success: true };
}

export async function rejectRSSItem(id: string) {
  await exigirPermissao("curadoria:aprovar");

  await prisma.itemRssBruto.update({
    where: { id },
    data: { status: "rejected" },
  });

  revalidatePath("/erp/curadoria/dashboard");
  return { success: true };
}

export async function rewriteWithAI(itemId: string) {
  await exigirPermissao("curadoria:aprovar");

  const item = await prisma.itemRssBruto.findUnique({
    where: { id: itemId },
    include: { source: true },
  });
  if (!item) throw new Error("Item nao encontrado");

  const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
  const cleanDescription = (item.description || "").replace(/<img[^>]*>/g, "");

  const prompt = `
    Voce e um editor senior da Revista Gestao, sediada em Brasilia.
    Seu publico sao executivos, politicos e tomadores de decisao.

    TAREFA: Reescreva esta noticia para torna-la exclusiva, profissional e adaptada ao nosso tom.

    DIRETRIZES:
    - Tom de voz: ${item.source.tone || "Profissional e Executivo"}
    - Foco Regional: ${item.source.regiao || "Brasil/Nacional"}
    - Titulo: Deve ser impactante e serio.
    - Lead: Um resumo que prenda a atencao do tomador de decisao.
    - Corpo HTML (ai_body): Use HTML basico (<h2>, <p>).
    - IMPORTANTE: Nao inclua nenhuma imagem (tags <img>) ou referencias a midias no corpo do texto.
    - Tags: Gere 3 a 5 tags relevantes baseadas no conteudo.

    DADOS ORIGINAIS:
    Titulo: ${item.tituloOriginal}
    Descricao: ${cleanDescription}
    Fonte original: ${item.source.name}

    RETORNE APENAS UM JSON VALIDO NO SEGUINTE FORMATO:
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
    const jsonMatch = textResponse.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error("Falha ao gerar formato JSON");

    const parsed = JSON.parse(jsonMatch[0]);
    const finalResponse = {
      ...parsed,
      original_source: item.source.name,
      linkOriginal: item.linkOriginal,
      confidence: 0.99,
    };

    await prisma.itemRssBruto.update({
      where: { id: itemId },
      data: { status: "ai_generated" },
    });

    await prisma.logReescrita.create({
      data: {
        itemRssId: itemId,
        promptIa: prompt,
        respostaIa: finalResponse,
      },
    });

    revalidatePath(`/erp/curadoria/review/${itemId}`);
    return { success: true, aiResponse: finalResponse };
  } catch (error: any) {
    console.error("Erro Gemini:", error);
    throw new Error("Erro na comunicacao com a IA: " + error.message);
  }
}

export async function approveAndPublish(
  itemId: string,
  finalData: { titulo: string; resumo: string; corpoTexto: string; categoriaId?: string | null }
) {
  const session = await exigirPermissao("curadoria:aprovar");

  const item = await prisma.itemRssBruto.findUnique({
    where: { id: itemId },
    include: { source: true },
  });
  if (!item) throw new Error("Item nao encontrado");

  const category =
    (finalData.categoriaId
      ? await prisma.categoria.findUnique({ where: { id: finalData.categoriaId } })
      : null) || (await prisma.categoria.findFirst());
  const slug = await createUniqueSlug(finalData.titulo);

  const artigo = await prisma.artigo.create({
    data: {
      titulo: finalData.titulo,
      slug,
      resumo: finalData.resumo,
      corpoTexto: finalData.corpoTexto,
      categoriaId: category?.id,
      autorId: session.user.id,
      status: ArticleStatus.publicado,
      dataPublicacao: new Date(),
      ehPremium: false,
      canaisPublicacao: ["portal"],
      urlImagemOg: item.thumbnail,
      urlFonte: item.linkOriginal,
      autorExterno: item.source.name,
      revisorHumano: (session.user as any).name || (session.user as any).nome || "Editor",
      itemRssId: item.id,
    },
  });

  await prisma.itemRssBruto.update({
    where: { id: itemId },
    data: { status: "published" },
  });

  revalidatePath("/erp/curadoria/dashboard");
  revalidatePath("/erp/artigos");
  revalidatePath("/");
  revalidatePath(`/noticia/${artigo.slug}`);
  return { success: true, artigoId: artigo.id };
}

export async function republishOriginalWithCredits(itemId: string, categoriaId?: string | null) {
  const session = await exigirPermissao("curadoria:aprovar");

  const item = await prisma.itemRssBruto.findUnique({
    where: { id: itemId },
    include: { source: true },
  });
  if (!item) throw new Error("Item nao encontrado");

  const category =
    (categoriaId ? await prisma.categoria.findUnique({ where: { id: categoriaId } }) : null) ||
    (await prisma.categoria.findFirst());
  const slug = await createUniqueSlug(item.tituloOriginal);

  let description = item.description || "";
  let thumbnail = item.thumbnail;

  if (extractPlainTextFromHtml(description).length < 900) {
    const refreshedFeedItem = await findFeedItemInSource(item.source.urlFeed, item.guid, item.linkOriginal);
    if (refreshedFeedItem) {
      const refreshedDescription =
        refreshedFeedItem["content:encoded"] ||
        refreshedFeedItem.content ||
        refreshedFeedItem.contentSnippet ||
        refreshedFeedItem.description ||
        description;
      const refreshedThumbnail =
        extractImage(refreshedFeedItem) ||
        thumbnail ||
        (refreshedFeedItem.link ? await fetchOriginalPageImage(refreshedFeedItem.link) : null);

      description = refreshedDescription;
      thumbnail = refreshedThumbnail;

      await prisma.itemRssBruto.update({
        where: { id: item.id },
        data: {
          description,
          thumbnail,
        },
      });
    }
  }

  const plainText = extractPlainTextFromHtml(description);
  const resumo =
    plainText.length > 220
      ? `${plainText.slice(0, 217).trim()}...`
      : plainText || "Conteudo republicado com creditos da fonte original.";

  const artigo = await prisma.artigo.create({
    data: {
      titulo: item.tituloOriginal,
      slug,
      resumo,
      corpoTexto: buildOriginalContentHtml({
        description,
        source: item.source,
        linkOriginal: item.linkOriginal,
        dataPublicacao: item.dataPublicacao,
      }),
      categoriaId: category?.id,
      autorId: session.user.id,
      status: ArticleStatus.publicado,
      dataPublicacao: new Date(),
      ehPremium: false,
      canaisPublicacao: ["portal"],
      urlImagemOg: thumbnail,
      urlFonte: item.linkOriginal,
      autorExterno: item.source.name,
      revisorHumano: (session.user as any).name || (session.user as any).nome || "Editor",
      itemRssId: item.id,
    },
  });

  await prisma.itemRssBruto.update({
    where: { id: itemId },
    data: { status: "published" },
  });

  revalidatePath("/erp/curadoria/dashboard");
  revalidatePath("/erp/artigos");
  revalidatePath("/");
  revalidatePath(`/noticia/${artigo.slug}`);
  return { success: true, artigoId: artigo.id };
}
