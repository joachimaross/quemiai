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

  // Security: Helmet middleware for enhanced security headers
  app.use(
    helmet({
      // Content Security Policy
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          styleSrc: ["'self'", "'unsafe-inline'"],
          scriptSrc: ["'self'"],
          imgSrc: ["'self'", 'data:', 'https:'],
          connectSrc: ["'self'"],
          fontSrc: ["'self'"],
          objectSrc: ["'none'"],
          mediaSrc: ["'self'"],
          frameSrc: ["'none'"],
        },
      },
      // HTTP Strict Transport Security
      hsts: {
        maxAge: 31536000, // 1 year
        includeSubDomains: true,
        preload: true,
      },
      // X-Content-Type-Options
      noSniff: true,
      // X-Frame-Options
      frameguard: {
        action: 'deny',
      },
      // X-XSS-Protection (legacy browsers)
      xssFilter: true,
      // Referrer Policy
      referrerPolicy: {
        policy: 'strict-origin-when-cross-origin',
      },
    }),
  );

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

  // Setup Swagger API documentation (if enabled)
  if (process.env.SWAGGER_ENABLED === 'true') {
    const { DocumentBuilder, SwaggerModule } = await import('@nestjs/swagger');
    const config = new DocumentBuilder()
      .setTitle('Quemiai API')
      .setDescription('QUEMI - Unified social media and messaging platform API')
      .setVersion('1.0')
      .addBearerAuth()
      .addTag('health', 'Health check and metrics endpoints')
      .addTag('auth', 'Authentication and authorization')
      .addTag('chat', 'Real-time chat and messaging')
      .addTag('social', 'Social media features')
      .build();
    
    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('api/docs', app, document);
    
    logger.info('Swagger documentation available at: http://localhost:' + port + '/api/docs');
  }

  logger.info(`Application is running on: http://localhost:${port}`);
}

bootstrap();
