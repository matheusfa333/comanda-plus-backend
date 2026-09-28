import { Controller, Post, Body, HttpCode, HttpStatus, UseGuards, Req } from '@nestjs/common';
import { LoginUsecase } from 'src/usecases/auth/login/login.usecase';
import { ChangePasswordUsecase } from 'src/usecases/auth/change-password/change-password.usecase';
import { IsPublic } from 'src/infra/web/auth/decorators/is-public.decorator';
import { AuthGuard } from 'src/infra/web/auth/auth.guard';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly loginUsecase: LoginUsecase,
    private readonly changePasswordUsecase: ChangePasswordUsecase,
  ) {}

  @IsPublic()
  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(@Body() body: { name: string; password: string }) {
    return this.loginUsecase.execute(body.name, body.password);
  }

  @UseGuards(AuthGuard)
  @Post('change-password')
  @HttpCode(HttpStatus.OK)
  async changePassword(@Req() req: any, @Body() body: { newPassword: string }) {
    return this.changePasswordUsecase.execute(req.userId, body.newPassword);
  }

  @IsPublic()
  @Post('health')
  @HttpCode(HttpStatus.OK)
  async health() {
    return { status: 'ok', message: 'API rodando com sucesso' };
  }
}
