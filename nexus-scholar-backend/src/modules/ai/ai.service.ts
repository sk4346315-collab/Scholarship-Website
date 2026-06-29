import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Anthropic from '@anthropic-ai/sdk';

export interface ScholarshipExtraction {
  name: string;
  slug?: string;
  hostCountry?: string;
  hostCountryCode?: string;
  hostUniversity?: string;
  degreeLevel?: string[];
  fieldsOfStudy?: string[];
  fundingType?: string;
  coversTuition?: boolean;
  coversStipend?: boolean;
  coversAccommodation?: boolean;
  coversAirfare?: boolean;
  monthlyStipendAmount?: number;
  monthlyStipendCurrency?: string;
  requiresIelts?: boolean;
  requiresToefl?: boolean;
  acceptsMoi?: boolean;
  acceptsEnglishCert?: boolean;
  ieltsMinScore?: number;
  eligibleNationalities?: string[];
  applicationDeadline?: string;
  applicationOpenDate?: string;
  officialSourceUrl?: string;
  applicationUrl?: string;
  dataConfidenceScore?: number;
  csRelevant?: boolean;
  csRelevanceScore?: number;
  tier?: string;
}

export interface ConsultantMessage {
  role: 'user' | 'assistant';
  content: string;
}

const EXTRACTION_SYSTEM = `You are a scholarship data extraction AI for NEXUS SCHOLAR.
Extract ONLY verified scholarship data from the provided HTML. Do NOT invent or infer details.
Return a JSON array of scholarships found. If none found, return [].

Required fields: name, hostCountry, officialSourceUrl
Important fields: applicationDeadline (ISO 8601), requiresIelts (boolean), acceptsMoi (boolean),
  fundingType ("FULLY_FUNDED"|"TUITION_STIPEND"|"TUITION_ONLY"|"PARTIAL"|"UNKNOWN"),
  monthlyStipendAmount (number), monthlyStipendCurrency, degreeLevel (["bachelor"]),
  fieldsOfStudy (["cs","ai","cybersecurity","software_engineering"]),
  eligibleNationalities (["PK","OPEN",...])
  dataConfidenceScore: 0-100 (how confident you are in the extracted data)

Return ONLY valid JSON array. No preamble, no explanation.`;

const CONSULTANT_SYSTEM = `You are NEXUS SCHOLAR — elite AI scholarship advisor.

STUDENT PROFILE — PRE-LOADED:
• Sayyad | Pakistani | 18yo | ICS Stream
• Target: Bachelor's in CS / AI / Cybersecurity
• CRITICAL: IELTS-FREE — MOI letter + English Proficiency Certificate available
• Extracurriculars: FL Studio producer (trap/amapiano, 2yr), JUCE/C++ VST developer ("Khpal Awaaz")
• Europass CV: assessed application-ready
• Priority: Fully-funded + stipend, NO IELTS, English instruction

Rules:
- Specific and actionable. Name real programs + official URLs.
- If unsure about a current deadline/amount, say to verify at [official URL].
- IELTS-free constraint is NON-NEGOTIABLE.
- Use web search for current deadline/requirements questions.
- Keep responses focused, practical, formatted clearly.`;

@Injectable()
export class AiService {
  private readonly logger = new Logger(AiService.name);
  private client: Anthropic;

  constructor(private config: ConfigService) {
    this.client = new Anthropic({ apiKey: config.get('ANTHROPIC_API_KEY') });
  }

  // ── Extract scholarship data from scraped HTML ────────────────────────────

  async extractScholarshipData(
    html: string,
    sourceUrl: string,
  ): Promise<ScholarshipExtraction[]> {
    try {
      // Truncate HTML to avoid token limits; take first 15K chars
      const truncated = html.replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
                            .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
                            .replace(/<[^>]+>/g, ' ')
                            .replace(/\s+/g, ' ')
                            .trim()
                            .slice(0, 15000);

      const response = await this.client.messages.create({
        model: 'claude-sonnet-4-6',
        max_tokens: 2000,
        system: EXTRACTION_SYSTEM,
        messages: [{
          role: 'user',
          content: `Extract all scholarship data from this page content.\nSource URL: ${sourceUrl}\n\nContent:\n${truncated}`,
        }],
      });

      const text = response.content
        .filter((b): b is Anthropic.TextBlock => b.type === 'text')
        .map(b => b.text)
        .join('');

      const jsonMatch = text.match(/\[[\s\S]*\]/);
      if (!jsonMatch) return [];

      const parsed = JSON.parse(jsonMatch[0]);
      return Array.isArray(parsed) ? parsed : [];
    } catch (e: any) {
      this.logger.error(`AI extraction failed: ${e.message}`);
      return [];
    }
  }

  // ── AI Consultant chat (streaming) ────────────────────────────────────────

  async chat(
    messages: ConsultantMessage[],
    useWebSearch = true,
  ): Promise<string> {
    const tools: Anthropic.Tool[] = useWebSearch
      ? [{ type: 'web_search_20250305', name: 'web_search' }]
      : [];

    const response = await this.client.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 1024,
      system: CONSULTANT_SYSTEM,
      ...(tools.length ? { tools } : {}),
      messages,
    });

    return response.content
      .filter((b): b is Anthropic.TextBlock => b.type === 'text')
      .map(b => b.text)
      .join('');
  }

  // ── Verify a scholarship via AI (spot-check) ──────────────────────────────

  async verifyScholarship(scholarshipName: string, officialUrl: string): Promise<{
    verified: boolean;
    confidence: number;
    notes: string;
  }> {
    try {
      const response = await this.client.messages.create({
        model: 'claude-sonnet-4-6',
        max_tokens: 500,
        tools: [{ type: 'web_search_20250305', name: 'web_search' }],
        messages: [{
          role: 'user',
          content: `Verify that "${scholarshipName}" is currently active and accepting applications for the upcoming cycle. Check ${officialUrl}. Return JSON: {"verified":bool,"confidence":0-100,"deadline":"ISO or null","notes":"brief summary","ieltsRequired":bool,"acceptsMoi":bool}`,
        }],
      });

      const text = response.content.filter((b): b is Anthropic.TextBlock => b.type === 'text').map(b => b.text).join('');
      const match = text.match(/\{[\s\S]*\}/);
      if (match) return JSON.parse(match[0]);

      return { verified: false, confidence: 0, notes: 'Verification failed: no structured response' };
    } catch (e: any) {
      return { verified: false, confidence: 0, notes: `Error: ${e.message}` };
    }
  }

  // ── Generate application timeline for a student ───────────────────────────

  async generateTimeline(scholarships: { name: string; deadline: string }[]): Promise<string> {
    const response = await this.client.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 800,
      system: CONSULTANT_SYSTEM,
      messages: [{
        role: 'user',
        content: `Create a month-by-month application timeline for Sayyad based on these scholarships and their deadlines: ${JSON.stringify(scholarships)}. Today is ${new Date().toDateString()}. Include document prep milestones, application windows, and follow-up dates. Format clearly.`,
      }],
    });

    return response.content.filter((b): b is Anthropic.TextBlock => b.type === 'text').map(b => b.text).join('');
  }
}
