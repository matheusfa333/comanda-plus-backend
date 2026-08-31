import { Controller, Post, Get, Body, UseGuards, Req } from '@nestjs/common';
import { AuthGuard } from 'src/infra/web/auth/auth.guard';
import { CreateUserUsecase } from 'src/usecases/user/create/create-user.usecase';

@Controller('users')
@UseGuards(AuthGuard)
export class UserController {
  constructor(private readonly createUserUsecase: CreateUserUsecase) {}

  @Post()
  async create(
    @Req() req: any,
    @Body() body: { name: string; email: string; password: string; role: string },
  ) {
    // Validar que o usuário é admin
    if (req.role !== 'ADMIN') {
      throw new Error('Apenas admins podem criar usuários');
    }

    return this.createUserUsecase.execute({
      name: body.name,
      email: body.email,
      password: body.password,
      role: body.role as any,
    });
  }

  @Get('me')
  async getMe(@Req() req: any) {
    return {
      userId: req.userId,
      role: req.role,
      message: 'Usuário autenticado',
    };
  }
}
