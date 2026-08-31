import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import cookieParser from 'cookie-parser';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Middleware
  app.use(cookieParser());
  app.enableCors({
    origin: 'http://localhost:3000',
    credentials: true,
  });

  const PORT = process.env.PORT || 3001;
  await app.listen(PORT);

  console.log(`✅ API rodando em http://localhost:${PORT}`);
  console.log(`📊 Health check: POST http://localhost:${PORT}/auth/health`);
}

bootstrap();
