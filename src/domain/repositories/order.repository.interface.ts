import { Order } from '../entities/order/order.entity';

export interface OrderRepository {
  create(order: Order): Promise<void>;
  findById(id: string): Promise<Order | null>;
  findByTableId(tableId: string): Promise<Order[]>; // pedidos ativos da mesa (não CLOSED/CANCELLED)
  findActiveForKitchen(): Promise<Order[]>; // fila: PENDING, PREPARING, READY
  update(order: Order): Promise<void>;
  closeByTableId(tableId: string): Promise<void>;
}
