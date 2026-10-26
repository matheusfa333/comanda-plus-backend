import { Module } from '@nestjs/common';
import { TableController } from './table.controller';
import { PrismaModule } from 'src/infra/services/database/prisma/prisma.module';
import { PrismaTableRepository } from 'src/infra/repositories/prisma/table/prisma-table.repository';
import { PrismaOrderRepository } from 'src/infra/repositories/prisma/order/prisma-order.repository';
import { PrismaAuditLogRepository } from 'src/infra/repositories/prisma/audit-log/prisma-audit-log.repository';
import { PrismaClosedAccountRepository } from 'src/infra/repositories/prisma/closed-account/prisma-closed-account.repository';
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
    PrismaAuditLogRepository,
    PrismaClosedAccountRepository,
    {
      provide: ListTablesUsecase,
      useFactory: (t: PrismaTableRepository, o: PrismaOrderRepository) => new ListTablesUsecase(t, o),
      inject: [PrismaTableRepository, PrismaOrderRepository],
    },
    {
      provide: OpenTableUsecase,
      useFactory: (t: PrismaTableRepository, logs: PrismaAuditLogRepository) => new OpenTableUsecase(t, logs),
      inject: [PrismaTableRepository, PrismaAuditLogRepository],
    },
    {
      provide: CloseTableUsecase,
      useFactory: (t: PrismaTableRepository, o: PrismaOrderRepository, c: PrismaClosedAccountRepository, logs: PrismaAuditLogRepository) =>
        new CloseTableUsecase(t, o, c, logs),
      inject: [PrismaTableRepository, PrismaOrderRepository, PrismaClosedAccountRepository, PrismaAuditLogRepository],
    },
  ],
})
export class TableModule {}
