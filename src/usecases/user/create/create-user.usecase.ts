import { Injectable, BadRequestException } from '@nestjs/common';
import { UserRepository } from 'src/domain/repositories/user.repository.interface';
import { User } from 'src/domain/entities/user/user.entity';
import { HashingService } from 'src/infra/services/hashing/hashing.service';

@Injectable()
export class CreateUserUsecase {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly hashingService: HashingService,
  ) {}

  async execute(dto: {
    name: string;
    email?: string;
    password?: string;
    role: 'ADMIN' | 'GERENTE' | 'GARCOM' | 'COZINHA';
  }): Promise<{ id: string; message: string }> {
    // 1. Validar nome
    if (!dto.name || dto.name.trim().length === 0) {
      throw new BadRequestException('Nome é obrigatório');
    }

    // Validar role permitida
    const validRoles = ['ADMIN', 'GERENTE', 'GARCOM', 'COZINHA'];
    if (!validRoles.includes(dto.role)) {
      throw new BadRequestException('Função (role) inválida');
    }

    // 2. Verificar se nome já existe (login é por nome)
    const existing = await this.userRepository.findByName(dto.name.trim());
    if (existing) {
      throw new BadRequestException('Já existe um usuário com esse nome');
    }

    // 3. Senha padrão "123" — novo usuário troca no primeiro login
    const initialPassword = dto.password && dto.password.length > 0 ? dto.password : '123';
    const hashedPassword = await this.hashingService.hash(initialPassword);

    // 4. Criar entity (needsPasswordChange = true por padrão)
    const user = User.create({
      name: dto.name.trim(),
      email: dto.email ?? null,
      password: hashedPassword,
      role: dto.role,
      needsPasswordChange: true,
    });

    // 5. Salvar
    await this.userRepository.create(user);

    return {
      id: user.getId(),
      message: `Usuário ${user.getName()} criado com sucesso`,
    };
  }
}
