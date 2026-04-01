import { SearchService } from "./src/lib/services/search-service";
import { prisma } from "./src/lib/prisma";

async function test() {
  try {
    console.log("--- TEST 1: Query 'Bolsonaro' ---");
    const res1 = await SearchService.search({ query: "Bolsonaro" });
    console.log("Total:", res1.total);
    console.log("Types found:", res1.results.map(r => r.type));
    if (res1.results.length > 0) console.log("First title:", res1.results[0].title);

    console.log("\n--- TEST 2: Author Filter Only ---");
    const author = await prisma.user.findFirst({ where: { articles_authored: { some: {} } } });
    if (author) {
      const res2 = await SearchService.search({ query: "", author: author.id });
      console.log(`Author found: ${author.nome} (ID: ${author.id})`);
      console.log("Total articles in SearchService result:", res2.total);
      
      const directCount = await prisma.article.count({ where: { autor_id: author.id, status_id: "publicado" } });
      console.log("Direct count in DB (published):", directCount);
    } else {
      console.log("No author found with articles.");
    }
  } catch (err) {
    console.error("TEST FAILED:", err);
  } finally {
    await prisma.$disconnect();
  }
}

test();
