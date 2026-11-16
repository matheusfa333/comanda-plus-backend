import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { UserRepository } from 'src/domain/repositories/user.repository.interface';
import { AuditLogRepository } from 'src/domain/repositories/audit-log.repository.interface';
import { AuditLog } from 'src/domain/entities/audit-log/audit-log.entity';

@Injectable()
export class ResetTwoFactorUserUsecase {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly auditLogRepository: AuditLogRepository,
  ) {}

  // Admin remove a verificação de quem perdeu o celular.
  // Admin/Gerente terão que configurar de novo no próximo login.
  async execute(userId: string, actor: string): Promise<{ success: boolean }> {
    const user = await this.userRepository.findById(userId);
    if (!user) throw new NotFoundException('Usuário não encontrado');
    if (!user.getTwoFactorEnabled()) throw new BadRequestException('Este usuário não usa a verificação em 2 etapas');

    user.disableTwoFactor();
    await this.userRepository.update(user);
    await this.auditLogRepository.create(
      AuditLog.create('DOIS_FATORES_RESETADO', actor, `${user.getName()} (${user.getUsername()})`),
    );
    return { success: true };
  }
}
