import { Controller, Get, Post, Body, Param, Req, UseGuards, HttpCode, HttpStatus } from '@nestjs/common';
import { AuthGuard } from 'src/infra/web/auth/auth.guard';
import { ListTablesUsecase } from 'src/usecases/table/list/list-tables.usecase';
import { OpenTableUsecase } from 'src/usecases/table/open/open-table.usecase';
import { CloseTableUsecase } from 'src/usecases/table/close/close-table.usecase';

@Controller('tables')
@UseGuards(AuthGuard)
export class TableController {
  constructor(
    private readonly listTablesUsecase: ListTablesUsecase,
    private readonly openTableUsecase: OpenTableUsecase,
    private readonly closeTableUsecase: CloseTableUsecase,
  ) {}

  @Get()
  async list() {
    return this.listTablesUsecase.execute();
  }

  @Post('open')
  @HttpCode(HttpStatus.CREATED)
  async open(@Req() req: any, @Body() body: { identifier: string; capacity?: number; clientName?: string }) {
    return this.openTableUsecase.execute(
      { identifier: body.identifier, capacity: body.capacity, clientName: body.clientName },
      req.username,
    );
  }

  @Post(':id/close')
  @HttpCode(HttpStatus.OK)
  async close(@Req() req: any, @Param('id') id: string) {
    return this.closeTableUsecase.execute(id, req.username, req.role);
  }
}
