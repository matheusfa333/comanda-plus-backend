import { Injectable, UnauthorizedException } from '@nestjs/common';
import { UserRepository } from 'src/domain/repositories/user.repository.interface';
import { HashingService } from 'src/infra/services/hashing/hashing.service';
import { JwtService } from 'src/infra/services/jwt/jwt.service';

@Injectable()
export class LoginUsecase {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly hashingService: HashingService,
    private readonly jwtService: JwtService,
  ) {}

  async execute(
    name: string,
    password: string,
  ): Promise<{ accessToken: string; refreshToken: string; user: any }> {
    // 1. Buscar user pelo nome
    const user = await this.userRepository.findByName(name);
    if (!user) {
      throw new UnauthorizedException('Usuário ou senha incorretos');
    }

    // 2. Validar password
    const isValid = await this.hashingService.compare(password, user.getPassword());
    if (!isValid) {
      throw new UnauthorizedException('Usuário ou senha incorretos');
    }

    // 3. Gerar tokens
    const accessToken = this.jwtService.sign(
      { userId: user.getId(), name: user.getName(), role: user.getRole() },
      '15m',
    );
    const refreshToken = this.jwtService.signRefresh(
      { userId: user.getId() },
      '7d',
    );

    // 4. Retornar (sem expor password)
    return {
      accessToken,
      refreshToken,
      user: {
        id: user.getId(),
        name: user.getName(),
        email: user.getEmail(),
        role: user.getRole(),
        needsPasswordChange: user.getNeedsPasswordChange(),
      },
    };
  }
}
