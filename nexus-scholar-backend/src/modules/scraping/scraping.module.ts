import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { ScrapingService } from './scraping.service';
import { ScrapingProcessor } from './scraping.processor';
import { ScrapingController } from './scraping.controller';
import { AiModule } from '../ai/ai.module';

@Module({
  imports: [
    BullModule.registerQueue({ name: 'scraping', defaultJobOptions: { removeOnComplete: 100, removeOnFail: 50 } }),
    AiModule,
  ],
  providers: [ScrapingService, ScrapingProcessor],
  controllers: [ScrapingController],
  exports: [ScrapingService],
})
export class ScrapingModule {}
