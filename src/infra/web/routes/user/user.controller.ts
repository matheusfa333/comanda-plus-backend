import { Controller, Post, Get, Delete, Body, Param, UseGuards, Req, ForbiddenException, HttpCode, HttpStatus } from '@nestjs/common';
import { AuthGuard } from 'src/infra/web/auth/auth.guard';
import { CreateUserUsecase } from 'src/usecases/user/create/create-user.usecase';
import { ListUsersUsecase } from 'src/usecases/user/list/list-users.usecase';
import { DeleteUserUsecase } from 'src/usecases/user/delete/delete-user.usecase';
import { ResetPasswordUsecase } from 'src/usecases/user/reset-password/reset-password.usecase';

@Controller('users')
@UseGuards(AuthGuard)
export class UserController {
  constructor(
    private readonly createUserUsecase: CreateUserUsecase,
    private readonly listUsersUsecase: ListUsersUsecase,
    private readonly deleteUserUsecase: DeleteUserUsecase,
    private readonly resetPasswordUsecase: ResetPasswordUsecase,
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
    @Body() body: { name: string; email?: string; password?: string; role: string },
  ) {
    this.ensureAdmin(req);
    return this.createUserUsecase.execute({
      name: body.name,
      email: body.email,
      password: body.password,
      role: body.role as any,
    });
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  async remove(@Req() req: any, @Param('id') id: string) {
    this.ensureAdmin(req);
    return this.deleteUserUsecase.execute(id, req.userId);
  }

  @Post(':id/reset-password')
  @HttpCode(HttpStatus.OK)
  async resetPassword(@Req() req: any, @Param('id') id: string) {
    this.ensureAdmin(req);
    return this.resetPasswordUsecase.execute(id);
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
