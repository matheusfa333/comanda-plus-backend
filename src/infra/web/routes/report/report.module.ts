import { Module } from '@nestjs/common';
import { ReportController } from './report.controller';
import { PrismaModule } from 'src/infra/services/database/prisma/prisma.module';
import { PrismaOrderRepository } from 'src/infra/repositories/prisma/order/prisma-order.repository';
import { PrismaProductRepository } from 'src/infra/repositories/prisma/product/prisma-product.repository';
import { PrismaUserRepository } from 'src/infra/repositories/prisma/user/prisma-user.repository';
import { PrismaAuditLogRepository } from 'src/infra/repositories/prisma/audit-log/prisma-audit-log.repository';
import { GetReportsUsecase } from 'src/usecases/report/get-reports/get-reports.usecase';
import { ListLogsUsecase } from 'src/usecases/report/list-logs/list-logs.usecase';
import { ListClosedAccountsUsecase } from 'src/usecases/report/list-closed-accounts/list-closed-accounts.usecase';
import { PrismaClosedAccountRepository } from 'src/infra/repositories/prisma/closed-account/prisma-closed-account.repository';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [PrismaModule, AuthModule],
  controllers: [ReportController],
  providers: [
    PrismaOrderRepository,
    PrismaProductRepository,
    PrismaUserRepository,
    PrismaAuditLogRepository,
    PrismaClosedAccountRepository,
    {
      provide: GetReportsUsecase,
      useFactory: (o: PrismaOrderRepository, p: PrismaProductRepository, u: PrismaUserRepository, c: PrismaClosedAccountRepository) =>
        new GetReportsUsecase(o, p, u, c),
      inject: [PrismaOrderRepository, PrismaProductRepository, PrismaUserRepository, PrismaClosedAccountRepository],
    },
    {
      provide: ListClosedAccountsUsecase,
      useFactory: (c: PrismaClosedAccountRepository, o: PrismaOrderRepository, p: PrismaProductRepository, u: PrismaUserRepository) =>
        new ListClosedAccountsUsecase(c, o, p, u),
      inject: [PrismaClosedAccountRepository, PrismaOrderRepository, PrismaProductRepository, PrismaUserRepository],
    },
    {
      provide: ListLogsUsecase,
      useFactory: (l: PrismaAuditLogRepository) => new ListLogsUsecase(l),
      inject: [PrismaAuditLogRepository],
    },
  ],
})
export class ReportModule {}
