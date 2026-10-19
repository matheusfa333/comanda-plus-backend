// Sincroniza o cardápio com prisma/menu.ts SEM apagar o histórico de pedidos:
// - item do menu que já existe (mesmo nome): atualiza preço, descrição, categoria, estoque e reativa
// - item novo: cria
// - item que não está mais no menu: sai do cardápio (available = false), mas continua no banco
// Uso: npx ts-node prisma/sync-menu.ts
import { PrismaClient } from '@prisma/client';
import { buildMenu } from './menu';

const prisma = new PrismaClient();

async function main() {
  const menu = buildMenu();
  const names = menu.map((m) => m.name);

  for (const item of menu) {
    const existing = await prisma.product.findFirst({ where: { name: item.name } });
    if (existing) {
      await prisma.product.update({ where: { id: existing.id }, data: { ...item, available: true } });
      console.log(`🔄 Atualizado: ${item.name}`);
    } else {
      await prisma.product.create({ data: { ...item, available: true } });
      console.log(`✅ Criado: ${item.name}`);
    }
  }

  const removed = await prisma.product.updateMany({
    where: { name: { notIn: names }, available: true },
    data: { available: false },
  });
  console.log(`🗂️  Itens antigos retirados do cardápio: ${removed.count}`);
}

main()
  .catch((e) => {
    console.error('❌ Erro ao sincronizar cardápio:', e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
