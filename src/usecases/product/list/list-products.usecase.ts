import { Injectable } from '@nestjs/common';
import { ProductRepository } from 'src/domain/repositories/product.repository.interface';

export interface ProductListItem {
  id: string;
  name: string;
  description: string | null;
  price: number;
  pricePerKg: number | null;
  minGrams: number | null;
  category: string;
  isMeat: boolean;
  available: boolean;
  stock: number; // gramas (carne) ou unidades
  minStock: number;
  lowStock: boolean;
}

@Injectable()
export class ListProductsUsecase {
  constructor(private readonly productRepository: ProductRepository) {}

  async execute(): Promise<ProductListItem[]> {
    const products = await this.productRepository.findAll();
    return products
      .filter((p) => p.getAvailable())
      .map((p) => ({
        id: p.getId(),
        name: p.getName(),
        description: p.getDescription(),
        price: p.getPrice(),
        pricePerKg: p.getPricePerKg(),
        minGrams: p.getMinGrams(),
        category: p.getCategory(),
        isMeat: p.getIsMeat(),
        available: p.getAvailable(),
        stock: p.getStock(),
        minStock: p.getMinStock(),
        lowStock: p.isLowStock(),
      }));
  }
}
