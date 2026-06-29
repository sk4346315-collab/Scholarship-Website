import { Module } from '@nestjs/common';
import { APP_GUARD, APP_FILTER } from '@nestjs/core';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';
import { ThrottlerModule } from '@nestjs/throttler';
import { BullModule } from '@nestjs/bullmq';
import { PrismaModule } from './database/prisma.module';
import { ScholarshipsModule } from './modules/scholarships/scholarships.module';
import { ScrapingModule } from './modules/scraping/scraping.module';
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { AiModule } from './modules/ai/ai.module';
import { NotificationsModule } from './modules/notifications/notifications.module';
import { HealthController } from './health.controller';
import { CustomThrottlerGuard } from './common/guards/throttler.guard';
import { GlobalExceptionFilter } from './common/filters/http-exception.filter';

@Module({
  imports: [
    // ── Global config (reads .env) ──────────────────────────────────────────
    ConfigModule.forRoot({ isGlobal: true, envFilePath: '.env' }),

    // ── Rate limiting — 100 requests per minute per IP ──────────────────────
    ThrottlerModule.forRoot([{ ttl: 60000, limit: 100 }]),

    // ── Cron job scheduler ──────────────────────────────────────────────────
    ScheduleModule.forRoot(),

    // ── BullMQ — connects to Upstash/Redis ──────────────────────────────────
    BullModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (cfg: ConfigService) => ({
        connection: { url: cfg.get<string>('REDIS_URL') },
        defaultJobOptions: {
          removeOnComplete: { count: 100 },
          removeOnFail: { count: 50 },
        },
      }),
    }),

    // ── Feature modules ─────────────────────────────────────────────────────
    PrismaModule,       // Global — no need to import in other modules
    AiModule,
    ScholarshipsModule,
    ScrapingModule,
    AuthModule,
    UsersModule,
    NotificationsModule,
  ],

  controllers: [HealthController],

  providers: [
    // Apply throttle guard to EVERY route globally
    {
      provide: APP_GUARD,
      useClass: CustomThrottlerGuard,
    },
    // Apply global exception filter via DI (alternative to useGlobalFilters)
    {
      provide: APP_FILTER,
      useClass: GlobalExceptionFilter,
    },
  ],
})
export class AppModule {}
