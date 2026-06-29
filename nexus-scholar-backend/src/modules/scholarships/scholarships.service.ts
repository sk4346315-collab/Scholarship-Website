import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { AiService } from '../ai/ai.service';
import { Scholarship, Prisma } from '@prisma/client';

export interface ScholarshipFilter {
  ieltsRequired?: boolean;
  acceptsMoi?: boolean;
  acceptsEnglishCert?: boolean;
  fundingTypes?: string[];
  countries?: string[];
  fields?: string[];
  tiers?: string[];
  degreeLevel?: string[];
  minSuitabilityScore?: number;
  minConfidenceScore?: number;
  deadlineAfter?: Date;
  deadlineBefore?: Date;
}

const DEFAULT_PROFILE = {
  nationality: 'PK',
  degreeTarget: 'bachelor',
  hasIelts: false,
  hasMoi: true,
  hasEnglishCert: true,
  preferredFields: ['cs', 'ai', 'cybersecurity', 'software_engineering'],
  preferredCountries: ['TR', 'CN', 'HU', 'KR', 'JP', 'DE', 'MY', 'PL', 'SA', 'AE', 'QA'],
};

@Injectable()
export class ScholarshipsService {
  private readonly logger = new Logger(ScholarshipsService.name);

  constructor(
    private prisma: PrismaService,
    private ai: AiService,
  ) {}

  async findAll(filters: ScholarshipFilter = {}, page = 1, limit = 20) {
    const where: Prisma.ScholarshipWhereInput = {
      isPublished: true,
      status: 'ACTIVE',
    };

    if (filters.ieltsRequired === false) where.requiresIelts = false;
    if (filters.acceptsMoi) where.acceptsMoi = true;
    if (filters.countries?.length) where.hostCountryCode = { in: filters.countries };
    if (filters.tiers?.length) where.tier = { in: filters.tiers };
    if (filters.minSuitabilityScore) where.suitabilityScore = { gte: filters.minSuitabilityScore };
    if (filters.minConfidenceScore) where.dataConfidenceScore = { gte: filters.minConfidenceScore };
    if (filters.deadlineAfter || filters.deadlineBefore) {
      where.applicationDeadline = {
        ...(filters.deadlineAfter && { gte: filters.deadlineAfter }),
        ...(filters.deadlineBefore && { lte: filters.deadlineBefore }),
      };
    }
    if (filters.fundingTypes?.length) {
      where.fundingType = { in: filters.fundingTypes as any };
    }
    if (filters.fields?.length) {
      where.fieldsOfStudy = { hasSome: filters.fields };
    }

    const [total, items] = await Promise.all([
      this.prisma.scholarship.count({ where }),
      this.prisma.scholarship.findMany({
        where,
        orderBy: [{ suitabilityScore: 'desc' }, { dataConfidenceScore: 'desc' }],
        skip: (page - 1) * limit,
        take: limit,
      }),
    ]);

    return { items, total, page, pages: Math.ceil(total / limit), limit };
  }

  async findById(id: string) {
    const s = await this.prisma.scholarship.findUnique({ where: { id } });
    if (!s) throw new NotFoundException(`Scholarship ${id} not found`);
    return s;
  }

  async findBySlug(slug: string) {
    const s = await this.prisma.scholarship.findUnique({ where: { slug } });
    if (!s) throw new NotFoundException(`Scholarship "${slug}" not found`);
    return s;
  }

  calculateSuitabilityScore(scholarship: Scholarship, profile = DEFAULT_PROFILE): number {
    let score = 0;

    // Funding coverage (25 pts)
    if (scholarship.coversStipend && scholarship.coversTuition) score += 25;
    else if (scholarship.coversTuition) score += 15;
    else score += ((scholarship.tuitionCoveragePct || 0) / 100) * 8;

    // Tier (20 pts)
    const tierBoost: Record<string, number> = { ALPHA: 20, BETA: 12, GAMMA: 5 };
    score += tierBoost[scholarship.tier] || 0;

    // Language fit (20 pts) — MOST CRITICAL for IELTS-free students
    if (!scholarship.requiresIelts && !scholarship.requiresToefl) score += 20;
    else if (scholarship.acceptsMoi || scholarship.acceptsEnglishCert || scholarship.acceptsIeltsWaiver) score += 14;
    else if (scholarship.requiresIelts) score -= 10;

    // CS relevance (15 pts)
    score += Math.min(15, scholarship.csRelevanceScore);

    // Data confidence (10 pts)
    score += Math.min(10, scholarship.dataConfidenceScore / 10);

    // Nationality (10 pts)
    if (
      scholarship.eligibleNationalities.includes('OPEN') ||
      scholarship.eligibleNationalities.includes(profile.nationality)
    ) score += 10;

    return Math.min(100, Math.max(0, Math.round(score)));
  }

  async recalculateSuitabilityScores() {
    const all = await this.prisma.scholarship.findMany({ where: { isPublished: true } });
    let updated = 0;
    for (const s of all) {
      const score = this.calculateSuitabilityScore(s);
      await this.prisma.scholarship.update({ where: { id: s.id }, data: { suitabilityScore: score } });
      updated++;
    }
    this.logger.log(`Recalculated suitability for ${updated} scholarships`);
    return updated;
  }

  async getDeadlinesCalendar(daysAhead = 180) {
    return this.prisma.scholarship.findMany({
      where: {
        isPublished: true,
        status: 'ACTIVE',
        applicationDeadline: {
          gte: new Date(),
          lte: new Date(Date.now() + daysAhead * 86400000),
        },
      },
      select: {
        id: true, name: true, slug: true, hostCountryCode: true,
        applicationDeadline: true, tier: true, suitabilityScore: true,
        requiresIelts: true, fundingType: true,
      },
      orderBy: { applicationDeadline: 'asc' },
    });
  }
}
