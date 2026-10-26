import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';
import { buildMenu } from './menu';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seedando dados iniciais...');

  // Senha padrão inicial (todos trocam no primeiro login)
  const defaultPassword = await bcrypt.hash('123', 10);

  // Usuários (login pelo username, senha inicial "123")
  const users = [
    { username: 'admin', name: 'Admin', email: 'admin@comanda.com', role: 'ADMIN' },
    { username: 'gerente', name: 'Gerente', email: 'gerente@comanda.com', role: 'GERENTE' },
    { username: 'carlos', name: 'Carlos', email: 'carlos@comanda.com', role: 'GARCOM' },
    { username: 'cozinha', name: 'Cozinha', email: 'cozinha@comanda.com', role: 'COZINHA' },
  ];

  for (const user of users) {
    const existing = await prisma.user.findUnique({ where: { username: user.username } });
    if (!existing) {
      await prisma.user.create({ data: { ...user, password: defaultPassword, needsPasswordChange: true } });
      console.log(`✅ Criado: ${user.name} (${user.username}) — ${user.role}`);
    } else {
      console.log(`⏭️  Já existe: ${user.username}`);
    }
  }

  // Mesas (identificador pode ser número ou nome)
  for (let n = 1; n <= 8; n++) {
    const identifier = String(n);
    const existing = await prisma.table.findUnique({ where: { identifier } });
    if (!existing) {
      await prisma.table.create({ data: { identifier, capacity: n <= 2 ? 2 : n <= 6 ? 4 : 8, status: 'FREE' } });
      console.log(`✅ Criada mesa: ${identifier}`);
    }
  }

  // Cardápio do Quintal do Roger (definido em prisma/menu.ts)
  const products = buildMenu();

  for (const product of products) {
    const existing = await prisma.product.findFirst({ where: { name: product.name } });
    if (!existing) {
      await prisma.product.create({ data: { ...product, available: true } });
      console.log(`✅ Criado produto: ${product.name}`);
    } else {
      console.log(`⏭️  Produto ${product.name} já existe`);
    }
  }

  console.log('✅ Seed concluído!');
}

main()
  .catch((e) => {
    console.error('❌ Erro no seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
