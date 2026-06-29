import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../database/prisma.service';
import * as nodemailer from 'nodemailer';

@Injectable()
export class NotificationsService {
  private readonly logger = new Logger(NotificationsService.name);
  private transporter: nodemailer.Transporter;

  constructor(private prisma: PrismaService, private config: ConfigService) {
    this.transporter = nodemailer.createTransport({
      host: config.get('SMTP_HOST', 'smtp.gmail.com'),
      port: config.get<number>('SMTP_PORT', 587),
      secure: false,
      auth: {
        user: config.get('SMTP_USER'),
        pass: config.get('SMTP_PASS'),
      },
    });
  }

  // ── Daily 8 AM: deadline reminders ────────────────────────────────────────

  @Cron('0 8 * * *')
  async sendDeadlineReminders() {
    this.logger.log('📬 Running daily deadline reminder job');
    const upcoming = await this.getUpcomingDeadlineApps(30);

    for (const app of upcoming) {
      if (!app.user?.email) continue;
      const days = this.daysUntil(app.scholarship?.applicationDeadline);
      if (days === null) continue;

      // Only alert at 30, 14, 7, 3, 1 days out
      if (![30, 14, 7, 3, 1].includes(days)) continue;

      await this.sendDeadlineEmail({
        to: app.user.email,
        studentName: app.user.fullName || 'Scholar',
        scholarshipName: app.scholarship?.name || '',
        days,
        url: app.scholarship?.officialSourceUrl || '#',
        docsComplete: app.docsCompletePct || 0,
      });
    }
  }

  private async getUpcomingDeadlineApps(maxDays: number) {
    const cutoff = new Date(Date.now() + maxDays * 86400000);
    return this.prisma.userApplication.findMany({
      where: {
        status: { notIn: ['SUBMITTED', 'ACCEPTED', 'REJECTED', 'WITHDRAWN'] },
        scholarship: { applicationDeadline: { gte: new Date(), lte: cutoff } },
      },
      include: {
        user: { select: { email: true, fullName: true } },
        scholarship: {
          select: { name: true, applicationDeadline: true, officialSourceUrl: true },
        },
      },
    });
  }

  async sendDeadlineEmail(params: {
    to: string;
    studentName: string;
    scholarshipName: string;
    days: number;
    url: string;
    docsComplete: number;
  }) {
    const { to, studentName, scholarshipName, days, url, docsComplete } = params;
    const urgency = days <= 3 ? '🚨 URGENT' : days <= 7 ? '⏰ REMINDER' : '📅 UPCOMING';

    const html = `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><title>NEXUS SCHOLAR Deadline Alert</title></head>
<body style="background:#080E1A;color:#E2E8F0;font-family:system-ui,sans-serif;margin:0;padding:32px">
  <div style="max-width:540px;margin:0 auto;background:#0F1929;border:1px solid #1E3352;border-radius:16px;padding:32px">
    <div style="font-size:12px;letter-spacing:3px;color:#06B6D4;margin-bottom:24px">⚡ NEXUS SCHOLAR ALERT</div>
    <h1 style="color:#E2E8F0;font-size:20px;margin:0 0 8px">${urgency} — ${days} Day${days===1?'':'s'} Left</h1>
    <p style="color:#94A3B8;font-size:14px;margin:0 0 24px">Hi ${studentName}, your deadline is approaching.</p>
    <div style="background:#080E1A;border:1px solid #1E3352;border-radius:10px;padding:18px;margin-bottom:20px">
      <div style="font-size:12px;color:#64748B;letter-spacing:1.5px;margin-bottom:6px">SCHOLARSHIP</div>
      <div style="font-size:16px;font-weight:800;color:#E2E8F0">${scholarshipName}</div>
    </div>
    <div style="background:#071A0F;border:1px solid #065F46;border-radius:10px;padding:14px;margin-bottom:20px">
      <div style="font-size:11px;color:#34D399;margin-bottom:6px">DOCUMENT PROGRESS</div>
      <div style="height:6px;background:#1E3352;border-radius:3px">
        <div style="width:${docsComplete}%;height:100%;background:#10B981;border-radius:3px"></div>
      </div>
      <div style="font-size:12px;color:#94A3B8;margin-top:6px">${docsComplete}% of documents checked</div>
    </div>
    <a href="${url}" style="display:block;background:#2563EB;color:white;text-align:center;padding:14px;border-radius:10px;text-decoration:none;font-weight:700;font-size:14px">
      Go to Official Application →
    </a>
    <p style="color:#475569;font-size:11px;text-align:center;margin-top:20px">
      NEXUS SCHOLAR · Unsubscribe from your profile settings
    </p>
  </div>
</body>
</html>`;

    try {
      await this.transporter.sendMail({
        from: this.config.get('EMAIL_FROM', 'NEXUS SCHOLAR <noreply@nexusscholar.com>'),
        to,
        subject: `${urgency}: ${scholarshipName} deadline in ${days} day${days===1?'':'s'}`,
        html,
      });
      this.logger.log(`Deadline email sent to ${to} (${scholarshipName}, ${days}d)`);
    } catch (e: any) {
      this.logger.error(`Email send failed: ${e.message}`);
    }
  }

  private daysUntil(date: Date | null | undefined): number | null {
    if (!date) return null;
    return Math.ceil((new Date(date).getTime() - Date.now()) / 86400000);
  }
}
