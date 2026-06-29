import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Logger } from '@nestjs/common';
import { Job } from 'bullmq';
import { ScrapingService } from './scraping.service';

@Processor('scraping')
export class ScrapingProcessor extends WorkerHost {
  private readonly logger = new Logger(ScrapingProcessor.name);

  constructor(private scraping: ScrapingService) {
    super();
  }

  async process(job: Job) {
    this.logger.log(`Processing scrape job: ${job.data.name || job.data.url}`);
    const result = await this.scraping.scrapeSource(job.data);
    this.logger.log(`Scrape complete: found=${result.found} upserted=${result.upserted} errors=${result.errors.length}`);
    return result;
  }
}
