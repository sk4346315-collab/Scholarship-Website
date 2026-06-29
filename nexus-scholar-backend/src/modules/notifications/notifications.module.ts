import { Module } from '@nestjs/common';
import { NotificationsService } from './notifications.service';

// ConfigModule and PrismaModule are @Global() so they don't need
// to be explicitly imported here — they're available app-wide.
// ScheduleModule is registered globally in AppModule.
@Module({
  providers: [NotificationsService],
  exports: [NotificationsService],
})
export class NotificationsModule {}
