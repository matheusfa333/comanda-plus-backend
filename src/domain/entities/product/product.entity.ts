import { Utils } from 'src/shared/utils/utils';

export type ProductCategory = 'CARNE' | 'ACOMPANHAMENTO' | 'CALDO' | 'BEBIDA';

export type ProductCreateDto = {
  name: string;
  description?: string | null;
  price?: number;
  pricePerGram?: number | null;
  minGrams?: number | null;
  category: ProductCategory;
  isMeat?: boolean;
  available?: boolean;
};

export type ProductWithDto = {
  id: string;
  name: string;
  description: string | null;
  price: number;
  pricePerGram: number | null;
  minGrams: number | null;
  category: ProductCategory;
  isMeat: boolean;
  available: boolean;
  createdAt: Date;
  updatedAt: Date;
};

export class Product {
  private constructor(
    private readonly id: string,
    private name: string,
    private description: string | null,
    private price: number,
    private pricePerGram: number | null,
    private minGrams: number | null,
    private category: ProductCategory,
    private isMeat: boolean,
    private available: boolean,
    private readonly createdAt: Date,
    private updatedAt: Date,
  ) {}

  static create(dto: ProductCreateDto): Product {
    return new Product(
      Utils.generateUUID(),
      dto.name,
      dto.description ?? null,
      dto.price ?? 0,
      dto.pricePerGram ?? null,
      dto.minGrams ?? null,
      dto.category,
      dto.isMeat ?? false,
      dto.available ?? true,
      new Date(),
      new Date(),
    );
  }

  static with(dto: ProductWithDto): Product {
    return new Product(
      dto.id, dto.name, dto.description, dto.price, dto.pricePerGram,
      dto.minGrams, dto.category, dto.isMeat, dto.available, dto.createdAt, dto.updatedAt,
    );
  }

  getId(): string { return this.id; }
  getName(): string { return this.name; }
  getDescription(): string | null { return this.description; }
  getPrice(): number { return this.price; }
  getPricePerGram(): number | null { return this.pricePerGram; }
  getMinGrams(): number | null { return this.minGrams; }
  getCategory(): ProductCategory { return this.category; }
  getIsMeat(): boolean { return this.isMeat; }
  getAvailable(): boolean { return this.available; }
  getCreatedAt(): Date { return this.createdAt; }
  getUpdatedAt(): Date { return this.updatedAt; }

  setAvailable(available: boolean): void {
    this.available = available;
    this.updatedAt = new Date();
  }
}
