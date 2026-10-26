import { Injectable } from '@nestjs/common';
import { TableRepository } from 'src/domain/repositories/table.repository.interface';
import { OrderRepository } from 'src/domain/repositories/order.repository.interface';

export interface TableListItem {
  id: string;
  identifier: string;
  capacity: number;
  status: string;
  clientName: string | null;
  openedAt: Date;
  subtotal: number; // soma dos pedidos ativos (centavos, sem taxa)
  pendingOrders: number; // pedidos ainda não entregues
}

@Injectable()
export class ListTablesUsecase {
  constructor(
    private readonly tableRepository: TableRepository,
    private readonly orderRepository: OrderRepository,
  ) {}

  async execute(): Promise<TableListItem[]> {
    const [tables, activeOrders] = await Promise.all([
      this.tableRepository.findAll(),
      this.orderRepository.findAllActive(),
    ]);

    return tables.map((t) => {
      const orders = activeOrders.filter((o) => o.getTableId() === t.getId());
      return {
        id: t.getId(),
        identifier: t.getIdentifier(),
        capacity: t.getCapacity(),
        status: t.getStatus(),
        clientName: t.getClientName(),
        openedAt: t.getOpenedAt() ?? t.getUpdatedAt(),
        subtotal: orders.reduce((s, o) => s + o.getTotalAmount(), 0),
        pendingOrders: orders.filter((o) => o.getStatus() !== 'DELIVERED').length,
      };
    });
  }
}
