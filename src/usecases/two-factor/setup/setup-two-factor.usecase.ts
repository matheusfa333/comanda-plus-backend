import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { UserRepository } from 'src/domain/repositories/user.repository.interface';
import { TwoFactorService } from 'src/infra/services/two-factor/two-factor.service';

@Injectable()
export class SetupTwoFactorUsecase {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly twoFactorService: TwoFactorService,
  ) {}

  // Gera um segredo novo e o QR Code para escanear no app autenticador.
  // Só passa a valer depois de confirmado com um código (EnableTwoFactorUsecase).
  async execute(userId: string): Promise<{ qrCode: string; secret: string; otpauthUrl: string }> {
    const user = await this.userRepository.findById(userId);
    if (!user || !user.getActive()) throw new NotFoundException('Usuário não encontrado');
    if (user.getTwoFactorEnabled()) {
      throw new BadRequestException('A verificação em 2 etapas já está ativa. Desative antes de configurar de novo.');
    }

    const secret = this.twoFactorService.generateSecret();
    user.startTwoFactorSetup(this.twoFactorService.encrypt(secret));
    await this.userRepository.update(user);

    const { qrCode, otpauthUrl } = await this.twoFactorService.buildQrCode(user.getUsername(), secret);
    // Chave em grupos de 4 para digitar à mão se a câmera não ler o QR
    return { qrCode, otpauthUrl, secret: secret.match(/.{1,4}/g)!.join(' ') };
  }
}
