import { Injectable } from '@nestjs/common';
import * as jwt from 'jsonwebtoken';

@Injectable()
export class JwtService {
  sign(payload: any, expiresIn: string = '1h'): string {
    const secret = process.env.JWT_SECRET || 'secret';
    return jwt.sign(payload, secret, { expiresIn } as any);
  }

  signRefresh(payload: any, expiresIn: string = '7d'): string {
    const secret = process.env.JWT_REFRESH_SECRET || 'refresh';
    return jwt.sign(payload, secret, { expiresIn } as any);
  }

  verify(token: string): any {
    try {
      const secret = process.env.JWT_SECRET || 'secret';
      return jwt.verify(token, secret);
    } catch (error) {
      throw new Error('Token inválido');
    }
  }

  // Token provisório do login em 2 etapas: não dá acesso ao sistema, só à tela do código
  signChallenge(payload: { userId: string; step: 'verify' | 'setup' }, expiresIn: string = '10m'): string {
    return jwt.sign({ ...payload, purpose: '2fa' }, this.challengeSecret(), { expiresIn } as any);
  }

  verifyChallenge(token: string): { userId: string; step: 'verify' | 'setup' } {
    try {
      const payload: any = jwt.verify(token, this.challengeSecret());
      if (payload?.purpose !== '2fa' || !payload.userId) throw new Error();
      return { userId: payload.userId, step: payload.step };
    } catch (error) {
      throw new Error('Token de verificação inválido');
    }
  }

  private challengeSecret(): string {
    return `${process.env.JWT_SECRET || 'secret'}:2fa-challenge`;
  }

  verifyRefresh(token: string): any {
    try {
      const secret = process.env.JWT_REFRESH_SECRET || 'refresh';
      return jwt.verify(token, secret);
    } catch (error) {
      throw new Error('Refresh token inválido');
    }
  }
}
