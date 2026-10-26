import { Order } from '../entities/order/order.entity';

export interface OrderRepository {
  create(order: Order): Promise<void>;
  findById(id: string): Promise<Order | null>;
  findByTableId(tableId: string): Promise<Order[]>; // pedidos ativos da mesa (não CLOSED/CANCELLED)
  findAllActive(): Promise<Order[]>; // pedidos ativos de todas as mesas
  findActiveForKitchen(): Promise<Order[]>; // fila: PENDING, PREPARING, READY
  findClosedBetween(from: Date, to: Date): Promise<Order[]>; // vendas pagas no período (relatórios)
  findByClosedAccountIds(ids: string[]): Promise<Order[]>; // pedidos de contas fechadas (histórico)
  countByUserId(userId: string): Promise<number>;
  update(order: Order): Promise<void>;
  closeByTableId(tableId: string, closedAccountId: string): Promise<void>;
}
