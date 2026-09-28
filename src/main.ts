import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import cookieParser from 'cookie-parser';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Middleware
  app.use(cookieParser());
  app.enableCors({
    origin: (origin, callback) => {
      // Permite requisições sem origin (curl, apps mobile) e as origens conhecidas
      if (!origin) return callback(null, true);
      const allowed =
        origin === 'http://localhost:3000' ||
        origin === 'http://localhost:3001' ||
        origin === 'https://comandaplus.duckdns.org' ||
        /^https:\/\/.*\.vercel\.app$/.test(origin); // qualquer deploy/preview da Vercel
      return callback(null, allowed);
    },
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
