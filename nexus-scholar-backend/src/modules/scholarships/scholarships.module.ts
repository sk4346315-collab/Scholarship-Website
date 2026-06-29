import { Module } from '@nestjs/common';
import { ScholarshipsService } from './scholarships.service';
import { ScholarshipsController } from './scholarships.controller';
import { AiModule } from '../ai/ai.module';

@Module({
  imports: [AiModule],
  providers: [ScholarshipsService],
  controllers: [ScholarshipsController],
  exports: [ScholarshipsService],
})
export class ScholarshipsModule {}
