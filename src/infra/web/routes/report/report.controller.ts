import { Controller, Get, Query, Req, UseGuards, ForbiddenException, BadRequestException } from '@nestjs/common';
import { AuthGuard } from 'src/infra/web/auth/auth.guard';
import { GetReportsUsecase } from 'src/usecases/report/get-reports/get-reports.usecase';
import { ListLogsUsecase } from 'src/usecases/report/list-logs/list-logs.usecase';
import { ListClosedAccountsUsecase } from 'src/usecases/report/list-closed-accounts/list-closed-accounts.usecase';
import { Utils } from 'src/shared/utils/utils';

@Controller()
@UseGuards(AuthGuard)
export class ReportController {
  constructor(
    private readonly getReportsUsecase: GetReportsUsecase,
    private readonly listLogsUsecase: ListLogsUsecase,
    private readonly listClosedAccountsUsecase: ListClosedAccountsUsecase,
  ) {}

  private ensureRole(req: any, roles: string[]) {
    if (!roles.includes(req.role)) throw new ForbiddenException('Você não tem permissão para acessar esta área');
  }

  private range(from?: string, to?: string) {
    const r = Utils.dayRangeBrt(from, to);
    if (!r) throw new BadRequestException('Período inválido. Use datas no formato AAAA-MM-DD e a data inicial antes da final.');
    return r;
  }

  @Get('reports')
  async reports(@Req() req: any, @Query('from') from?: string, @Query('to') to?: string) {
    this.ensureRole(req, ['ADMIN', 'GERENTE']);
    const r = this.range(from, to);
    return this.getReportsUsecase.execute(r.from, r.to);
  }

  @Get('closed-accounts')
  async closedAccounts(@Req() req: any, @Query('from') from?: string, @Query('to') to?: string) {
    this.ensureRole(req, ['ADMIN', 'GERENTE']);
    const r = this.range(from, to);
    return this.listClosedAccountsUsecase.execute(r.from, r.to);
  }

  @Get('logs')
  async logs(@Req() req: any, @Query('from') from?: string, @Query('to') to?: string, @Query('action') action?: string) {
    this.ensureRole(req, ['ADMIN']);
    const r = this.range(from, to);
    return this.listLogsUsecase.execute(r.from, r.to, action?.trim() || undefined);
  }
}
