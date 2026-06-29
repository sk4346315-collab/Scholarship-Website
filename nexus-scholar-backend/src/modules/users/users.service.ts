import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { AiService } from '../ai/ai.service';

export interface UpdateProfileDto {
  fullName?: string;
  nationality?: string;
  currentCountry?: string;
  highestEducation?: string;
  currentGpa?: number;
  gpaScale?: number;
  graduationYear?: number;
  hasIelts?: boolean;
  ieltsScore?: number;
  hasMoi?: boolean;
  hasEnglishCert?: boolean;
  preferredCountries?: string[];
  preferredFields?: string[];
  fundingPreference?: string;
  timezone?: string;
  language?: string;
}

export interface TrackApplicationDto {
  scholarshipId: string;
}

@Injectable()
export class UsersService {
  constructor(
    private prisma: PrismaService,
    private ai: AiService,
  ) {}

  async updateProfile(userId: string, dto: UpdateProfileDto) {
    return this.prisma.user.update({
      where: { id: userId },
      data: dto,
      select: {
        id: true, email: true, fullName: true, nationality: true,
        currentCountry: true, highestEducation: true, currentGpa: true,
        hasIelts: true, ieltsScore: true, hasMoi: true, hasEnglishCert: true,
        preferredCountries: true, preferredFields: true, fundingPreference: true,
      },
    });
  }

  // ── Application Tracker ────────────────────────────────────────────────────

  async getApplications(userId: string) {
    return this.prisma.userApplication.findMany({
      where: { userId },
      include: {
        scholarship: {
          select: {
            id: true, name: true, slug: true, hostCountryCode: true,
            applicationDeadline: true, tier: true, suitabilityScore: true,
            requiresIelts: true, fundingType: true, officialSourceUrl: true,
          },
        },
      },
      orderBy: { updatedAt: 'desc' },
    });
  }

  async trackApplication(userId: string, dto: TrackApplicationDto) {
    return this.prisma.userApplication.upsert({
      where: { userId_scholarshipId: { userId, scholarshipId: dto.scholarshipId } },
      create: { userId, scholarshipId: dto.scholarshipId, status: 'INTERESTED' },
      update: {},
    });
  }

  async updateApplicationStatus(userId: string, applicationId: string, status: string) {
    const app = await this.prisma.userApplication.findFirst({
      where: { id: applicationId, userId },
    });
    if (!app) throw new NotFoundException('Application not found');
    return this.prisma.userApplication.update({
      where: { id: applicationId },
      data: { status: status as any, statusUpdatedAt: new Date() },
    });
  }

  async updateDocumentChecklist(userId: string, applicationId: string, checklist: Record<string, boolean>) {
    const app = await this.prisma.userApplication.findFirst({
      where: { id: applicationId, userId },
    });
    if (!app) throw new NotFoundException('Application not found');

    const completed = Object.values(checklist).filter(Boolean).length;
    const total = Object.keys(checklist).length;
    const pct = total > 0 ? Math.round((completed / total) * 100) : 0;

    return this.prisma.userApplication.update({
      where: { id: applicationId },
      data: { docsChecklist: checklist, docsCompletePct: pct, updatedAt: new Date() },
    });
  }

  async removeApplication(userId: string, applicationId: string) {
    const app = await this.prisma.userApplication.findFirst({
      where: { id: applicationId, userId },
    });
    if (!app) throw new NotFoundException('Application not found');
    await this.prisma.userApplication.delete({ where: { id: applicationId } });
    return { deleted: true };
  }

  // ── AI-powered application timeline ───────────────────────────────────────

  async getAiTimeline(userId: string) {
    const apps = await this.getApplications(userId);
    const scholarships = apps
      .filter(a => a.scholarship?.applicationDeadline)
      .map(a => ({
        name: a.scholarship!.name,
        deadline: a.scholarship!.applicationDeadline!.toISOString().split('T')[0],
      }));

    if (scholarships.length === 0)
      return { timeline: 'No tracked scholarships with deadlines. Add scholarships to your tracker first.' };

    const timeline = await this.ai.generateTimeline(scholarships);
    return { timeline };
  }
}
