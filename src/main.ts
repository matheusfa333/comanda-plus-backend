import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import cookieParser from 'cookie-parser';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Middleware
  app.use(cookieParser());
  app.enableCors({
    origin: ['http://localhost:3000', 'http://localhost:3001'],
    credentials: true,
  });

  // Prefixo global /api (bate com NEXT_PUBLIC_API_URL)
  app.setGlobalPrefix('api');

  const PORT = process.env.PORT || 3001;
  await app.listen(PORT);

  console.log(`✅ API rodando em http://localhost:${PORT}/api`);
  console.log(`📊 Health check: POST http://localhost:${PORT}/api/auth/health`);
}

bootstrap();
