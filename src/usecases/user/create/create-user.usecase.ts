import { Injectable, BadRequestException } from '@nestjs/common';
import { UserRepository } from 'src/domain/repositories/user.repository.interface';
import { AuditLogRepository } from 'src/domain/repositories/audit-log.repository.interface';
import { User, UserRole, USER_ROLES } from 'src/domain/entities/user/user.entity';
import { AuditLog } from 'src/domain/entities/audit-log/audit-log.entity';
import { HashingService } from 'src/infra/services/hashing/hashing.service';

@Injectable()
export class CreateUserUsecase {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly hashingService: HashingService,
    private readonly auditLogRepository: AuditLogRepository,
  ) {}

  async execute(
    dto: { username: string; name: string; email?: string; password?: string; role: UserRole },
    actor: string,
  ): Promise<{ id: string; message: string }> {
    const username = (dto.username || '').trim().toLowerCase();
    const name = (dto.name || '').trim();

    if (!name) throw new BadRequestException('Nome é obrigatório');
    if (!username) throw new BadRequestException('Usuário (login) é obrigatório');
    if (!/^[a-z0-9._-]{3,30}$/.test(username)) {
      throw new BadRequestException('Usuário deve ter de 3 a 30 caracteres: letras minúsculas, números, ponto, hífen ou sublinhado');
    }
    if (!USER_ROLES.includes(dto.role)) {
      throw new BadRequestException('Função inválida');
    }

    if (await this.userRepository.findByUsername(username)) {
      throw new BadRequestException('Já existe um usuário com esse login');
    }
    if (await this.userRepository.findByName(name)) {
      throw new BadRequestException('Já existe um usuário com esse nome');
    }

    // Senha padrão "123" — novo usuário troca no primeiro login
    const initialPassword = dto.password && dto.password.length > 0 ? dto.password : '123';
    const hashedPassword = await this.hashingService.hash(initialPassword);

    const user = User.create({
      username,
      name,
      email: dto.email ?? null,
      password: hashedPassword,
      role: dto.role,
      needsPasswordChange: true,
    });
    await this.userRepository.create(user);

    await this.auditLogRepository.create(
      AuditLog.create('USUARIO_CRIADO', actor, `${name} (${username}) — ${dto.role}`),
    );

    return { id: user.getId(), message: `Usuário ${name} criado com sucesso` };
  }
}
