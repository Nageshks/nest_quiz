import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:4200';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors({
    origin: frontendUrl,
    credentials: true,
  });
  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
