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

  verifyRefresh(token: string): any {
    try {
      const secret = process.env.JWT_REFRESH_SECRET || 'refresh';
      return jwt.verify(token, secret);
    } catch (error) {
      throw new Error('Refresh token inválido');
    }
  }
}
