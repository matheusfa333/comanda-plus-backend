import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { UserRepository } from 'src/domain/repositories/user.repository.interface';
import { HashingService } from 'src/infra/services/hashing/hashing.service';

@Injectable()
export class ChangePasswordUsecase {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly hashingService: HashingService,
  ) {}

  async execute(userId: string, newPassword: string): Promise<{ success: boolean }> {
    // 1. Validar senha
    if (!newPassword || newPassword.length < 6) {
      throw new BadRequestException('Senha deve ter no mínimo 6 caracteres');
    }
    if (/^\d+$/.test(newPassword)) {
      throw new BadRequestException('Senha não pode conter apenas números');
    }

    // 2. Buscar usuário
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new NotFoundException('Usuário não encontrado');
    }

    // 3. Atualizar senha (updatePassword já marca needsPasswordChange = false)
    const hashed = await this.hashingService.hash(newPassword);
    user.updatePassword(hashed);
    await this.userRepository.update(user);

    return { success: true };
  }
}
