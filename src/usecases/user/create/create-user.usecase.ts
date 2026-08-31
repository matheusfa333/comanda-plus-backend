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
    email: string;
    password: string;
    role: 'ADMIN' | 'GERENTE' | 'GARCOM' | 'KITCHEN';
  }): Promise<{ id: string; message: string }> {
    // 1. Verificar se email já existe
    const existing = await this.userRepository.findByEmail(dto.email);
    if (existing) {
      throw new BadRequestException('Email já registrado');
    }

    // 2. Validar dados
    if (!dto.name || dto.name.trim().length === 0) {
      throw new BadRequestException('Nome é obrigatório');
    }
    if (!dto.email || !this.isValidEmail(dto.email)) {
      throw new BadRequestException('Email inválido');
    }
    if (!dto.password || dto.password.length < 6) {
      throw new BadRequestException('Senha deve ter pelo menos 6 caracteres');
    }

    // 3. Hash password
    const hashedPassword = await this.hashingService.hash(dto.password);

    // 4. Criar entity
    const user = User.create({
      name: dto.name,
      email: dto.email,
      password: hashedPassword,
      role: dto.role,
    });

    // 5. Salvar
    await this.userRepository.create(user);

    return {
      id: user.getId(),
      message: `Usuário ${user.getName()} criado com sucesso`,
    };
  }

  private isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }
}
