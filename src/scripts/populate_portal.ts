import { PrismaClient } from "@prisma/client";
import Parser from "rss-parser";

const prisma = new PrismaClient();
const parser = new Parser({
  customFields: {
    item: [
      ["media:content", "media:content"],
      ["media:thumbnail", "media:thumbnail"],
      ["image", "image"],
    ],
  },
});

function extractImage(item: any): string | null {
  if (item.enclosure?.url && item.enclosure?.type?.startsWith("image/")) {
    return item.enclosure.url;
  }

  const mediaContent = item["media:content"] || item["media:thumbnail"];
  if (mediaContent) {
    if (Array.isArray(mediaContent) && mediaContent[0]?.$.url) return mediaContent[0].$.url;
    if (mediaContent.$?.url) return mediaContent.$.url;
  }

  const content = item.content || item.contentSnippet || "";
  const imgMatch = content.match(/<img[^>]+src="([^">]+)"/);
  if (imgMatch?.[1] && !imgMatch[1].includes("feedburner.com") && !imgMatch[1].includes("doubleclick.net")) {
    return imgMatch[1];
  }

  return null;
}

async function main() {
  console.log("Iniciando população de notícias via RSS...");

  const sources = [
    { titulo: "G1 - Política", url: "https://g1.globo.com/rss/g1/politica/", tom: "jornalistico" },
    { titulo: "G1 - Economia", url: "https://g1.globo.com/rss/g1/economia/", tom: "analitico" },
    { titulo: "R7 Notícias", url: "https://noticias.r7.com/feed.xml", tom: "direto" },
    { titulo: "CNN Brasil", url: "https://www.cnnbrasil.com.br/feed/", tom: "serio" },
  ];

  for (const sourceSeed of sources) {
    const fonte = await prisma.fonteRss.upsert({
      where: { urlFeed: sourceSeed.url },
      update: {},
      create: {
        name: sourceSeed.titulo,
        urlFeed: sourceSeed.url,
        tone: sourceSeed.tom,
        regiao: "Nacional",
      },
    });

    console.log(`Coletando de: ${fonte.name}...`);

    try {
      const feed = await parser.parseURL(fonte.urlFeed);
      const categoria =
        (await prisma.categoria.findFirst()) ||
        (await prisma.categoria.create({
          data: { nome: "Sem Categoria", slug: "sem-categoria" },
        }));

      const admin =
        (await prisma.usuario.findFirst({
          where: {
            perfis: {
              some: {
                perfil: {
                  nome: "admin_erp",
                },
              },
            },
          },
        })) || (await prisma.usuario.findFirst());

      if (!admin) {
        console.error("Nenhum usuário encontrado para associar matérias.");
        continue;
      }

      let count = 0;
      for (const item of feed.items.slice(0, 5)) {
        const guid = item.guid || item.link;
        if (!guid) continue;

        const imageUrl = extractImage(item);
        if (!imageUrl) continue;

        const itemRss = await prisma.itemRssBruto.upsert({
          where: { guid },
          update: { thumbnail: imageUrl },
          create: {
            sourceId: fonte.id,
            guid,
            tituloOriginal: item.title || "Sem título",
            linkOriginal: item.link || "",
            description: item.contentSnippet || item.content || "",
            thumbnail: imageUrl,
            status: "published",
          },
        });

        const slug = (item.title || `noticia-${Date.now()}`)
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/(^-|-$)+/g, "");

        await prisma.artigo.upsert({
          where: { slug },
          update: { urlImagemOg: imageUrl },
          create: {
            titulo: item.title || "Sem título",
            slug,
            resumo: item.contentSnippet?.slice(0, 200) || "Resumo da notícia coletada via RSS.",
            corpoTexto: item.content || item.contentSnippet || "Conteúdo não disponível.",
            categoriaId: categoria.id,
            autorId: admin.id,
            status: "publicado",
            urlImagemOg: imageUrl,
            autorExterno: fonte.name,
            urlFonte: item.link,
            itemRssId: itemRss.id,
            dataPublicacao: new Date(),
          },
        });

        count++;
      }

      console.log(`${count} notícias publicadas com imagem de ${fonte.name}`);
    } catch (error) {
      console.error(`Erro ao processar ${fonte.name}:`, error);
    }
  }

  console.log("População concluída com sucesso!");
  process.exit(0);
}

main();
