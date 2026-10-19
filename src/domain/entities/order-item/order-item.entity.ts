import { Utils } from 'src/shared/utils/utils';

export type OrderItemCreateDto = {
  productId: string;
  quantity: number; // gramas (carne) ou unidades
  unitPrice: number; // snapshot: centavos por kg (carne) ou por unidade
  weighed: boolean;
  notes?: string | null;
};

export type OrderItemWithDto = {
  id: string;
  productId: string;
  quantity: number;
  unitPrice: number;
  weighed: boolean;
  notes: string | null;
};

export class OrderItem {
  private constructor(
    private readonly id: string,
    private readonly productId: string,
    private readonly quantity: number,
    private readonly unitPrice: number,
    private readonly weighed: boolean,
    private readonly notes: string | null,
  ) {}

  static create(dto: OrderItemCreateDto): OrderItem {
    return new OrderItem(Utils.generateUUID(), dto.productId, dto.quantity, dto.unitPrice, dto.weighed, dto.notes ?? null);
  }

  static with(dto: OrderItemWithDto): OrderItem {
    return new OrderItem(dto.id, dto.productId, dto.quantity, dto.unitPrice, dto.weighed, dto.notes);
  }

  getId(): string { return this.id; }
  getProductId(): string { return this.productId; }
  getQuantity(): number { return this.quantity; }
  getUnitPrice(): number { return this.unitPrice; }
  getWeighed(): boolean { return this.weighed; }
  getNotes(): string | null { return this.notes; }

  getSubtotal(): number {
    return this.weighed ? Math.round((this.quantity * this.unitPrice) / 1000) : this.quantity * this.unitPrice;
  }
}
