import { prisma } from "./src/lib/prisma";

async function main() {
  const article = await prisma.article.findFirst({
    where: { status_id: "publicado" }
  });
  if (article) {
    console.log("is_premium exists:", "is_premium" in article);
    console.log("Value:", (article as any).is_premium);
  } else {
    console.log("No article found");
  }
}

main().catch(console.error);
