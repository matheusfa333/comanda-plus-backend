import { Module } from '@nestjs/common';
import { AuthModule } from './infra/web/routes/auth/auth.module';
import { UserModule } from './infra/web/routes/user/user.module';
import { ProductModule } from './infra/web/routes/product/product.module';
import { TableModule } from './infra/web/routes/table/table.module';
import { OrderModule } from './infra/web/routes/order/order.module';

@Module({
  imports: [AuthModule, UserModule, ProductModule, TableModule, OrderModule],
  controllers: [],
  providers: [],
})
export class AppModule {}
