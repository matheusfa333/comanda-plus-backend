import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { PrismaModule } from 'src/infra/services/database/prisma/prisma.module';
import { PrismaUserRepository } from 'src/infra/repositories/prisma/user/prisma-user.repository';
import { PrismaAuditLogRepository } from 'src/infra/repositories/prisma/audit-log/prisma-audit-log.repository';
import { LoginUsecase } from 'src/usecases/auth/login/login.usecase';
import { ChangePasswordUsecase } from 'src/usecases/auth/change-password/change-password.usecase';
import { SetupTwoFactorUsecase } from 'src/usecases/two-factor/setup/setup-two-factor.usecase';
import { EnableTwoFactorUsecase } from 'src/usecases/two-factor/enable/enable-two-factor.usecase';
import { VerifyTwoFactorUsecase } from 'src/usecases/two-factor/verify/verify-two-factor.usecase';
import { DisableTwoFactorUsecase } from 'src/usecases/two-factor/disable/disable-two-factor.usecase';
import { GetStatusTwoFactorUsecase } from 'src/usecases/two-factor/get-status/get-status-two-factor.usecase';
import { HashingService } from 'src/infra/services/hashing/hashing.service';
import { JwtService } from 'src/infra/services/jwt/jwt.service';
import { TwoFactorService } from 'src/infra/services/two-factor/two-factor.service';
import { AuthSessionService } from 'src/infra/services/auth-session/auth-session.service';

@Module({
  imports: [PrismaModule],
  controllers: [AuthController],
  providers: [
    HashingService,
    JwtService,
    TwoFactorService,
    AuthSessionService,
    PrismaUserRepository,
    PrismaAuditLogRepository,
    {
      provide: LoginUsecase,
      useFactory: (repo: PrismaUserRepository, hashing: HashingService, jwt: JwtService, session: AuthSessionService) =>
        new LoginUsecase(repo, hashing, jwt, session),
      inject: [PrismaUserRepository, HashingService, JwtService, AuthSessionService],
    },
    {
      provide: ChangePasswordUsecase,
      useFactory: (repo: PrismaUserRepository, hashing: HashingService) =>
        new ChangePasswordUsecase(repo, hashing),
      inject: [PrismaUserRepository, HashingService],
    },
    {
      provide: SetupTwoFactorUsecase,
      useFactory: (repo: PrismaUserRepository, twoFactor: TwoFactorService) => new SetupTwoFactorUsecase(repo, twoFactor),
      inject: [PrismaUserRepository, TwoFactorService],
    },
    {
      provide: EnableTwoFactorUsecase,
      useFactory: (repo: PrismaUserRepository, twoFactor: TwoFactorService, session: AuthSessionService, logs: PrismaAuditLogRepository) =>
        new EnableTwoFactorUsecase(repo, twoFactor, session, logs),
      inject: [PrismaUserRepository, TwoFactorService, AuthSessionService, PrismaAuditLogRepository],
    },
    {
      provide: VerifyTwoFactorUsecase,
      useFactory: (repo: PrismaUserRepository, twoFactor: TwoFactorService, jwt: JwtService, session: AuthSessionService) =>
        new VerifyTwoFactorUsecase(repo, twoFactor, jwt, session),
      inject: [PrismaUserRepository, TwoFactorService, JwtService, AuthSessionService],
    },
    {
      provide: DisableTwoFactorUsecase,
      useFactory: (repo: PrismaUserRepository, twoFactor: TwoFactorService, logs: PrismaAuditLogRepository) =>
        new DisableTwoFactorUsecase(repo, twoFactor, logs),
      inject: [PrismaUserRepository, TwoFactorService, PrismaAuditLogRepository],
    },
    {
      provide: GetStatusTwoFactorUsecase,
      useFactory: (repo: PrismaUserRepository) => new GetStatusTwoFactorUsecase(repo),
      inject: [PrismaUserRepository],
    },
  ],
  exports: [JwtService, HashingService],
})
export class AuthModule {}
