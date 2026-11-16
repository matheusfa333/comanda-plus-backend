import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { UserRepository } from 'src/domain/repositories/user.repository.interface';
import { AuditLogRepository } from 'src/domain/repositories/audit-log.repository.interface';
import { AuditLog } from 'src/domain/entities/audit-log/audit-log.entity';
import { TwoFactorService } from 'src/infra/services/two-factor/two-factor.service';
import { AuthSession, AuthSessionService } from 'src/infra/services/auth-session/auth-session.service';

export interface EnableTwoFactorResult {
  recoveryCodes: string[]; // mostrados uma única vez
  session?: AuthSession; // quando a ativação foi feita durante o login (configuração obrigatória)
}

@Injectable()
export class EnableTwoFactorUsecase {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly twoFactorService: TwoFactorService,
    private readonly authSessionService: AuthSessionService,
    private readonly auditLogRepository: AuditLogRepository,
  ) {}

  async execute(userId: string, code: string, duringLogin: boolean): Promise<EnableTwoFactorResult> {
    const user = await this.userRepository.findById(userId);
    if (!user || !user.getActive()) throw new NotFoundException('Usuário não encontrado');
    if (user.getTwoFactorEnabled()) throw new BadRequestException('A verificação em 2 etapas já está ativa');

    const secret = user.getTwoFactorSecret();
    if (!secret) throw new BadRequestException('Gere o QR Code antes de confirmar');

    const locked = this.twoFactorService.minutesLocked(userId);
    if (locked > 0) throw new BadRequestException(`Muitas tentativas erradas. Tente de novo em ${locked} min.`);

    if (!this.twoFactorService.verifyCode(this.twoFactorService.decrypt(secret), code)) {
      this.twoFactorService.registerFailure(userId);
      throw new BadRequestException('Código inválido. Confira se o horário do celular está certo e digite o código atual do app.');
    }
    this.twoFactorService.clearFailures(userId);

    const { codes, hashes } = this.twoFactorService.generateRecoveryCodes();
    user.enableTwoFactor(hashes);
    await this.userRepository.update(user);

    await this.auditLogRepository.create(
      AuditLog.create('DOIS_FATORES_ATIVADO', user.getName(), `${user.getName()} (${user.getUsername()})`),
    );

    return {
      recoveryCodes: codes,
      session: duringLogin ? this.authSessionService.issue(user) : undefined,
    };
  }
}
