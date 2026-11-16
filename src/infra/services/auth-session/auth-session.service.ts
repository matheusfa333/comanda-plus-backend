import { Injectable } from '@nestjs/common';
import { User } from 'src/domain/entities/user/user.entity';
import { JwtService } from 'src/infra/services/jwt/jwt.service';

export interface AuthSession {
  status: 'OK';
  accessToken: string;
  refreshToken: string;
  user: {
    id: string;
    username: string;
    name: string;
    email: string | null;
    role: string;
    needsPasswordChange: boolean;
  };
}

// Gera a sessão (tokens + dados do usuário) depois que o login foi validado
@Injectable()
export class AuthSessionService {
  constructor(private readonly jwtService: JwtService) {}

  issue(user: User): AuthSession {
    // 8h cobre um turno de trabalho sem deslogar
    const accessToken = this.jwtService.sign(
      { userId: user.getId(), username: user.getUsername(), name: user.getName(), role: user.getRole() },
      '8h',
    );
    const refreshToken = this.jwtService.signRefresh({ userId: user.getId() }, '7d');
    return {
      status: 'OK',
      accessToken,
      refreshToken,
      user: {
        id: user.getId(),
        username: user.getUsername(),
        name: user.getName(),
        email: user.getEmail(),
        role: user.getRole(),
        needsPasswordChange: user.getNeedsPasswordChange(),
      },
    };
  }
}
