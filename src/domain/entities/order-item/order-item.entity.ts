import { Utils } from 'src/shared/utils/utils';

export type OrderItemCreateDto = {
  productId: string;
  quantity: number; // gramas (carne) ou unidades
  unitPrice: number; // snapshot: centavos por grama (carne) ou preço unitário
  notes?: string | null;
};

export type OrderItemWithDto = {
  id: string;
  productId: string;
  quantity: number;
  unitPrice: number;
  notes: string | null;
};

export class OrderItem {
  private constructor(
    private readonly id: string,
    private readonly productId: string,
    private readonly quantity: number,
    private readonly unitPrice: number,
    private readonly notes: string | null,
  ) {}

  static create(dto: OrderItemCreateDto): OrderItem {
    return new OrderItem(
      Utils.generateUUID(),
      dto.productId,
      dto.quantity,
      dto.unitPrice,
      dto.notes ?? null,
    );
  }

  static with(dto: OrderItemWithDto): OrderItem {
    return new OrderItem(dto.id, dto.productId, dto.quantity, dto.unitPrice, dto.notes);
  }

  getId(): string { return this.id; }
  getProductId(): string { return this.productId; }
  getQuantity(): number { return this.quantity; }
  getUnitPrice(): number { return this.unitPrice; }
  getNotes(): string | null { return this.notes; }
  getSubtotal(): number { return this.quantity * this.unitPrice; }
}
