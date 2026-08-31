import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seedando dados iniciais...');

  // Hash das senhas
  const adminPassword = await bcrypt.hash('admin123', 10);
  const garcomPassword = await bcrypt.hash('garcom123', 10);
  const kitchenPassword = await bcrypt.hash('kitchen123', 10);

  // Usuários de teste
  const users = [
    {
      name: 'Admin',
      email: 'admin@comanda.com',
      password: adminPassword,
      role: 'ADMIN',
    },
    {
      name: 'Gerente Roger',
      email: 'roger@comanda.com',
      password: adminPassword,
      role: 'GERENTE',
    },
    {
      name: 'Carlos Garçom',
      email: 'carlos@comanda.com',
      password: garcomPassword,
      role: 'GARCOM',
    },
    {
      name: 'João Garçom',
      email: 'joao@comanda.com',
      password: garcomPassword,
      role: 'GARCOM',
    },
    {
      name: 'Cozinha',
      email: 'cozinha@comanda.com',
      password: kitchenPassword,
      role: 'KITCHEN',
    },
  ];

  for (const user of users) {
    const existing = await prisma.user.findUnique({ where: { email: user.email } });
    if (!existing) {
      await prisma.user.create({ data: user });
      console.log(`✅ Criado: ${user.name} (${user.email})`);
    } else {
      console.log(`⏭️  Já existe: ${user.name}`);
    }
  }

  // Mesas
  const tables = [
    { number: 1, capacity: 2, status: 'FREE' },
    { number: 2, capacity: 2, status: 'FREE' },
    { number: 3, capacity: 4, status: 'FREE' },
    { number: 4, capacity: 4, status: 'FREE' },
    { number: 5, capacity: 6, status: 'FREE' },
  ];

  for (const table of tables) {
    const existing = await prisma.table.findUnique({ where: { number: table.number } });
    if (!existing) {
      await prisma.table.create({ data: table as any });
      console.log(`✅ Criada mesa: ${table.number}`);
    } else {
      console.log(`⏭️  Mesa ${table.number} já existe`);
    }
  }

  // Produtos
  const products = [
    {
      name: 'Picanha 500g',
      description: 'Corte nobre na brasa',
      price: 8900, // R$ 89,00
      category: 'CARNE',
      isMeat: true,
      available: true,
      quantidadeTotal: 50,
      quantidadeDisponivel: 50,
      quantidadeMinima: 5,
    },
    {
      name: 'Fraldinha 500g',
      description: 'Macia e suculenta',
      price: 7200, // R$ 72,00
      category: 'CARNE',
      isMeat: true,
      available: true,
      quantidadeTotal: 40,
      quantidadeDisponivel: 40,
      quantidadeMinima: 5,
    },
    {
      name: 'Arroz',
      description: 'Arroz branco soltinho',
      price: 1400, // R$ 14,00
      category: 'ACOMPANHAMENTO',
      isMeat: false,
      available: true,
      quantidadeTotal: 100,
      quantidadeDisponivel: 100,
      quantidadeMinima: 10,
    },
    {
      name: 'Tropeiro',
      description: 'Feijão, farinha, bacon, linguiça',
      price: 2800, // R$ 28,00
      category: 'ACOMPANHAMENTO',
      isMeat: false,
      available: true,
      quantidadeTotal: 80,
      quantidadeDisponivel: 80,
      quantidadeMinima: 10,
    },
    {
      name: 'Caldo de Feijão',
      description: 'Feijão preto, bacon e linguiça',
      price: 2600, // R$ 26,00
      category: 'CALDO',
      isMeat: false,
      available: true,
      quantidadeTotal: 50,
      quantidadeDisponivel: 50,
      quantidadeMinima: 5,
    },
    {
      name: 'Cerveja 600ml',
      description: 'Brahma, Skol, Heineken ou Itaipava',
      price: 1400, // R$ 14,00
      category: 'BEBIDA',
      isMeat: false,
      available: true,
      quantidadeTotal: 200,
      quantidadeDisponivel: 200,
      quantidadeMinima: 20,
    },
  ];

  for (const product of products) {
    const existing = await prisma.product.findFirst({ where: { name: product.name } });
    if (!existing) {
      await prisma.product.create({ data: product as any });
      console.log(`✅ Criado produto: ${product.name}`);
    } else {
      console.log(`⏭️  Produto ${product.name} já existe`);
    }
  }

  console.log('✅ Seed concluído!');
}

main()
  .catch(e => {
    console.error('❌ Erro no seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
