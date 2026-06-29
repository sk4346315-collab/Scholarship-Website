import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { PrismaService } from './database/prisma.service';

@ApiTags('Health')
@Controller()
export class HealthController {
  constructor(private prisma: PrismaService) {}

  @Get('health')
  @ApiOperation({ summary: 'Health check endpoint (used by Railway/Render/load balancers)' })
  async health() {
    let db = 'ok';
    try {
      await this.prisma.$queryRaw`SELECT 1`;
    } catch {
      db = 'error';
    }
    return {
      status: 'ok',
      db,
      ts: new Date().toISOString(),
      version: '2.0.0',
    };
  }

  @Get()
  @ApiOperation({ summary: 'Root — API info' })
  root() {
    return {
      name: 'NEXUS SCHOLAR API',
      version: '2.0.0',
      docs: '/api/docs',
      health: '/health',
    };
  }
}
