import { Injectable, UnauthorizedException } from '@nestjs/common';
import { UserRepository } from 'src/domain/repositories/user.repository.interface';
import { HashingService } from 'src/infra/services/hashing/hashing.service';
import { JwtService } from 'src/infra/services/jwt/jwt.service';
import { AuthSession, AuthSessionService } from 'src/infra/services/auth-session/auth-session.service';

export type LoginResult =
  | AuthSession
  // Senha certa, falta o código do app autenticador
  | { status: 'TWO_FACTOR_REQUIRED'; challengeToken: string }
  // Admin/Gerente sem 2 etapas configurada: precisa configurar antes de entrar
  | { status: 'TWO_FACTOR_SETUP_REQUIRED'; challengeToken: string };

@Injectable()
export class LoginUsecase {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly hashingService: HashingService,
    private readonly jwtService: JwtService,
    private readonly authSessionService: AuthSessionService,
  ) {}

  async execute(username: string, password: string): Promise<LoginResult> {
    // 1. Buscar user pelo username
    const user = await this.userRepository.findByUsername((username || '').trim().toLowerCase());
    if (!user) {
      throw new UnauthorizedException('Usuário ou senha incorretos');
    }

    // 2. Validar password
    const isValid = await this.hashingService.compare(password || '', user.getPassword());
    if (!isValid) {
      throw new UnauthorizedException('Usuário ou senha incorretos');
    }

    // 3. Usuário desativado não entra
    if (!user.getActive()) {
      throw new UnauthorizedException('Usuário desativado. Procure o administrador.');
    }

    // 4. Verificação em 2 etapas: a sessão só é liberada depois do código
    if (user.getTwoFactorEnabled()) {
      return { status: 'TWO_FACTOR_REQUIRED', challengeToken: this.jwtService.signChallenge({ userId: user.getId(), step: 'verify' }) };
    }
    if (user.isTwoFactorRequired()) {
      return { status: 'TWO_FACTOR_SETUP_REQUIRED', challengeToken: this.jwtService.signChallenge({ userId: user.getId(), step: 'setup' }) };
    }

    // 5. Sem 2 etapas: gera os tokens direto (sem expor password)
    return this.authSessionService.issue(user);
  }
}
