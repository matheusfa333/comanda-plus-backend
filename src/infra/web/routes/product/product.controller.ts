import { Controller, Get, UseGuards } from '@nestjs/common';
import { AuthGuard } from 'src/infra/web/auth/auth.guard';
import { ListProductsUsecase } from 'src/usecases/product/list/list-products.usecase';

@Controller('products')
@UseGuards(AuthGuard)
export class ProductController {
  constructor(private readonly listProductsUsecase: ListProductsUsecase) {}

  @Get()
  async list() {
    return this.listProductsUsecase.execute();
  }
}
