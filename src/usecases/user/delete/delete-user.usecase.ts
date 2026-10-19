import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { UserRepository } from 'src/domain/repositories/user.repository.interface';
import { OrderRepository } from 'src/domain/repositories/order.repository.interface';
import { AuditLogRepository } from 'src/domain/repositories/audit-log.repository.interface';
import { AuditLog } from 'src/domain/entities/audit-log/audit-log.entity';

@Injectable()
export class DeleteUserUsecase {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly orderRepository: OrderRepository,
    private readonly auditLogRepository: AuditLogRepository,
  ) {}

  async execute(id: string, requesterId: string, actor: string): Promise<{ success: boolean }> {
    const user = await this.userRepository.findById(id);
    if (!user) throw new NotFoundException('Usuário não encontrado');
    if (id === requesterId) throw new BadRequestException('Você não pode excluir o próprio usuário');

    // Excluir apagaria os pedidos do usuário (e o histórico dos relatórios)
    if ((await this.orderRepository.countByUserId(id)) > 0) {
      throw new BadRequestException('Este usuário já lançou pedidos. Desative-o em vez de excluir, para manter o histórico.');
    }

    await this.userRepository.delete(id);
    await this.auditLogRepository.create(
      AuditLog.create('USUARIO_EXCLUIDO', actor, `${user.getName()} (${user.getUsername()})`),
    );
    return { success: true };
  }
}
