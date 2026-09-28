import { Injectable, NotFoundException } from '@nestjs/common';
import { TableRepository } from 'src/domain/repositories/table.repository.interface';
import { OrderRepository } from 'src/domain/repositories/order.repository.interface';

@Injectable()
export class CloseTableUsecase {
  constructor(
    private readonly tableRepository: TableRepository,
    private readonly orderRepository: OrderRepository,
  ) {}

  async execute(tableId: string): Promise<{ success: boolean }> {
    const table = await this.tableRepository.findById(tableId);
    if (!table) {
      throw new NotFoundException('Mesa não encontrada');
    }

    // Fecha todos os pedidos ativos da mesa e libera a mesa
    await this.orderRepository.closeByTableId(tableId);
    table.free();
    await this.tableRepository.update(table);

    return { success: true };
  }
}
