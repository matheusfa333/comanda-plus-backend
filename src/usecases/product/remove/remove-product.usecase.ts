import { Injectable, NotFoundException } from '@nestjs/common';
import { ProductRepository } from 'src/domain/repositories/product.repository.interface';
import { AuditLogRepository } from 'src/domain/repositories/audit-log.repository.interface';
import { AuditLog } from 'src/domain/entities/audit-log/audit-log.entity';

@Injectable()
export class RemoveProductUsecase {
  constructor(
    private readonly productRepository: ProductRepository,
    private readonly auditLogRepository: AuditLogRepository,
  ) {}

  async execute(id: string, actor: string): Promise<{ success: boolean }> {
    const product = await this.productRepository.findById(id);
    if (!product || !product.getAvailable()) throw new NotFoundException('Item não encontrado');

    // Itens já vendidos saem do cardápio, mas continuam no banco para manter o histórico
    if (await this.productRepository.hasOrders(id)) {
      product.setAvailable(false);
      await this.productRepository.update(product);
    } else {
      await this.productRepository.delete(id);
    }

    await this.auditLogRepository.create(AuditLog.create('ITEM_REMOVIDO', actor, product.getName()));
    return { success: true };
  }
}
