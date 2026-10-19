import { Controller, Post, Get, Delete, Patch, Body, Param, UseGuards, Req, ForbiddenException, HttpCode, HttpStatus } from '@nestjs/common';
import { AuthGuard } from 'src/infra/web/auth/auth.guard';
import { CreateUserUsecase } from 'src/usecases/user/create/create-user.usecase';
import { ListUsersUsecase } from 'src/usecases/user/list/list-users.usecase';
import { DeleteUserUsecase } from 'src/usecases/user/delete/delete-user.usecase';
import { ResetPasswordUsecase } from 'src/usecases/user/reset-password/reset-password.usecase';
import { SetUserActiveUsecase } from 'src/usecases/user/set-active/set-user-active.usecase';

@Controller('users')
@UseGuards(AuthGuard)
export class UserController {
  constructor(
    private readonly createUserUsecase: CreateUserUsecase,
    private readonly listUsersUsecase: ListUsersUsecase,
    private readonly deleteUserUsecase: DeleteUserUsecase,
    private readonly resetPasswordUsecase: ResetPasswordUsecase,
    private readonly setUserActiveUsecase: SetUserActiveUsecase,
  ) {}

  private ensureAdmin(req: any) {
    if (req.role !== 'ADMIN') {
      throw new ForbiddenException('Apenas administradores podem gerenciar usuários');
    }
  }

  @Get()
  async list(@Req() req: any) {
    this.ensureAdmin(req);
    return this.listUsersUsecase.execute();
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(
    @Req() req: any,
    @Body() body: { username: string; name: string; email?: string; password?: string; role: string },
  ) {
    this.ensureAdmin(req);
    return this.createUserUsecase.execute(
      { username: body.username, name: body.name, email: body.email, password: body.password, role: body.role as any },
      req.username,
    );
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  async remove(@Req() req: any, @Param('id') id: string) {
    this.ensureAdmin(req);
    return this.deleteUserUsecase.execute(id, req.userId, req.username);
  }

  @Post(':id/reset-password')
  @HttpCode(HttpStatus.OK)
  async resetPassword(@Req() req: any, @Param('id') id: string) {
    this.ensureAdmin(req);
    return this.resetPasswordUsecase.execute(id, req.username);
  }

  @Patch(':id/active')
  @HttpCode(HttpStatus.OK)
  async setActive(@Req() req: any, @Param('id') id: string, @Body() body: { active: boolean }) {
    this.ensureAdmin(req);
    return this.setUserActiveUsecase.execute(id, !!body.active, req.userId, req.username);
  }

  @Get('me')
  async getMe(@Req() req: any) {
    return { userId: req.userId, role: req.role, message: 'Usuário autenticado' };
  }
}
