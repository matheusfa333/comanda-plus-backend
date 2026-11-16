import { Injectable, NotFoundException } from '@nestjs/common';
import { UserRepository } from 'src/domain/repositories/user.repository.interface';

@Injectable()
export class GetStatusTwoFactorUsecase {
  constructor(private readonly userRepository: UserRepository) {}

  async execute(userId: string): Promise<{ enabled: boolean; required: boolean; recoveryCodesLeft: number }> {
    const user = await this.userRepository.findById(userId);
    if (!user) throw new NotFoundException('Usuário não encontrado');
    return {
      enabled: user.getTwoFactorEnabled(),
      required: user.isTwoFactorRequired(),
      recoveryCodesLeft: user.getTwoFactorEnabled() ? user.getTwoFactorRecoveryCodes().length : 0,
    };
  }
}
