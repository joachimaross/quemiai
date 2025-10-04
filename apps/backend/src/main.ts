import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { AllExceptionsFilter } from './filters/http-exception.filter';
import logger from './config/logger';
import { ValidationPipe } from '@nestjs/common';
import helmet from 'helmet';
import { initializeSentry, Sentry } from './config/sentry';
import { initializeOpenTelemetry } from './config/opentelemetry';

async function bootstrap() {
  // Initialize OpenTelemetry first (must be before other imports)
  initializeOpenTelemetry();
  
  // Initialize Sentry as early as possible
  initializeSentry();

  const app = await NestFactory.create(AppModule, {
    logger: ['error', 'warn', 'log', 'debug', 'verbose'],
  });

  // Security: Helmet middleware for security headers
  app.use(helmet());

  // Sentry request handler (must be the first middleware)
  app.use(Sentry.Handlers.requestHandler());
  // Sentry tracing middleware
  app.use(Sentry.Handlers.tracingHandler());

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

  // Sentry error handler (must be before any other error middleware)
  app.use(Sentry.Handlers.errorHandler());

  const port = process.env.PORT ?? 3000;
  await app.listen(port);

  logger.info(`Application is running on: http://localhost:${port}`);
}

bootstrap();
