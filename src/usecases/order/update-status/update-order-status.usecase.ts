import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { OrderRepository } from 'src/domain/repositories/order.repository.interface';
import { TableRepository } from 'src/domain/repositories/table.repository.interface';
import { AuditLogRepository } from 'src/domain/repositories/audit-log.repository.interface';
import { OrderStatus } from 'src/domain/entities/order/order.entity';
import { AuditLog } from 'src/domain/entities/audit-log/audit-log.entity';

const VALID: OrderStatus[] = ['PENDING', 'PREPARING', 'READY', 'DELIVERED', 'CANCELLED', 'CLOSED'];
const LABEL: Record<string, string> = {
  PENDING: 'Aguardando',
  PREPARING: 'Em preparo',
  READY: 'Pronto',
  DELIVERED: 'Entregue',
  CANCELLED: 'Cancelado',
  CLOSED: 'Fechado',
};

@Injectable()
export class UpdateOrderStatusUsecase {
  constructor(
    private readonly orderRepository: OrderRepository,
    private readonly tableRepository: TableRepository,
    private readonly auditLogRepository: AuditLogRepository,
  ) {}

  async execute(orderId: string, status: string, actor: string): Promise<{ success: boolean }> {
    if (!VALID.includes(status as OrderStatus)) throw new BadRequestException('Status inválido');
    const order = await this.orderRepository.findById(orderId);
    if (!order) throw new NotFoundException('Pedido não encontrado');

    const before = order.getStatus();
    order.updateStatus(status as OrderStatus);
    await this.orderRepository.update(order);

    const table = await this.tableRepository.findById(order.getTableId());
    await this.auditLogRepository.create(
      AuditLog.create(
        'STATUS_ALTERADO',
        actor,
        `Mesa ${table?.getIdentifier() ?? '?'}: ${LABEL[before] ?? before} → ${LABEL[status] ?? status}`,
      ),
    );
    return { success: true };
  }
}
