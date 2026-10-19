import { Module } from '@nestjs/common';
import { UserController } from './user.controller';
import { PrismaModule } from 'src/infra/services/database/prisma/prisma.module';
import { PrismaUserRepository } from 'src/infra/repositories/prisma/user/prisma-user.repository';
import { PrismaOrderRepository } from 'src/infra/repositories/prisma/order/prisma-order.repository';
import { PrismaAuditLogRepository } from 'src/infra/repositories/prisma/audit-log/prisma-audit-log.repository';
import { CreateUserUsecase } from 'src/usecases/user/create/create-user.usecase';
import { ListUsersUsecase } from 'src/usecases/user/list/list-users.usecase';
import { DeleteUserUsecase } from 'src/usecases/user/delete/delete-user.usecase';
import { ResetPasswordUsecase } from 'src/usecases/user/reset-password/reset-password.usecase';
import { SetUserActiveUsecase } from 'src/usecases/user/set-active/set-user-active.usecase';
import { HashingService } from 'src/infra/services/hashing/hashing.service';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [PrismaModule, AuthModule],
  controllers: [UserController],
  providers: [
    PrismaUserRepository,
    PrismaOrderRepository,
    PrismaAuditLogRepository,
    HashingService,
    {
      provide: CreateUserUsecase,
      useFactory: (repo: PrismaUserRepository, hashing: HashingService, logs: PrismaAuditLogRepository) =>
        new CreateUserUsecase(repo, hashing, logs),
      inject: [PrismaUserRepository, HashingService, PrismaAuditLogRepository],
    },
    {
      provide: ListUsersUsecase,
      useFactory: (repo: PrismaUserRepository) => new ListUsersUsecase(repo),
      inject: [PrismaUserRepository],
    },
    {
      provide: DeleteUserUsecase,
      useFactory: (repo: PrismaUserRepository, orders: PrismaOrderRepository, logs: PrismaAuditLogRepository) =>
        new DeleteUserUsecase(repo, orders, logs),
      inject: [PrismaUserRepository, PrismaOrderRepository, PrismaAuditLogRepository],
    },
    {
      provide: ResetPasswordUsecase,
      useFactory: (repo: PrismaUserRepository, hashing: HashingService, logs: PrismaAuditLogRepository) =>
        new ResetPasswordUsecase(repo, hashing, logs),
      inject: [PrismaUserRepository, HashingService, PrismaAuditLogRepository],
    },
    {
      provide: SetUserActiveUsecase,
      useFactory: (repo: PrismaUserRepository, logs: PrismaAuditLogRepository) => new SetUserActiveUsecase(repo, logs),
      inject: [PrismaUserRepository, PrismaAuditLogRepository],
    },
  ],
})
export class UserModule {}
