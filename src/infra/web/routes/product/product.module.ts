import { Module } from '@nestjs/common';
import { ProductController } from './product.controller';
import { PrismaModule } from 'src/infra/services/database/prisma/prisma.module';
import { PrismaProductRepository } from 'src/infra/repositories/prisma/product/prisma-product.repository';
import { ListProductsUsecase } from 'src/usecases/product/list/list-products.usecase';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [PrismaModule, AuthModule],
  controllers: [ProductController],
  providers: [
    PrismaProductRepository,
    {
      provide: ListProductsUsecase,
      useFactory: (repo: PrismaProductRepository) => new ListProductsUsecase(repo),
      inject: [PrismaProductRepository],
    },
  ],
})
export class ProductModule {}
