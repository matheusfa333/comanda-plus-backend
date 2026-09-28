import { Controller, Get, Post, Body, Param, UseGuards, HttpCode, HttpStatus } from '@nestjs/common';
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
  async open(@Body() body: { number: number; capacity?: number; clientName?: string }) {
    return this.openTableUsecase.execute({
      number: Number(body.number),
      capacity: body.capacity,
      clientName: body.clientName,
    });
  }

  @Post(':id/close')
  @HttpCode(HttpStatus.OK)
  async close(@Param('id') id: string) {
    return this.closeTableUsecase.execute(id);
  }
}
