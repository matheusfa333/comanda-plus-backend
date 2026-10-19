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
      pricePerKg: raw.pricePerKg,
      minGrams: raw.minGrams,
      category: raw.category,
      isMeat: raw.isMeat,
      available: raw.available,
      stock: raw.quantidadeDisponivel,
      minStock: raw.quantidadeMinima,
      createdAt: raw.createdAt,
      updatedAt: raw.updatedAt,
    });
  }

  async findAll(): Promise<Product[]> {
    // Inclui itens removidos do cardápio, para que pedidos antigos continuem com nome correto
    const rows = await this.prisma.product.findMany({
      orderBy: [{ category: 'asc' }, { name: 'asc' }],
    });
    return rows.map((r: any) => this.toEntity(r));
  }

  async findById(id: string): Promise<Product | null> {
    const raw = await this.prisma.product.findUnique({ where: { id } });
    return raw ? this.toEntity(raw) : null;
  }

  async findByName(name: string): Promise<Product | null> {
    const raw = await this.prisma.product.findFirst({ where: { name, available: true } });
    return raw ? this.toEntity(raw) : null;
  }

  async create(product: Product): Promise<void> {
    await this.prisma.product.create({
      data: {
        id: product.getId(),
        name: product.getName(),
        description: product.getDescription(),
        price: product.getPrice(),
        pricePerKg: product.getPricePerKg(),
        minGrams: product.getMinGrams(),
        category: product.getCategory(),
        isMeat: product.getIsMeat(),
        available: product.getAvailable(),
        quantidadeDisponivel: product.getStock(),
        quantidadeMinima: product.getMinStock(),
        createdAt: product.getCreatedAt(),
        updatedAt: product.getUpdatedAt(),
      },
    });
  }

  async update(product: Product): Promise<void> {
    await this.prisma.product.update({
      where: { id: product.getId() },
      data: {
        name: product.getName(),
        description: product.getDescription(),
        available: product.getAvailable(),
        quantidadeDisponivel: product.getStock(),
        updatedAt: product.getUpdatedAt(),
      },
    });
  }

  async hasOrders(id: string): Promise<boolean> {
    return (await this.prisma.orderItem.count({ where: { productId: id } })) > 0;
  }

  async delete(id: string): Promise<void> {
    await this.prisma.product.delete({ where: { id } });
  }
}
