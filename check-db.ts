const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function check() {
  const articles = await prisma.article.findMany({
    select: { status_id: true, titulo: true },
    take: 10
  });
  console.log("ARTICLES SCAN:", articles);
  
  const users = await prisma.user.findMany({ select: { id: true, nome: true }, take: 5 });
  console.log("USERS SCAN:", users);
  
  await prisma.$disconnect();
}

check();
