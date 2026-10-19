import { Injectable, BadRequestException } from '@nestjs/common';
import { ProductRepository } from 'src/domain/repositories/product.repository.interface';
import { AuditLogRepository } from 'src/domain/repositories/audit-log.repository.interface';
import { Product, ProductCategory, PRODUCT_CATEGORIES } from 'src/domain/entities/product/product.entity';
import { AuditLog } from 'src/domain/entities/audit-log/audit-log.entity';

export interface CreateProductInput {
  name: string;
  description?: string;
  category: ProductCategory;
  price?: number; // centavos por unidade (não carne)
  pricePerKg?: number; // centavos por kg (carne) — convertido para centavos por grama
  minGrams?: number;
  stock?: number; // unidades, ou gramas para carne
}

@Injectable()
export class CreateProductUsecase {
  constructor(
    private readonly productRepository: ProductRepository,
    private readonly auditLogRepository: AuditLogRepository,
  ) {}

  async execute(input: CreateProductInput, actor: string): Promise<{ id: string }> {
    const name = (input.name || '').trim();
    if (!name) throw new BadRequestException('Nome do item é obrigatório');
    if (!PRODUCT_CATEGORIES.includes(input.category)) throw new BadRequestException('Categoria inválida');
    if (await this.productRepository.findByName(name)) {
      throw new BadRequestException('Já existe um item com esse nome no cardápio');
    }

    const isMeat = input.category === 'CARNE';
    if (isMeat) {
      if (!input.pricePerKg || input.pricePerKg <= 0) throw new BadRequestException('Informe o preço por kg');
    } else if (!input.price || input.price <= 0) {
      throw new BadRequestException('Informe o preço do item');
    }

    const product = Product.create({
      name,
      description: input.description?.trim() || null,
      category: input.category,
      price: input.price,
      pricePerKg: input.pricePerKg,
      minGrams: input.minGrams ?? 300,
      stock: input.stock ?? 0,
    });
    await this.productRepository.create(product);

    await this.auditLogRepository.create(AuditLog.create('ITEM_CRIADO', actor, `${name} (${input.category})`));
    return { id: product.getId() };
  }
}
