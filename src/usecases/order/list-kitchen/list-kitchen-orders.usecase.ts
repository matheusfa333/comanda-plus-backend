import { Injectable } from '@nestjs/common';
import { OrderRepository } from 'src/domain/repositories/order.repository.interface';
import { ProductRepository } from 'src/domain/repositories/product.repository.interface';
import { TableRepository } from 'src/domain/repositories/table.repository.interface';

export interface KitchenOrderView {
  id: string;
  tableNumber: number;
  clientName: string | null;
  status: string;
  createdAt: Date;
  items: { productName: string; quantity: number; isMeat: boolean }[];
}

@Injectable()
export class ListKitchenOrdersUsecase {
  constructor(
    private readonly orderRepository: OrderRepository,
    private readonly productRepository: ProductRepository,
    private readonly tableRepository: TableRepository,
  ) {}

  async execute(): Promise<KitchenOrderView[]> {
    const orders = await this.orderRepository.findActiveForKitchen();
    const products = await this.productRepository.findAll();
    const tables = await this.tableRepository.findAll();
    const productById = new Map(products.map((p) => [p.getId(), { name: p.getName(), isMeat: p.getIsMeat() }]));
    const tableById = new Map(tables.map((t) => [t.getId(), t]));

    return orders.map((o) => {
      const table = tableById.get(o.getTableId());
      return {
        id: o.getId(),
        tableNumber: table?.getNumber() ?? 0,
        clientName: table?.getClientName() ?? null,
        status: o.getStatus(),
        createdAt: o.getCreatedAt(),
        items: o.getItems().map((it) => {
          const info = productById.get(it.getProductId());
          return {
            productName: info?.name ?? 'Produto',
            quantity: it.getQuantity(),
            isMeat: info?.isMeat ?? false,
          };
        }),
      };
    });
  }
}
