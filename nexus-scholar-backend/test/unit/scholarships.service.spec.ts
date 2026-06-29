import { Test, TestingModule } from '@nestjs/testing'
import { ScholarshipsService } from '../../src/modules/scholarships/scholarships.service'
import { PrismaService } from '../../src/database/prisma.service'
import { AiService } from '../../src/modules/ai/ai.service'
import { ConfigService } from '@nestjs/config'

describe('ScholarshipsService', () => {
  let service: ScholarshipsService

  const mockPrisma = {
    scholarship: {
      count: jest.fn().mockResolvedValue(0),
      findMany: jest.fn().mockResolvedValue([]),
      findUnique: jest.fn().mockResolvedValue(null),
      update: jest.fn().mockResolvedValue({}),
    },
  }

  const mockAi = {
    extractScholarshipData: jest.fn().mockResolvedValue([]),
  }

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ScholarshipsService,
        { provide: PrismaService, useValue: mockPrisma },
        { provide: AiService, useValue: mockAi },
      ],
    }).compile()

    service = module.get<ScholarshipsService>(ScholarshipsService)
  })

  it('should be defined', () => {
    expect(service).toBeDefined()
  })

  it('calculateSuitabilityScore — IELTS-free scholarship scores higher', () => {
    const ieltsRequired = { requiresIelts: true,  requiresToefl: false, acceptsMoi: false, acceptsEnglishCert: false, acceptsIeltsWaiver: false, tier: 'ALPHA', csRelevanceScore: 14, dataConfidenceScore: 90, eligibleNationalities: ['PK'], coversStipend: true, coversTuition: true, coversAirfare: false, coversAccommodation: false, coversHealthInsurance: false, tuitionCoveragePct: 100 } as any
    const ieltsNotRequired = { ...ieltsRequired, requiresIelts: false }
    const scoreWith    = service.calculateSuitabilityScore(ieltsRequired)
    const scoreWithout = service.calculateSuitabilityScore(ieltsNotRequired)
    expect(scoreWithout).toBeGreaterThan(scoreWith)
  })

  it('findAll — returns paginated structure', async () => {
    const result = await service.findAll({}, 1, 20)
    expect(result).toHaveProperty('items')
    expect(result).toHaveProperty('total')
    expect(result).toHaveProperty('page')
    expect(result).toHaveProperty('pages')
  })
})
