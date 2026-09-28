import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { OrderRepository } from 'src/domain/repositories/order.repository.interface';
import { ProductRepository } from 'src/domain/repositories/product.repository.interface';
import { TableRepository } from 'src/domain/repositories/table.repository.interface';
import { Order } from 'src/domain/entities/order/order.entity';
import { OrderItem } from 'src/domain/entities/order-item/order-item.entity';

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
  ) {}

  async execute(input: CreateOrderInput): Promise<{ id: string; total: number }> {
    // 1. Validar mesa (RN10: mesa deve estar ocupada)
    const table = await this.tableRepository.findById(input.tableId);
    if (!table) {
      throw new NotFoundException('Mesa não encontrada');
    }
    if (table.getStatus() !== 'OCCUPIED') {
      throw new BadRequestException('A mesa precisa estar aberta para lançar pedidos');
    }

    // 2. Validar itens
    if (!input.items || input.items.length === 0) {
      throw new BadRequestException('O pedido precisa ter ao menos um item');
    }

    const orderItems: OrderItem[] = [];
    for (const item of input.items) {
      const product = await this.productRepository.findById(item.productId);
      if (!product) {
        throw new NotFoundException(`Produto não encontrado: ${item.productId}`);
      }
      if (!product.getAvailable()) {
        throw new BadRequestException(`Produto indisponível: ${product.getName()}`);
      }

      let unitPrice: number;
      if (product.getIsMeat()) {
        // Carne vendida por grama (RN07: mínimo de gramas)
        const min = product.getMinGrams() ?? 0;
        if (item.quantity < min) {
          throw new BadRequestException(
            `${product.getName()}: pedido mínimo de ${min}g`,
          );
        }
        unitPrice = product.getPricePerGram() ?? 0;
      } else {
        if (item.quantity <= 0) {
          throw new BadRequestException(`Quantidade inválida para ${product.getName()}`);
        }
        unitPrice = product.getPrice();
      }

      // RN08: snapshot do preço no momento do pedido
      orderItems.push(
        OrderItem.create({
          productId: product.getId(),
          quantity: item.quantity,
          unitPrice,
          notes: item.notes ?? null,
        }),
      );
    }

    // 3. Criar pedido
    const order = Order.create({
      tableId: input.tableId,
      userId: input.userId,
      items: orderItems,
    });
    await this.orderRepository.create(order);

    return { id: order.getId(), total: order.getTotalAmount() };
  }
}
