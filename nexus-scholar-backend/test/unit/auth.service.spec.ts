import { Test, TestingModule } from '@nestjs/testing'
import { AuthService } from '../../src/modules/auth/auth.service'
import { JwtService } from '@nestjs/jwt'
import { ConfigService } from '@nestjs/config'
import { PrismaService } from '../../src/database/prisma.service'
import { UnauthorizedException, BadRequestException } from '@nestjs/common'

describe('AuthService', () => {
  let service: AuthService

  const mockPrisma = {
    user: {
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
    },
  }

  const mockJwt = {
    signAsync: jest.fn().mockResolvedValue('mock.jwt.token'),
    verify: jest.fn(),
  }

  const mockConfig = {
    get: jest.fn((key: string) => {
      if (key === 'JWT_SECRET') return 'test-secret'
      if (key === 'JWT_ACCESS_EXPIRY') return '15m'
      if (key === 'JWT_REFRESH_EXPIRY') return '7d'
      return null
    }),
  }

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: PrismaService, useValue: mockPrisma },
        { provide: JwtService,    useValue: mockJwt },
        { provide: ConfigService, useValue: mockConfig },
      ],
    }).compile()

    service = module.get<AuthService>(AuthService)
  })

  afterEach(() => jest.clearAllMocks())

  it('should be defined', () => {
    expect(service).toBeDefined()
  })

  it('login — throws UnauthorizedException for unknown email', async () => {
    mockPrisma.user.findUnique.mockResolvedValue(null)
    await expect(service.login('unknown@test.com', 'password'))
      .rejects.toThrow(UnauthorizedException)
  })

  it('register — throws BadRequestException for duplicate email', async () => {
    mockPrisma.user.findUnique.mockResolvedValue({ id: '1', email: 'existing@test.com' })
    await expect(service.register('existing@test.com', 'password123'))
      .rejects.toThrow(BadRequestException)
  })
})
