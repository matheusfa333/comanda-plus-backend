import { Injectable } from '@nestjs/common';
import { OrderRepository } from 'src/domain/repositories/order.repository.interface';
import { ProductRepository } from 'src/domain/repositories/product.repository.interface';

export interface OrderItemView {
  id: string;
  productId: string;
  productName: string;
  isMeat: boolean;
  quantity: number;
  unitPrice: number;
  subtotal: number;
}

export interface OrderView {
  id: string;
  status: string;
  createdAt: Date;
  items: OrderItemView[];
  subtotal: number;
}

export interface TableAccountView {
  orders: OrderView[];
  subtotal: number;
  serviceFee: number; // 10%
  total: number;
}

const SERVICE_FEE_RATE = 0.1;

@Injectable()
export class ListOrdersByTableUsecase {
  constructor(
    private readonly orderRepository: OrderRepository,
    private readonly productRepository: ProductRepository,
  ) {}

  async execute(tableId: string): Promise<TableAccountView> {
    const orders = await this.orderRepository.findByTableId(tableId);
    const products = await this.productRepository.findAll();
    const nameById = new Map(products.map((p) => [p.getId(), { name: p.getName(), isMeat: p.getIsMeat() }]));

    const orderViews: OrderView[] = orders.map((o) => {
      const items: OrderItemView[] = o.getItems().map((it) => {
        const info = nameById.get(it.getProductId());
        return {
          id: it.getId(),
          productId: it.getProductId(),
          productName: info?.name ?? 'Produto',
          isMeat: info?.isMeat ?? false,
          quantity: it.getQuantity(),
          unitPrice: it.getUnitPrice(),
          subtotal: it.getSubtotal(),
        };
      });
      return {
        id: o.getId(),
        status: o.getStatus(),
        createdAt: o.getCreatedAt(),
        items,
        subtotal: o.getTotalAmount(),
      };
    });

    const subtotal = orderViews.reduce((sum, o) => sum + o.subtotal, 0);
    const serviceFee = Math.round(subtotal * SERVICE_FEE_RATE);
    const total = subtotal + serviceFee;

    return { orders: orderViews, subtotal, serviceFee, total };
  }
}
