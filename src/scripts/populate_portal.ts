
import { PrismaClient } from '@prisma/client';
import Parser from 'rss-parser';

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
  const content = (item as any).content || item.contentSnippet || "";
  const imgMatch = content.match(/<img[^>]+src="([^">]+)"/);
  if (imgMatch && imgMatch[1]) {
    if (!imgMatch[1].includes("feedburner.com") && !imgMatch[1].includes("doubleclick.net")) {
      return imgMatch[1];
    }
  }
  return null;
}

async function main() {
  console.log("🚀 Iniciando população de notícias via RSS...");

  // 1. Definir/Garantir Fontes
  const sources = [
    { title: "G1 - Política", url: "https://g1.globo.com/rss/g1/politica/", tone: "jornalistico" },
    { title: "G1 - Economia", url: "https://g1.globo.com/rss/g1/economia/", tone: "analitico" },
    { title: "R7 Notícias", url: "https://noticias.r7.com/feed.xml", tone: "direto" },
    { title: "CNN Brasil", url: "https://www.cnnbrasil.com.br/feed/", tone: "sério" },
  ];

  for (const s of sources) {
    const source = await prisma.rSSSource.upsert({
      where: { feed_url: s.url },
      update: {},
      create: {
        name: s.title,
        feed_url: s.url,
        tone: s.tone,
        regiao: "Nacional"
      }
    });

    console.log(`📥 Coletando de: ${source.name}...`);
    try {
      const feed = await parser.parseURL(source.feed_url);
      const category = await prisma.category.findFirst() || await prisma.category.create({
        data: { nome: "Sem Categoria", slug: "sem-categoria" }
      });
      const admin = await prisma.user.findFirst({ where: { cargo: { nome: "admin" } } }) || await prisma.user.findFirst();

      if (!admin) {
        console.error("❌ Nenhum usuário encontrado para associar matérias.");
        continue;
      }

      let count = 0;
      for (const item of feed.items.slice(0, 5)) { // Pegar 5 de cada p/ não poluir tanto
        const guid = item.guid || item.link;
        if (!guid) continue;

        const imageUrl = extractImage(item);
        if (!imageUrl) continue; // Só popula o que TEM imagem para o demo

        // Cria o RSS Item
        const rssItem = await prisma.rSSItemRaw.upsert({
          where: { guid },
          update: { thumbnail: imageUrl },
          create: {
            source_id: source.id,
            guid,
            original_title: item.title || "Sem título",
            original_link: item.link || "",
            description: item.contentSnippet || item.content || "",
            thumbnail: imageUrl,
            status: "published" // Marca como publicado para simular workflow completo
          }
        });

        // Cria o Artigo Final (Automático para o demo)
        const slug = (item.title || "noticia-" + Date.now())
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/(^-|-$)+/g, '');

        await prisma.article.upsert({
          where: { slug },
          update: { og_image_url: imageUrl },
          create: {
            titulo: item.title || "Sem título",
            slug,
            resumo: item.contentSnippet?.slice(0, 200) || "Resumo da notícia coletada via RSS.",
            corpo_texto: (item as any).content || item.contentSnippet || "Conteúdo não disponível.",
            categoria_id: category.id,
            autor_id: admin.id,
            status_id: "publicado",
            og_image_url: imageUrl,
            external_author: source.name,
            source_url: item.link,
            rss_item_id: rssItem.id,
            data_publicacao: new Date()
          }
        });
        count++;
      }
      console.log(`✅ ${count} notícias publicadas com imagem de ${source.name}`);
    } catch (e) {
      console.error(`❌ Erro ao processar ${source.name}:`, e);
    }
  }

  console.log("\n✨ População concluída com sucesso!");
  process.exit(0);
}

main();
