import { Module } from '@nestjs/common';
import { AuthModule } from './infra/web/routes/auth/auth.module';
import { UserModule } from './infra/web/routes/user/user.module';

@Module({
  imports: [AuthModule, UserModule],
  controllers: [],
  providers: [],
})
export class AppModule {}
