import { Controller, Post, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { LoginUsecase } from 'src/usecases/auth/login/login.usecase';
import { IsPublic } from 'src/infra/web/auth/decorators/is-public.decorator';

@Controller('auth')
export class AuthController {
  constructor(private readonly loginUsecase: LoginUsecase) {}

  @IsPublic()
  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(@Body() body: { email: string; password: string }) {
    return this.loginUsecase.execute(body.email, body.password);
  }

  @IsPublic()
  @Post('health')
  @HttpCode(HttpStatus.OK)
  async health() {
    return { status: 'ok', message: 'API rodando com sucesso' };
  }
}
