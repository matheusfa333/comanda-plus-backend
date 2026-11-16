import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { JwtService } from 'src/infra/services/jwt/jwt.service';

// Aceita a sessão normal (Bearer) OU o token provisório do login (body.challengeToken).
// Usado para configurar a verificação em 2 etapas: Admin/Gerente fazem isso
// durante o 1º login, antes de terem uma sessão.
@Injectable()
export class AuthOrChallengeGuard implements CanActivate {
  constructor(private jwtService: JwtService) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const challengeToken: string | undefined = request.body?.challengeToken;

    if (challengeToken) {
      try {
        const challenge = this.jwtService.verifyChallenge(challengeToken);
        if (challenge.step !== 'setup') throw new Error();
        request.userId = challenge.userId;
        request.duringLogin = true;
        return true;
      } catch {
        throw new UnauthorizedException('O tempo para configurar acabou. Entre com usuário e senha de novo.');
      }
    }

    const [type, token] = (request.headers.authorization || '').split(' ');
    if (type !== 'Bearer' || !token) throw new UnauthorizedException('Token não fornecido');
    try {
      const payload = this.jwtService.verify(token);
      request.userId = payload.userId;
      request.role = payload.role;
      request.username = payload.username ?? payload.name;
      request.duringLogin = false;
    } catch {
      throw new UnauthorizedException('Token inválido');
    }
    return true;
  }
}
