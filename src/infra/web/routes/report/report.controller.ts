import { Controller, Get, Query, Req, UseGuards, ForbiddenException } from '@nestjs/common';
import { AuthGuard } from 'src/infra/web/auth/auth.guard';
import { GetReportsUsecase, ReportPeriod } from 'src/usecases/report/get-reports/get-reports.usecase';
import { ListLogsUsecase } from 'src/usecases/report/list-logs/list-logs.usecase';

@Controller()
@UseGuards(AuthGuard)
export class ReportController {
  constructor(
    private readonly getReportsUsecase: GetReportsUsecase,
    private readonly listLogsUsecase: ListLogsUsecase,
  ) {}

  private ensureAdmin(req: any) {
    if (req.role !== 'ADMIN') throw new ForbiddenException('Apenas administradores podem ver relatórios e logs');
  }

  @Get('reports')
  async reports(@Req() req: any, @Query('period') period?: ReportPeriod) {
    this.ensureAdmin(req);
    return this.getReportsUsecase.execute(period ?? 'today');
  }

  @Get('logs')
  async logs(@Req() req: any) {
    this.ensureAdmin(req);
    return this.listLogsUsecase.execute();
  }
}
