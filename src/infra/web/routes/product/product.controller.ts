import { Controller, Get, Post, Delete, Patch, Body, Param, Req, UseGuards, ForbiddenException, HttpCode, HttpStatus } from '@nestjs/common';
import { AuthGuard } from 'src/infra/web/auth/auth.guard';
import { ListProductsUsecase } from 'src/usecases/product/list/list-products.usecase';
import { CreateProductUsecase, CreateProductInput } from 'src/usecases/product/create/create-product.usecase';
import { RemoveProductUsecase } from 'src/usecases/product/remove/remove-product.usecase';
import { AdjustStockUsecase } from 'src/usecases/product/adjust-stock/adjust-stock.usecase';

@Controller('products')
@UseGuards(AuthGuard)
export class ProductController {
  constructor(
    private readonly listProductsUsecase: ListProductsUsecase,
    private readonly createProductUsecase: CreateProductUsecase,
    private readonly removeProductUsecase: RemoveProductUsecase,
    private readonly adjustStockUsecase: AdjustStockUsecase,
  ) {}

  private ensureAdmin(req: any) {
    if (req.role !== 'ADMIN') throw new ForbiddenException('Apenas administradores podem alterar o cardápio');
  }

  @Get()
  async list() {
    return this.listProductsUsecase.execute();
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(@Req() req: any, @Body() body: CreateProductInput) {
    this.ensureAdmin(req);
    return this.createProductUsecase.execute(body, req.username);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  async remove(@Req() req: any, @Param('id') id: string) {
    this.ensureAdmin(req);
    return this.removeProductUsecase.execute(id, req.username);
  }

  @Patch(':id/stock')
  @HttpCode(HttpStatus.OK)
  async adjustStock(@Req() req: any, @Param('id') id: string, @Body() body: { stock: number }) {
    this.ensureAdmin(req);
    return this.adjustStockUsecase.execute(id, Number(body.stock), req.username);
  }
}
