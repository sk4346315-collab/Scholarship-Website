import { Controller, Get, Post, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { ScrapingService, SOURCE_REGISTRY } from './scraping.service'
import { TriggerScrapeDto } from './dto/trigger-scrape.dto';
import { Throttle } from '@nestjs/throttler';

@ApiTags('Scraping')
@Controller('api/admin/scraping')
export class ScrapingController {
  constructor(private svc: ScrapingService) {}

  @Get('status')
  @ApiOperation({ summary: 'Get scraping source health & queue stats' })
  status() {
    return this.svc.getScrapeStatus();
  }

  @Get('sources')
  @ApiOperation({ summary: 'List all scraping sources in registry' })
  sources() {
    return SOURCE_REGISTRY;
  }

  @Post('trigger')
  @Throttle({ default: { limit: 3, ttl: 60000 } })
  @ApiOperation({ summary: 'Manually trigger scrape for a source' })
  trigger(@Body() dto: TriggerScrapeDto) {
    const source = SOURCE_REGISTRY.find(s => s.url === url);
    if (!source) return { error: 'Source not in registry' };
    return this.svc.scrapeSource(source);
  }

  @Post('trigger-all')
  @Throttle({ default: { limit: 1, ttl: 300000 } })
  @ApiOperation({ summary: 'Trigger full daily scrape immediately (rate-limited: 1/5min)' })
  triggerAll() {
    return this.svc.scheduleDailyAll();
  }
}
