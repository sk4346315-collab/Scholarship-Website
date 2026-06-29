/**
 * NEXUS SCHOLAR — Manual scrape runner
 * Usage: npm run scrape:run
 * Triggers an immediate scrape of all registered sources.
 */
import { NestFactory } from '@nestjs/core';
import { AppModule } from '../../app.module';
import { ScrapingService, SOURCE_REGISTRY } from './scraping.service';
import { Logger } from '@nestjs/common';

async function runScrape() {
  const logger = new Logger('ScrapeRunner');
  logger.log('⚡ Manual scrape started...');

  const app = await NestFactory.createApplicationContext(AppModule, {
    logger: ['log', 'warn', 'error'],
  });

  const scraping = app.get(ScrapingService);

  let totalFound = 0;
  let totalUpserted = 0;

  for (const source of SOURCE_REGISTRY) {
    logger.log(`Scraping: ${source.name} (${source.url})`);
    try {
      const result = await scraping.scrapeSource(source);
      totalFound += result.found;
      totalUpserted += result.upserted;
      logger.log(`  ✓ Found: ${result.found}  Upserted: ${result.upserted}  Changed: ${result.changed}`);
      if (result.errors.length) {
        result.errors.forEach(e => logger.warn(`  ⚠ ${e}`));
      }
      // Polite delay between sources
      await new Promise(r => setTimeout(r, 3000));
    } catch (e: any) {
      logger.error(`  ✗ Failed: ${e.message}`);
    }
  }

  logger.log(`\n✅ Scrape complete — Total found: ${totalFound}  Total upserted: ${totalUpserted}`);
  await app.close();
  process.exit(0);
}

runScrape().catch(e => {
  console.error('Fatal scrape error:', e);
  process.exit(1);
});
