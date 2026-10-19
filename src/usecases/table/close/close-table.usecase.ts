import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { TableRepository } from 'src/domain/repositories/table.repository.interface';
import { OrderRepository } from 'src/domain/repositories/order.repository.interface';
import { AuditLogRepository } from 'src/domain/repositories/audit-log.repository.interface';
import { AuditLog } from 'src/domain/entities/audit-log/audit-log.entity';

const SERVICE_FEE_RATE = 0.1;

@Injectable()
export class CloseTableUsecase {
  constructor(
    private readonly tableRepository: TableRepository,
    private readonly orderRepository: OrderRepository,
    private readonly auditLogRepository: AuditLogRepository,
  ) {}

  async execute(tableId: string, actor: string, actorRole: string): Promise<{ success: boolean; total: number }> {
    const table = await this.tableRepository.findById(tableId);
    if (!table) throw new NotFoundException('Mesa não encontrada');
    if (table.getStatus() !== 'OCCUPIED') throw new BadRequestException('Esta mesa não está aberta');

    const orders = await this.orderRepository.findByTableId(tableId);

    // Regra de negócio: não fechar com pedidos ainda na cozinha (exceto administrador)
    const inKitchen = orders.filter((o) => o.getStatus() === 'PENDING' || o.getStatus() === 'PREPARING');
    if (inKitchen.length > 0 && actorRole !== 'ADMIN') {
      throw new BadRequestException('Há pedidos ainda em preparo nesta mesa. Aguarde a cozinha finalizar para fechar a conta.');
    }

    const subtotal = orders.reduce((s, o) => s + o.getTotalAmount(), 0);
    const total = subtotal + Math.round(subtotal * SERVICE_FEE_RATE);

    await this.orderRepository.closeByTableId(tableId);
    table.free();
    await this.tableRepository.update(table);

    await this.auditLogRepository.create(
      AuditLog.create('CONTA_FECHADA', actor, `Mesa ${table.getIdentifier()} — Total R$ ${(total / 100).toFixed(2).replace('.', ',')}`),
    );
    return { success: true, total };
  }
}
