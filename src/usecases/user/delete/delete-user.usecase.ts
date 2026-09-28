import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { UserRepository } from 'src/domain/repositories/user.repository.interface';

@Injectable()
export class DeleteUserUsecase {
  constructor(private readonly userRepository: UserRepository) {}

  async execute(id: string, requesterId: string): Promise<{ success: boolean }> {
    const user = await this.userRepository.findById(id);
    if (!user) {
      throw new NotFoundException('Usuário não encontrado');
    }

    // Não permitir que o admin exclua a si mesmo
    if (id === requesterId) {
      throw new BadRequestException('Você não pode excluir o próprio usuário');
    }

    await this.userRepository.delete(id);
    return { success: true };
  }
}
