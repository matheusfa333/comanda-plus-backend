import { Controller, Post, Get, Body, HttpCode, HttpStatus, UseGuards, Req } from '@nestjs/common';
import { LoginUsecase } from 'src/usecases/auth/login/login.usecase';
import { ChangePasswordUsecase } from 'src/usecases/auth/change-password/change-password.usecase';
import { SetupTwoFactorUsecase } from 'src/usecases/two-factor/setup/setup-two-factor.usecase';
import { EnableTwoFactorUsecase } from 'src/usecases/two-factor/enable/enable-two-factor.usecase';
import { VerifyTwoFactorUsecase } from 'src/usecases/two-factor/verify/verify-two-factor.usecase';
import { DisableTwoFactorUsecase } from 'src/usecases/two-factor/disable/disable-two-factor.usecase';
import { GetStatusTwoFactorUsecase } from 'src/usecases/two-factor/get-status/get-status-two-factor.usecase';
import { IsPublic } from 'src/infra/web/auth/decorators/is-public.decorator';
import { AuthGuard } from 'src/infra/web/auth/auth.guard';
import { AuthOrChallengeGuard } from 'src/infra/web/auth/auth-or-challenge.guard';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly loginUsecase: LoginUsecase,
    private readonly changePasswordUsecase: ChangePasswordUsecase,
    private readonly setupTwoFactorUsecase: SetupTwoFactorUsecase,
    private readonly enableTwoFactorUsecase: EnableTwoFactorUsecase,
    private readonly verifyTwoFactorUsecase: VerifyTwoFactorUsecase,
    private readonly disableTwoFactorUsecase: DisableTwoFactorUsecase,
    private readonly getStatusTwoFactorUsecase: GetStatusTwoFactorUsecase,
  ) {}

  @IsPublic()
  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(@Body() body: { username: string; password: string }) {
    return this.loginUsecase.execute(body.username, body.password);
  }

  @UseGuards(AuthGuard)
  @Post('change-password')
  @HttpCode(HttpStatus.OK)
  async changePassword(@Req() req: any, @Body() body: { newPassword: string }) {
    return this.changePasswordUsecase.execute(req.userId, body.newPassword);
  }

  // ── Verificação em 2 etapas ──

  // 2ª etapa do login (código do app ou de recuperação)
  @IsPublic()
  @Post('2fa/verify')
  @HttpCode(HttpStatus.OK)
  async verifyTwoFactor(@Body() body: { challengeToken: string; code: string }) {
    return this.verifyTwoFactorUsecase.execute(body.challengeToken, body.code);
  }

  @UseGuards(AuthOrChallengeGuard)
  @Post('2fa/setup')
  @HttpCode(HttpStatus.OK)
  async setupTwoFactor(@Req() req: any) {
    return this.setupTwoFactorUsecase.execute(req.userId);
  }

  @UseGuards(AuthOrChallengeGuard)
  @Post('2fa/enable')
  @HttpCode(HttpStatus.OK)
  async enableTwoFactor(@Req() req: any, @Body() body: { code: string }) {
    return this.enableTwoFactorUsecase.execute(req.userId, body.code, req.duringLogin);
  }

  @UseGuards(AuthGuard)
  @Post('2fa/disable')
  @HttpCode(HttpStatus.OK)
  async disableTwoFactor(@Req() req: any, @Body() body: { code: string }) {
    return this.disableTwoFactorUsecase.execute(req.userId, body.code);
  }

  @UseGuards(AuthGuard)
  @Get('2fa/status')
  async twoFactorStatus(@Req() req: any) {
    return this.getStatusTwoFactorUsecase.execute(req.userId);
  }

  @IsPublic()
  @Post('health')
  @HttpCode(HttpStatus.OK)
  async health() {
    return { status: 'ok', message: 'API rodando com sucesso' };
  }
}
