import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
//меня пытали сроками, прости за беспорядок
//Тайлер Дерден однажды сказал: никакие деньги не сделают тебя счастливым, особенно если деньги никакие...
async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.setGlobalPrefix('api');

  await app.listen(3000);
}
bootstrap();
