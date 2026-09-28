import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seedando dados iniciais...');

  // Senha padrão inicial (todos trocam no primeiro login)
  const defaultPassword = await bcrypt.hash('123', 10);

  // Usuários (login por NOME, senha inicial "123")
  const users = [
    { name: 'Admin', email: 'admin@comanda.com', role: 'ADMIN' },
    { name: 'Gerente', email: 'gerente@comanda.com', role: 'GERENTE' },
    { name: 'Carlos', email: 'carlos@comanda.com', role: 'GARCOM' },
    { name: 'Cozinha', email: 'cozinha@comanda.com', role: 'COZINHA' },
  ];

  for (const user of users) {
    const existing = await prisma.user.findUnique({ where: { name: user.name } });
    if (!existing) {
      await prisma.user.create({
        data: {
          name: user.name,
          email: user.email,
          password: defaultPassword,
          role: user.role,
          needsPasswordChange: true,
        },
      });
      console.log(`✅ Criado: ${user.name} (${user.role})`);
    } else {
      console.log(`⏭️  Já existe: ${user.name}`);
    }
  }

  // Mesas
  const tables = [
    { number: 1, capacity: 2 },
    { number: 2, capacity: 2 },
    { number: 3, capacity: 4 },
    { number: 4, capacity: 4 },
    { number: 5, capacity: 6 },
    { number: 6, capacity: 6 },
    { number: 7, capacity: 8 },
    { number: 8, capacity: 8 },
  ];

  for (const table of tables) {
    const existing = await prisma.table.findUnique({ where: { number: table.number } });
    if (!existing) {
      await prisma.table.create({ data: { ...table, status: 'FREE' } as any });
      console.log(`✅ Criada mesa: ${table.number}`);
    } else {
      console.log(`⏭️  Mesa ${table.number} já existe`);
    }
  }

  // Cardápio do Quintal do Roger
  const products = [
    // Carnes (vendidas por grama, mínimo 300g)
    { name: 'Bananinha', category: 'CARNE', isMeat: true, pricePerGram: 5, minGrams: 300 },
    { name: 'Maçã de Peito', category: 'CARNE', isMeat: true, pricePerGram: 4, minGrams: 300 },
    { name: 'Picanha', category: 'CARNE', isMeat: true, pricePerGram: 6, minGrams: 300 },
    { name: 'Fraldinha', category: 'CARNE', isMeat: true, pricePerGram: 5, minGrams: 300 },
    { name: 'Cupim', category: 'CARNE', isMeat: true, pricePerGram: 4, minGrams: 300 },

    // Acompanhamentos (preço fixo)
    { name: 'Arroz Branco', category: 'ACOMPANHAMENTO', price: 800 },
    { name: 'Batata Frita', category: 'ACOMPANHAMENTO', price: 1200 },
    { name: 'Fritas com Bacon e Queijo', category: 'ACOMPANHAMENTO', price: 1800 },
    { name: 'Caldo de Feijão', category: 'CALDO', price: 600 },
    { name: 'Caldo de Frango', category: 'CALDO', price: 700 },

    // Bebidas (marcas reais)
    { name: 'Água Mineral 500ml', category: 'BEBIDA', price: 300 },
    { name: 'Água com Gás 500ml', category: 'BEBIDA', price: 400 },
    { name: 'Coca-Cola Lata 350ml', category: 'BEBIDA', price: 600 },
    { name: 'Guaraná Antarctica Lata 350ml', category: 'BEBIDA', price: 600 },
    { name: 'Coca-Cola 600ml', category: 'BEBIDA', price: 900 },
    { name: 'Brahma 600ml', category: 'BEBIDA', price: 1200 },
    { name: 'Heineken 600ml', category: 'BEBIDA', price: 1500 },
    { name: 'Suco Natural 500ml', category: 'BEBIDA', price: 900 },
  ];

  for (const product of products) {
    const existing = await prisma.product.findFirst({ where: { name: product.name } });
    if (!existing) {
      await prisma.product.create({ data: { ...product, available: true } as any });
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
