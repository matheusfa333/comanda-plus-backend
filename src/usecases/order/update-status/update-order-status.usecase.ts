import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { OrderRepository } from 'src/domain/repositories/order.repository.interface';
import { OrderStatus } from 'src/domain/entities/order/order.entity';

const VALID: OrderStatus[] = ['PENDING', 'PREPARING', 'READY', 'DELIVERED', 'CANCELLED', 'CLOSED'];

@Injectable()
export class UpdateOrderStatusUsecase {
  constructor(private readonly orderRepository: OrderRepository) {}

  async execute(orderId: string, status: string): Promise<{ success: boolean }> {
    if (!VALID.includes(status as OrderStatus)) {
      throw new BadRequestException('Status inválido');
    }
    const order = await this.orderRepository.findById(orderId);
    if (!order) {
      throw new NotFoundException('Pedido não encontrado');
    }
    order.updateStatus(status as OrderStatus);
    await this.orderRepository.update(order);
    return { success: true };
  }
}
