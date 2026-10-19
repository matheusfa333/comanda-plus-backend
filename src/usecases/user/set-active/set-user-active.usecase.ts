import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { UserRepository } from 'src/domain/repositories/user.repository.interface';
import { AuditLogRepository } from 'src/domain/repositories/audit-log.repository.interface';
import { AuditLog } from 'src/domain/entities/audit-log/audit-log.entity';

@Injectable()
export class SetUserActiveUsecase {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly auditLogRepository: AuditLogRepository,
  ) {}

  async execute(id: string, active: boolean, requesterId: string, actor: string): Promise<{ success: boolean }> {
    const user = await this.userRepository.findById(id);
    if (!user) throw new NotFoundException('Usuário não encontrado');
    if (id === requesterId && !active) {
      throw new BadRequestException('Você não pode desativar o próprio usuário');
    }

    user.setActive(active);
    await this.userRepository.update(user);

    await this.auditLogRepository.create(
      AuditLog.create(active ? 'USUARIO_ATIVADO' : 'USUARIO_DESATIVADO', actor, `${user.getName()} (${user.getUsername()})`),
    );
    return { success: true };
  }
}
