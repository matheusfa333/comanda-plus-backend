import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { OrderRepository } from 'src/domain/repositories/order.repository.interface';
import { ProductRepository } from 'src/domain/repositories/product.repository.interface';
import { TableRepository } from 'src/domain/repositories/table.repository.interface';
import { AuditLogRepository } from 'src/domain/repositories/audit-log.repository.interface';
import { Order } from 'src/domain/entities/order/order.entity';
import { OrderItem } from 'src/domain/entities/order-item/order-item.entity';
import { Product } from 'src/domain/entities/product/product.entity';
import { AuditLog } from 'src/domain/entities/audit-log/audit-log.entity';

export interface CreateOrderInput {
  tableId: string;
  userId: string;
  items: { productId: string; quantity: number; notes?: string }[];
}

@Injectable()
export class CreateOrderUsecase {
  constructor(
    private readonly orderRepository: OrderRepository,
    private readonly productRepository: ProductRepository,
    private readonly tableRepository: TableRepository,
    private readonly auditLogRepository: AuditLogRepository,
  ) {}

  async execute(input: CreateOrderInput, actor: string): Promise<{ id: string; total: number }> {
    // 1. Mesa precisa estar aberta
    const table = await this.tableRepository.findById(input.tableId);
    if (!table) throw new NotFoundException('Mesa não encontrada');
    if (table.getStatus() !== 'OCCUPIED') {
      throw new BadRequestException('A mesa precisa estar aberta para lançar pedidos');
    }
    if (!input.items || input.items.length === 0) {
      throw new BadRequestException('O pedido precisa ter ao menos um item');
    }

    // 2. Validar itens e somar a quantidade pedida por produto (para checar estoque)
    const products = new Map<string, Product>();
    const requested = new Map<string, number>();
    for (const item of input.items) {
      const quantity = Math.round(Number(item.quantity));
      const product = products.get(item.productId) ?? (await this.productRepository.findById(item.productId));
      if (!product || !product.getAvailable()) {
        throw new NotFoundException('Item não encontrado no cardápio');
      }
      products.set(product.getId(), product);

      if (!Number.isFinite(quantity) || quantity <= 0) {
        throw new BadRequestException(`Quantidade inválida para ${product.getName()}`);
      }
      // Carne é vendida por grama, com pedido mínimo (padrão 300g)
      if (product.getIsMeat() && quantity < (product.getMinGrams() ?? 300)) {
        throw new BadRequestException(`${product.getName()}: o pedido mínimo é de ${product.getMinGrams() ?? 300}g`);
      }
      requested.set(product.getId(), (requested.get(product.getId()) ?? 0) + quantity);
    }

    // 3. Estoque suficiente (bloqueia o lançamento se faltar)
    for (const [productId, quantity] of requested) {
      const product = products.get(productId)!;
      if (product.getStock() < quantity) {
        const disponivel = product.getIsMeat()
          ? `${(product.getStock() / 1000).toLocaleString('pt-BR')} kg`
          : `${product.getStock()} un`;
        throw new BadRequestException(`Estoque insuficiente de ${product.getName()} (disponível: ${disponivel})`);
      }
    }

    // 4. Montar itens com snapshot do preço
    const orderItems = input.items.map((item) => {
      const product = products.get(item.productId)!;
      return OrderItem.create({
        productId: product.getId(),
        quantity: Math.round(Number(item.quantity)),
        unitPrice: product.getUnitPrice(),
        weighed: product.getIsMeat(),
        notes: item.notes ?? null,
      });
    });

    const order = Order.create({ tableId: input.tableId, userId: input.userId, items: orderItems });
    await this.orderRepository.create(order);

    // 5. Baixa automática no estoque
    for (const [productId, quantity] of requested) {
      const product = products.get(productId)!;
      product.setStock(product.getStock() - quantity);
      await this.productRepository.update(product);
    }

    const resumo = orderItems
      .map((i) => {
        const p = products.get(i.getProductId())!;
        return p.getIsMeat() ? `${p.getName()} ${i.getQuantity()}g` : `${p.getName()} x${i.getQuantity()}`;
      })
      .join(', ');
    await this.auditLogRepository.create(
      AuditLog.create('PEDIDO_LANCADO', actor, `Mesa ${table.getIdentifier()} — ${resumo}`),
    );

    return { id: order.getId(), total: order.getTotalAmount() };
  }
}
