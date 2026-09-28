import { Module } from '@nestjs/common';
import { TableController } from './table.controller';
import { PrismaModule } from 'src/infra/services/database/prisma/prisma.module';
import { PrismaTableRepository } from 'src/infra/repositories/prisma/table/prisma-table.repository';
import { PrismaOrderRepository } from 'src/infra/repositories/prisma/order/prisma-order.repository';
import { ListTablesUsecase } from 'src/usecases/table/list/list-tables.usecase';
import { OpenTableUsecase } from 'src/usecases/table/open/open-table.usecase';
import { CloseTableUsecase } from 'src/usecases/table/close/close-table.usecase';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [PrismaModule, AuthModule],
  controllers: [TableController],
  providers: [
    PrismaTableRepository,
    PrismaOrderRepository,
    {
      provide: ListTablesUsecase,
      useFactory: (repo: PrismaTableRepository) => new ListTablesUsecase(repo),
      inject: [PrismaTableRepository],
    },
    {
      provide: OpenTableUsecase,
      useFactory: (repo: PrismaTableRepository) => new OpenTableUsecase(repo),
      inject: [PrismaTableRepository],
    },
    {
      provide: CloseTableUsecase,
      useFactory: (tableRepo: PrismaTableRepository, orderRepo: PrismaOrderRepository) =>
        new CloseTableUsecase(tableRepo, orderRepo),
      inject: [PrismaTableRepository, PrismaOrderRepository],
    },
  ],
})
export class TableModule {}
