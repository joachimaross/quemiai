// Initialize OpenTelemetry FIRST - before any other imports
import { initializeOpenTelemetry } from './config/opentelemetry';
initializeOpenTelemetry();

import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { AllExceptionsFilter } from './filters/http-exception.filter';
import logger from './config/logger';
import { ValidationPipe } from '@nestjs/common';
import helmet from 'helmet';
import { initializeSentry } from './config/sentry';

// Initialize Sentry after OpenTelemetry
initializeSentry();

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    logger: ['error', 'warn', 'log', 'debug', 'verbose'],
  });

  // Security: Helmet middleware for security headers
  app.use(helmet());

  // Enable CORS with environment-based configuration
  const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3001';
  app.enableCors({
    origin: frontendUrl,
    methods: 'GET,POST,PUT,DELETE,OPTIONS',
    credentials: true,
  });

  // Global exception filter
  app.useGlobalFilters(new AllExceptionsFilter());

  // Global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  const port = process.env.PORT ?? 3000;
  await app.listen(port);

  logger.info(`Application is running on: http://localhost:${port}`);
}

bootstrap();
