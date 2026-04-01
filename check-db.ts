import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  try {
    const result = await prisma.$queryRaw`
      SELECT 
        count(*) as active_connections,
        (SELECT setting::int FROM pg_settings WHERE name = 'max_connections') as max_allowed
      FROM pg_stat_activity 
      WHERE datname = 'postgres'
    `
    console.log('--- Database Status ---')
    console.log(result)
  } catch (e) {
    console.error('Error checking connections:', e)
  } finally {
    await prisma.$disconnect()
  }
}

main()
