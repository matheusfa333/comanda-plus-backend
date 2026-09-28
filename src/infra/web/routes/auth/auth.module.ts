import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { PrismaModule } from 'src/infra/services/database/prisma/prisma.module';
import { PrismaUserRepository } from 'src/infra/repositories/prisma/user/prisma-user.repository';
import { LoginUsecase } from 'src/usecases/auth/login/login.usecase';
import { ChangePasswordUsecase } from 'src/usecases/auth/change-password/change-password.usecase';
import { HashingService } from 'src/infra/services/hashing/hashing.service';
import { JwtService } from 'src/infra/services/jwt/jwt.service';

@Module({
  imports: [PrismaModule],
  controllers: [AuthController],
  providers: [
    HashingService,
    JwtService,
    PrismaUserRepository,
    {
      provide: LoginUsecase,
      useFactory: (repo: PrismaUserRepository, hashing: HashingService, jwt: JwtService) =>
        new LoginUsecase(repo, hashing, jwt),
      inject: [PrismaUserRepository, HashingService, JwtService],
    },
    {
      provide: ChangePasswordUsecase,
      useFactory: (repo: PrismaUserRepository, hashing: HashingService) =>
        new ChangePasswordUsecase(repo, hashing),
      inject: [PrismaUserRepository, HashingService],
    },
  ],
  exports: [JwtService, HashingService],
})
export class AuthModule {}
