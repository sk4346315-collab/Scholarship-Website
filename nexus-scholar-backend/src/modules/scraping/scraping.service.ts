import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { PrismaService } from '../../database/prisma.service';
import { AiService } from '../ai/ai.service';

// ── Priority source registry ───────────────────────────────────────────────

export const SOURCE_REGISTRY = [
  // TIER ALPHA — highest priority, scraped every 6h
  { url: 'https://www.turkiyeburslari.gov.tr', type: 'government', country: 'TR', priority: 10, name: 'Türkiye Bursları' },
  { url: 'https://www.csc.edu.cn/laihua', type: 'government', country: 'CN', priority: 10, name: 'China CSC' },
  { url: 'https://stipendiumhungaricum.hu', type: 'government', country: 'HU', priority: 10, name: 'Stipendium Hungaricum' },
  { url: 'https://www.studyinkorea.go.kr/en/sub/gks/allnew_gks_u.do', type: 'government', country: 'KR', priority: 10, name: 'KGSP Korea' },
  { url: 'https://www.mext.go.jp/en/policy/education/highered/', type: 'government', country: 'JP', priority: 9, name: 'MEXT Japan' },
  { url: 'https://www.daad.de/en/', type: 'organization', country: 'DE', priority: 9, name: 'DAAD Germany' },
  { url: 'https://biasiswa.mohe.gov.my/INTER/', type: 'government', country: 'MY', priority: 9, name: 'MIS Malaysia' },
  { url: 'https://nawa.gov.pl/en/programmes/students', type: 'government', country: 'PL', priority: 8, name: 'NAWA Poland' },
  // Aggregators
  { url: 'https://scholars4dev.com/category/scholarships-for-developing-countries/', type: 'aggregator', country: null, priority: 6, name: 'Scholars4Dev' },
  { url: 'https://afterschoolafrica.com/scholarships/', type: 'aggregator', country: null, priority: 5, name: 'AfterSchoolAfrica' },
];

@Injectable()
export class ScrapingService {
  private readonly logger = new Logger(ScrapingService.name);

  constructor(
    private prisma: PrismaService,
    private ai: AiService,
    @InjectQueue('scraping') private queue: Queue,
  ) {}

  // ── Every 6 hours: high-priority sources ──────────────────────────────────

  @Cron('0 */6 * * *')
  async scheduleHighPriority() {
    const sources = SOURCE_REGISTRY.filter(s => s.priority >= 9);
    this.logger.log(`Queueing ${sources.length} high-priority sources`);
    for (const src of sources) {
      await this.queue.add('scrape', src, {
        attempts: 3,
        backoff: { type: 'exponential', delay: 5000 },
        jobId: `hp-${src.country}-${Date.now()}`,
      });
    }
  }

  // ── Daily: all sources ────────────────────────────────────────────────────

  @Cron(CronExpression.EVERY_DAY_AT_2AM)
  async scheduleDailyAll() {
    this.logger.log(`Queueing all ${SOURCE_REGISTRY.length} sources for daily scrape`);
    for (const [i, src] of SOURCE_REGISTRY.entries()) {
      await this.queue.add('scrape', src, {
        attempts: 2,
        backoff: { type: 'fixed', delay: 10000 },
        delay: i * 8000,  // Stagger by 8s per source to avoid rate-limiting
        jobId: `daily-${src.country || 'agg'}-${Date.now()}-${i}`,
      });
    }
  }

  // ── Process a single source ────────────────────────────────────────────────

  async scrapeSource(src: typeof SOURCE_REGISTRY[0]): Promise<{
    found: number; upserted: number; changed: boolean; errors: string[];
  }> {
    const errors: string[] = [];
    let found = 0, upserted = 0;

    try {
      const startMs = Date.now();
      const html = await this.fetchHtml(src.url);
      const responseMs = Date.now() - startMs;

      // Hash content for change detection
      const hash = await this.hashContent(html);
      const existing = await this.prisma.scrapingSource.findUnique({ where: { url: src.url } });
      const lastHash = (existing?.scraperConfig as any)?.lastContentHash;

      if (lastHash === hash) {
        await this.prisma.scrapingSource.upsert({
          where: { url: src.url },
          create: { url: src.url, lastScrapedAt: new Date(), scraperConfig: { lastContentHash: hash } },
          update: { lastScrapedAt: new Date() },
        });
        this.logger.debug(`No change: ${src.name}`);
        return { found: 0, upserted: 0, changed: false, errors: [] };
      }

      // AI extraction
      const extracted = await this.ai.extractScholarshipData(html, src.url);
      found = extracted.length;
      this.logger.log(`${src.name}: extracted ${found} scholarships`);

      for (const data of extracted) {
        try {
          await this.upsertScholarship(data, src.url, hash);
          upserted++;
        } catch (e: any) {
          errors.push(e.message);
        }
      }

      await this.prisma.scrapingSource.upsert({
        where: { url: src.url },
        create: {
          url: src.url, domain: new URL(src.url).hostname,
          sourceType: src.type, countryCode: src.country,
          priority: src.priority, lastScrapedAt: new Date(),
          lastSuccessAt: new Date(), consecutiveFailures: 0,
          avgResponseMs: responseMs,
          scraperConfig: { lastContentHash: hash },
        },
        update: {
          lastScrapedAt: new Date(), lastSuccessAt: new Date(),
          consecutiveFailures: 0, avgResponseMs: responseMs,
          scraperConfig: { lastContentHash: hash },
        },
      });

      return { found, upserted, changed: true, errors };
    } catch (e: any) {
      this.logger.error(`Scrape failed: ${src.name} — ${e.message}`);
      await this.prisma.scrapingSource.upsert({
        where: { url: src.url },
        create: { url: src.url, consecutiveFailures: 1 },
        update: { consecutiveFailures: { increment: 1 } },
      });
      return { found: 0, upserted: 0, changed: false, errors: [e.message] };
    }
  }

  private async fetchHtml(url: string): Promise<string> {
    const res = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; NexusScholarBot/1.0)',
        'Accept': 'text/html,application/xhtml+xml',
        'Accept-Language': 'en-US,en;q=0.9',
      },
      signal: AbortSignal.timeout(30000),
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return res.text();
  }

  private async upsertScholarship(data: any, sourceUrl: string, hash: string) {
    if (!data.name) return;
    const slug = data.name.toLowerCase()
      .replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

    await this.prisma.scholarship.upsert({
      where: { slug },
      create: {
        name: data.name, slug,
        officialSourceUrl: data.officialSourceUrl || sourceUrl,
        isPublished: false,  // Requires human/AI review before publishing
        status: 'ACTIVE',
        sourceHash: hash,
        lastScrapedAt: new Date(),
        verificationStatus: 'PENDING',
        ...data,
      },
      update: {
        sourceHash: hash, lastScrapedAt: new Date(), updatedAt: new Date(),
        ...data,
      },
    });
  }

  private async hashContent(content: string): Promise<string> {
    const enc = new TextEncoder();
    const buf = await crypto.subtle.digest('SHA-256', enc.encode(content));
    return Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, '0')).join('');
  }

  async getScrapeStatus() {
    const sources = await this.prisma.scrapingSource.findMany({
      orderBy: { priority: 'desc' },
    });
    const queueStats = await this.queue.getJobCounts();
    return { sources, queueStats };
  }
}
