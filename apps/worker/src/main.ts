import { NestFactory } from '@nestjs/core';
import { Logger } from '@nestjs/common';
import { AppModule } from './app.module';

async function bootstrap() {
  const logger = new Logger('Worker');
  const app = await NestFactory.createApplicationContext(AppModule);

  logger.log('Worker is running...');

  // Keep the app running
  process.on('SIGTERM', async () => {
    await app.close();
    process.exit(0);
  });
}
bootstrap();
