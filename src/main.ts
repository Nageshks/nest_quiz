import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

const frontendUrl = process.env.FRONTEND_URL || null;

const allowedOrigins = [
  'http://localhost:4200',
  'http://localhost:5173',
  'http://localhost:3000',
  'https://quiz.nageshks.com',
  ...(frontendUrl ? [frontendUrl] : []),
];

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error(`Not allowed by CORS: ${origin}`));
      }
    },
    credentials: true,
  });
  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
