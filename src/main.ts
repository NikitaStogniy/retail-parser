import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as cors from 'cors';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.setGlobalPrefix('api');
  app.use(
    cors({
      origin: 'http://localhost:3001', // Только этот домен получит доступ к API
    }),
  );
  await app.listen(3000);
}
bootstrap();
