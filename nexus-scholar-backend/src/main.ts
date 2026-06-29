import { NestFactory } from '@nestjs/core';
import { ValidationPipe, Logger } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module'
import { LoggingInterceptor } from './common/interceptors/logging.interceptor';

async function bootstrap() {
  const logger = new Logger('Bootstrap');

  const app = await NestFactory.create(AppModule, {
    logger: ['log', 'warn', 'error'],
    // Suppress verbose NestJS startup logs in production
    bufferLogs: false,
  });

  // Trust reverse proxy headers (Render / Railway / Nginx)
  app.getHttpAdapter().getInstance().set('trust proxy', 1);

  // ── CORS ───────────────────────────────────────────────────────────────────
  app.enableCors({
    origin: process.env.FRONTEND_URL
      ? process.env.FRONTEND_URL.split(',').map(s => s.trim())
      : ['http://localhost:5173', 'http://localhost:3001'],
    credentials: true,
    methods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  });

  // ── Global interceptors ────────────────────────────────────────────────────
  app.useGlobalInterceptors(new LoggingInterceptor())

  // ── Validation (global) ────────────────────────────────────────────────────
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,            // Strip unknown properties
      forbidNonWhitelisted: false, // Don't throw on extra props
      transform: true,             // Auto-transform primitives
      transformOptions: { enableImplicitConversion: true },
    }),
  );

  // ── Swagger docs (dev only) ────────────────────────────────────────────────
  if (process.env.NODE_ENV !== 'production') {
    const config = new DocumentBuilder()
      .setTitle('NEXUS SCHOLAR API')
      .setDescription(
        'AI-Powered Scholarship Intelligence Platform\n\n' +
        '**Auth:** Register → Login → copy accessToken → click Authorize button above',
      )
      .setVersion('2.0.0')
      .addBearerAuth()
      .addTag('Health', 'Health checks')
      .addTag('Scholarships', 'Browse and filter scholarships')
      .addTag('AI Consultant', 'Claude AI — chat, verify, timeline')
      .addTag('Auth', 'Register, login, refresh tokens')
      .addTag('Users', 'Profile, application tracker, document checklist')
      .addTag('Scraping', 'Admin — scraper health and triggers')
      .build();

    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('api/docs', app, document, {
      swaggerOptions: {
        persistAuthorization: true,
        tagsSorter: 'alpha',
      },
    });
    logger.log(`📖 Swagger: http://localhost:${process.env.PORT || 3000}/api/docs`);
  }

  // ── Start server ───────────────────────────────────────────────────────────
  const port = parseInt(process.env.PORT || '3000', 10);
  await app.listen(port, '0.0.0.0');
  logger.log(`⚡ NEXUS SCHOLAR API → http://0.0.0.0:${port}`);
  logger.log(`💓 Health check → http://0.0.0.0:${port}/health`);
}

bootstrap().catch(err => {
  console.error('Fatal startup error:', err);
  process.exit(1);
});
