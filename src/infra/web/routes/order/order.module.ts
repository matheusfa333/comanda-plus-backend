import { Module } from '@nestjs/common';
import { OrderController } from './order.controller';
import { PrismaModule } from 'src/infra/services/database/prisma/prisma.module';
import { PrismaOrderRepository } from 'src/infra/repositories/prisma/order/prisma-order.repository';
import { PrismaProductRepository } from 'src/infra/repositories/prisma/product/prisma-product.repository';
import { PrismaTableRepository } from 'src/infra/repositories/prisma/table/prisma-table.repository';
import { CreateOrderUsecase } from 'src/usecases/order/create/create-order.usecase';
import { ListOrdersByTableUsecase } from 'src/usecases/order/list-by-table/list-orders-by-table.usecase';
import { ListKitchenOrdersUsecase } from 'src/usecases/order/list-kitchen/list-kitchen-orders.usecase';
import { UpdateOrderStatusUsecase } from 'src/usecases/order/update-status/update-order-status.usecase';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [PrismaModule, AuthModule],
  controllers: [OrderController],
  providers: [
    PrismaOrderRepository,
    PrismaProductRepository,
    PrismaTableRepository,
    {
      provide: CreateOrderUsecase,
      useFactory: (o: PrismaOrderRepository, p: PrismaProductRepository, t: PrismaTableRepository) =>
        new CreateOrderUsecase(o, p, t),
      inject: [PrismaOrderRepository, PrismaProductRepository, PrismaTableRepository],
    },
    {
      provide: ListOrdersByTableUsecase,
      useFactory: (o: PrismaOrderRepository, p: PrismaProductRepository) =>
        new ListOrdersByTableUsecase(o, p),
      inject: [PrismaOrderRepository, PrismaProductRepository],
    },
    {
      provide: ListKitchenOrdersUsecase,
      useFactory: (o: PrismaOrderRepository, p: PrismaProductRepository, t: PrismaTableRepository) =>
        new ListKitchenOrdersUsecase(o, p, t),
      inject: [PrismaOrderRepository, PrismaProductRepository, PrismaTableRepository],
    },
    {
      provide: UpdateOrderStatusUsecase,
      useFactory: (o: PrismaOrderRepository) => new UpdateOrderStatusUsecase(o),
      inject: [PrismaOrderRepository],
    },
  ],
})
export class OrderModule {}
