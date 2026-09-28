import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/infra/services/database/prisma/prisma.service';
import { ProductRepository } from 'src/domain/repositories/product.repository.interface';
import { Product } from 'src/domain/entities/product/product.entity';

@Injectable()
export class PrismaProductRepository implements ProductRepository {
  constructor(private readonly prisma: PrismaService) {}

  private toEntity(raw: any): Product {
    return Product.with({
      id: raw.id,
      name: raw.name,
      description: raw.description,
      price: raw.price,
      pricePerGram: raw.pricePerGram,
      minGrams: raw.minGrams,
      category: raw.category,
      isMeat: raw.isMeat,
      available: raw.available,
      createdAt: raw.createdAt,
      updatedAt: raw.updatedAt,
    });
  }

  async findAll(): Promise<Product[]> {
    const rows = await this.prisma.product.findMany({
      orderBy: [{ category: 'asc' }, { name: 'asc' }],
    });
    return rows.map((r: any) => this.toEntity(r));
  }

  async findById(id: string): Promise<Product | null> {
    const raw = await this.prisma.product.findUnique({ where: { id } });
    return raw ? this.toEntity(raw) : null;
  }
}
