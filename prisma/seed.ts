import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";

const prisma = new PrismaClient();

async function main() {
  // Criar roles básicas
  const roles = [
    { nome: "admin" },
    { nome: "editor" },
    { nome: "reporter" },
    { nome: "juridico" },
    { nome: "assinante" }
  ];

  for (const role of roles) {
    await prisma.role.upsert({
      where: { nome: role.nome },
      update: {},
      create: role,
    });
  }

  const adminRole = await prisma.role.findUnique({ where: { nome: "admin" } });

  if (adminRole) {
    const hashedPassword = await bcrypt.hash("rgestao2026", 10);
    
    await prisma.user.upsert({
      where: { email: "admin@revistagestao.com" },
      update: {
        senha_hash: hashedPassword,
        cargo_id: adminRole.id,
      },
      create: {
        nome: "Administrador Geral",
        email: "admin@revistagestao.com",
        senha_hash: hashedPassword,
        cargo_id: adminRole.id,
        status: "ativo"
      },
    });
    
    console.log("Seed concluído: Usuário admin criado/atualizado.");
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
