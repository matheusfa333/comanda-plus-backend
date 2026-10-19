import { Utils } from 'src/shared/utils/utils';

export type ProductCategory = 'CARNE' | 'ACOMPANHAMENTO' | 'CALDO' | 'BEBIDA';

export const PRODUCT_CATEGORIES: ProductCategory[] = ['CARNE', 'ACOMPANHAMENTO', 'CALDO', 'BEBIDA'];

// Carnes: estoque e pedido em GRAMAS, preço em centavos por kg.
// Demais itens: estoque e pedido em UNIDADES, preço em centavos por unidade.
export type ProductCreateDto = {
  name: string;
  description?: string | null;
  price?: number;
  pricePerKg?: number | null;
  minGrams?: number | null;
  category: ProductCategory;
  stock?: number;
  minStock?: number;
};

export type ProductWithDto = {
  id: string;
  name: string;
  description: string | null;
  price: number;
  pricePerKg: number | null;
  minGrams: number | null;
  category: ProductCategory;
  isMeat: boolean;
  available: boolean;
  stock: number;
  minStock: number;
  createdAt: Date;
  updatedAt: Date;
};

export class Product {
  private constructor(
    private readonly id: string,
    private name: string,
    private description: string | null,
    private price: number,
    private pricePerKg: number | null,
    private minGrams: number | null,
    private category: ProductCategory,
    private isMeat: boolean,
    private available: boolean,
    private stock: number,
    private minStock: number,
    private readonly createdAt: Date,
    private updatedAt: Date,
  ) {}

  static create(dto: ProductCreateDto): Product {
    const isMeat = dto.category === 'CARNE';
    return new Product(
      Utils.generateUUID(),
      dto.name,
      dto.description ?? null,
      isMeat ? 0 : dto.price ?? 0,
      isMeat ? dto.pricePerKg ?? 0 : null,
      isMeat ? dto.minGrams ?? 300 : null,
      dto.category,
      isMeat,
      true,
      dto.stock ?? 0,
      dto.minStock ?? (isMeat ? 10000 : 10),
      new Date(),
      new Date(),
    );
  }

  static with(dto: ProductWithDto): Product {
    return new Product(
      dto.id, dto.name, dto.description, dto.price, dto.pricePerKg, dto.minGrams,
      dto.category, dto.isMeat, dto.available, dto.stock, dto.minStock, dto.createdAt, dto.updatedAt,
    );
  }

  getId(): string { return this.id; }
  getName(): string { return this.name; }
  getDescription(): string | null { return this.description; }
  getPrice(): number { return this.price; }
  getPricePerKg(): number | null { return this.pricePerKg; }
  getMinGrams(): number | null { return this.minGrams; }
  getCategory(): ProductCategory { return this.category; }
  getIsMeat(): boolean { return this.isMeat; }
  getAvailable(): boolean { return this.available; }
  getStock(): number { return this.stock; }
  getMinStock(): number { return this.minStock; }
  getCreatedAt(): Date { return this.createdAt; }
  getUpdatedAt(): Date { return this.updatedAt; }

  isLowStock(): boolean {
    return this.stock < this.minStock;
  }

  // Snapshot de preço usado no pedido: centavos por kg (carne) ou por unidade
  getUnitPrice(): number {
    return this.isMeat ? this.pricePerKg ?? 0 : this.price;
  }

  setAvailable(available: boolean): void {
    this.available = available;
    this.updatedAt = new Date();
  }

  setStock(stock: number): void {
    this.stock = Math.max(0, Math.round(stock));
    this.updatedAt = new Date();
  }
}
