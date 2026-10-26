import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { ProductRepository } from 'src/domain/repositories/product.repository.interface';
import { AuditLogRepository } from 'src/domain/repositories/audit-log.repository.interface';
import { AuditLog } from 'src/domain/entities/audit-log/audit-log.entity';

@Injectable()
export class AdjustStockUsecase {
  constructor(
    private readonly productRepository: ProductRepository,
    private readonly auditLogRepository: AuditLogRepository,
  ) {}

  // stock: novo valor absoluto (gramas para carne, unidades para os demais)
  async execute(id: string, stock: number, actor: string, reason?: string): Promise<{ stock: number }> {
    if (typeof stock !== 'number' || !Number.isFinite(stock) || stock < 0) {
      throw new BadRequestException('Quantidade de estoque inválida');
    }
    const product = await this.productRepository.findById(id);
    if (!product || !product.getAvailable()) throw new NotFoundException('Item não encontrado');

    const note = (reason ?? '').trim().slice(0, 120);
    const before = product.getStock();
    product.setStock(stock);
    await this.productRepository.update(product);

    const fmt = (v: number) => (product.getIsMeat() ? `${(v / 1000).toLocaleString('pt-BR')} kg` : `${v} un`);
    await this.auditLogRepository.create(
      AuditLog.create('ESTOQUE_AJUSTADO', actor, `${product.getName()}: ${fmt(before)} → ${fmt(product.getStock())}${note ? ` — ${note}` : ''}`),
    );
    return { stock: product.getStock() };
  }
}
