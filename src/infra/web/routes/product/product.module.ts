import { Module } from '@nestjs/common';
import { ProductController } from './product.controller';
import { PrismaModule } from 'src/infra/services/database/prisma/prisma.module';
import { PrismaProductRepository } from 'src/infra/repositories/prisma/product/prisma-product.repository';
import { PrismaAuditLogRepository } from 'src/infra/repositories/prisma/audit-log/prisma-audit-log.repository';
import { ListProductsUsecase } from 'src/usecases/product/list/list-products.usecase';
import { CreateProductUsecase } from 'src/usecases/product/create/create-product.usecase';
import { RemoveProductUsecase } from 'src/usecases/product/remove/remove-product.usecase';
import { AdjustStockUsecase } from 'src/usecases/product/adjust-stock/adjust-stock.usecase';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [PrismaModule, AuthModule],
  controllers: [ProductController],
  providers: [
    PrismaProductRepository,
    PrismaAuditLogRepository,
    {
      provide: ListProductsUsecase,
      useFactory: (repo: PrismaProductRepository) => new ListProductsUsecase(repo),
      inject: [PrismaProductRepository],
    },
    {
      provide: CreateProductUsecase,
      useFactory: (repo: PrismaProductRepository, logs: PrismaAuditLogRepository) => new CreateProductUsecase(repo, logs),
      inject: [PrismaProductRepository, PrismaAuditLogRepository],
    },
    {
      provide: RemoveProductUsecase,
      useFactory: (repo: PrismaProductRepository, logs: PrismaAuditLogRepository) => new RemoveProductUsecase(repo, logs),
      inject: [PrismaProductRepository, PrismaAuditLogRepository],
    },
    {
      provide: AdjustStockUsecase,
      useFactory: (repo: PrismaProductRepository, logs: PrismaAuditLogRepository) => new AdjustStockUsecase(repo, logs),
      inject: [PrismaProductRepository, PrismaAuditLogRepository],
    },
  ],
})
export class ProductModule {}
