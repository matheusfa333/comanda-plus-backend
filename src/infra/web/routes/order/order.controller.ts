import { Controller, Get, Post, Patch, Body, Param, Req, UseGuards, HttpCode, HttpStatus } from '@nestjs/common';
import { AuthGuard } from 'src/infra/web/auth/auth.guard';
import { CreateOrderUsecase } from 'src/usecases/order/create/create-order.usecase';
import { ListOrdersByTableUsecase } from 'src/usecases/order/list-by-table/list-orders-by-table.usecase';
import { ListKitchenOrdersUsecase } from 'src/usecases/order/list-kitchen/list-kitchen-orders.usecase';
import { UpdateOrderStatusUsecase } from 'src/usecases/order/update-status/update-order-status.usecase';

@Controller('orders')
@UseGuards(AuthGuard)
export class OrderController {
  constructor(
    private readonly createOrderUsecase: CreateOrderUsecase,
    private readonly listOrdersByTableUsecase: ListOrdersByTableUsecase,
    private readonly listKitchenOrdersUsecase: ListKitchenOrdersUsecase,
    private readonly updateOrderStatusUsecase: UpdateOrderStatusUsecase,
  ) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(
    @Req() req: any,
    @Body() body: { tableId: string; items: { productId: string; quantity: number; notes?: string }[] },
  ) {
    return this.createOrderUsecase.execute({
      tableId: body.tableId,
      userId: req.userId,
      items: body.items,
    });
  }

  @Get('kitchen')
  async kitchen() {
    return this.listKitchenOrdersUsecase.execute();
  }

  @Get('table/:tableId')
  async byTable(@Param('tableId') tableId: string) {
    return this.listOrdersByTableUsecase.execute(tableId);
  }

  @Patch(':id/status')
  @HttpCode(HttpStatus.OK)
  async updateStatus(@Param('id') id: string, @Body() body: { status: string }) {
    return this.updateOrderStatusUsecase.execute(id, body.status);
  }
}
