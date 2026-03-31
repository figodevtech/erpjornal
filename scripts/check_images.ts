import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

async function main() {
  const articles = await prisma.article.findMany({
    take: 5,
    select: { titulo: true, og_image_url: true }
  })
  console.log(JSON.stringify(articles, null, 2))
}

main()
  .catch(e => console.error(e))
  .finally(async () => await prisma.$disconnect())
