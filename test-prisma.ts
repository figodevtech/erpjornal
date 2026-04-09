import { prisma } from "./src/lib/prisma";

async function main() {
  const artigo = await prisma.artigo.findFirst({
    where: { status: "publicado" }
  });

  if (artigo) {
    console.log("ehPremium exists:", "ehPremium" in artigo);
    console.log("Value:", artigo.ehPremium);
  } else {
    console.log("No article found");
  }
}

main().catch(console.error);
