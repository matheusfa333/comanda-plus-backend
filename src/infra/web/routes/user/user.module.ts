import { Module } from '@nestjs/common';
import { UserController } from './user.controller';
import { PrismaModule } from 'src/infra/services/database/prisma/prisma.module';
import { PrismaUserRepository } from 'src/infra/repositories/prisma/user/prisma-user.repository';
import { CreateUserUsecase } from 'src/usecases/user/create/create-user.usecase';
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
  ],
})
export class UserModule {}
