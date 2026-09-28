import { Module } from '@nestjs/common';
import { UserController } from './user.controller';
import { PrismaModule } from 'src/infra/services/database/prisma/prisma.module';
import { PrismaUserRepository } from 'src/infra/repositories/prisma/user/prisma-user.repository';
import { CreateUserUsecase } from 'src/usecases/user/create/create-user.usecase';
import { ListUsersUsecase } from 'src/usecases/user/list/list-users.usecase';
import { DeleteUserUsecase } from 'src/usecases/user/delete/delete-user.usecase';
import { ResetPasswordUsecase } from 'src/usecases/user/reset-password/reset-password.usecase';
import { HashingService } from 'src/infra/services/hashing/hashing.service';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [PrismaModule, AuthModule],
  controllers: [UserController],
  providers: [
    PrismaUserRepository,
    HashingService,
    {
      provide: CreateUserUsecase,
      useFactory: (repo: PrismaUserRepository, hashing: HashingService) =>
        new CreateUserUsecase(repo, hashing),
      inject: [PrismaUserRepository, HashingService],
    },
    {
      provide: ListUsersUsecase,
      useFactory: (repo: PrismaUserRepository) => new ListUsersUsecase(repo),
      inject: [PrismaUserRepository],
    },
    {
      provide: DeleteUserUsecase,
      useFactory: (repo: PrismaUserRepository) => new DeleteUserUsecase(repo),
      inject: [PrismaUserRepository],
    },
    {
      provide: ResetPasswordUsecase,
      useFactory: (repo: PrismaUserRepository, hashing: HashingService) =>
        new ResetPasswordUsecase(repo, hashing),
      inject: [PrismaUserRepository, HashingService],
    },
  ],
})
export class UserModule {}
