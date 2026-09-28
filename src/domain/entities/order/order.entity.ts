import { Utils } from 'src/shared/utils/utils';
import { OrderItem } from '../order-item/order-item.entity';

export type OrderStatus = 'PENDING' | 'PREPARING' | 'READY' | 'DELIVERED' | 'CANCELLED' | 'CLOSED';

export type OrderCreateDto = {
  tableId: string;
  userId: string;
  items: OrderItem[];
  notes?: string | null;
};

export type OrderWithDto = {
  id: string;
  tableId: string;
  userId: string;
  status: OrderStatus;
  totalAmount: number;
  notes: string | null;
  items: OrderItem[];
  createdAt: Date;
  updatedAt: Date;
};

export class Order {
  private constructor(
    private readonly id: string,
    private readonly tableId: string,
    private readonly userId: string,
    private status: OrderStatus,
    private totalAmount: number,
    private notes: string | null,
    private readonly items: OrderItem[],
    private readonly createdAt: Date,
    private updatedAt: Date,
  ) {}

  static create(dto: OrderCreateDto): Order {
    const total = dto.items.reduce((sum, i) => sum + i.getSubtotal(), 0);
    return new Order(
      Utils.generateUUID(),
      dto.tableId,
      dto.userId,
      'PENDING',
      total,
      dto.notes ?? null,
      dto.items,
      new Date(),
      new Date(),
    );
  }

  static with(dto: OrderWithDto): Order {
    return new Order(
      dto.id, dto.tableId, dto.userId, dto.status, dto.totalAmount,
      dto.notes, dto.items, dto.createdAt, dto.updatedAt,
    );
  }

  getId(): string { return this.id; }
  getTableId(): string { return this.tableId; }
  getUserId(): string { return this.userId; }
  getStatus(): OrderStatus { return this.status; }
  getTotalAmount(): number { return this.totalAmount; }
  getNotes(): string | null { return this.notes; }
  getItems(): OrderItem[] { return this.items; }
  getCreatedAt(): Date { return this.createdAt; }
  getUpdatedAt(): Date { return this.updatedAt; }

  updateStatus(status: OrderStatus): void {
    this.status = status;
    this.updatedAt = new Date();
  }
}
