import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    logger: ['log', 'error', 'warn'],
  });
  await app.listen(3000);
  console.log('🤖 VK News Agent запущен! Планировщик активен.');
}

bootstrap();
