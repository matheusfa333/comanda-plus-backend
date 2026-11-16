import { Injectable, BadRequestException, ForbiddenException, NotFoundException } from '@nestjs/common';
import { UserRepository } from 'src/domain/repositories/user.repository.interface';
import { AuditLogRepository } from 'src/domain/repositories/audit-log.repository.interface';
import { AuditLog } from 'src/domain/entities/audit-log/audit-log.entity';
import { TwoFactorService } from 'src/infra/services/two-factor/two-factor.service';

@Injectable()
export class DisableTwoFactorUsecase {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly twoFactorService: TwoFactorService,
    private readonly auditLogRepository: AuditLogRepository,
  ) {}

  // O próprio usuário desliga a verificação (pede o código atual para confirmar)
  async execute(userId: string, code: string): Promise<{ success: boolean }> {
    const user = await this.userRepository.findById(userId);
    if (!user) throw new NotFoundException('Usuário não encontrado');
    if (user.isTwoFactorRequired()) {
      throw new ForbiddenException('A verificação em 2 etapas é obrigatória para Administrador e Gerente.');
    }
    if (!user.getTwoFactorEnabled()) throw new BadRequestException('A verificação em 2 etapas já está desativada');

    const locked = this.twoFactorService.minutesLocked(userId);
    if (locked > 0) throw new BadRequestException(`Muitas tentativas erradas. Tente de novo em ${locked} min.`);

    if (!this.twoFactorService.matchCode(user.getTwoFactorSecret(), user.getTwoFactorRecoveryCodes(), code)) {
      this.twoFactorService.registerFailure(userId);
      throw new BadRequestException('Código inválido');
    }
    this.twoFactorService.clearFailures(userId);

    user.disableTwoFactor();
    await this.userRepository.update(user);
    await this.auditLogRepository.create(
      AuditLog.create('DOIS_FATORES_DESATIVADO', user.getName(), `${user.getName()} (${user.getUsername()})`),
    );
    return { success: true };
  }
}
