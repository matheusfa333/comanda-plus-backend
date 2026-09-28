import { Injectable, NotFoundException } from '@nestjs/common';
import { UserRepository } from 'src/domain/repositories/user.repository.interface';
import { HashingService } from 'src/infra/services/hashing/hashing.service';

@Injectable()
export class ResetPasswordUsecase {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly hashingService: HashingService,
  ) {}

  // Admin reseta a senha de um usuário para o padrão "123" (troca obrigatória no próximo login)
  async execute(userId: string): Promise<{ success: boolean }> {
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new NotFoundException('Usuário não encontrado');
    }

    const hashed = await this.hashingService.hash('123');
    user.updatePassword(hashed); // marca needsPasswordChange = false...
    // ...então forçamos a troca no próximo login
    user.requirePasswordChange();
    await this.userRepository.update(user);

    return { success: true };
  }
}
