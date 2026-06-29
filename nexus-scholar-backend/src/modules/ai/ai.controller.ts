import { Controller, Post, Body, Get, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { AiService, ConsultantMessage } from './ai.service';
import { Throttle } from '@nestjs/throttler';

import { ChatDto }     from './dto/chat.dto'
import { VerifyDto }   from './dto/verify.dto'
import { TimelineDto } from './dto/timeline.dto'

@ApiTags('AI Consultant')
@Controller('api/ai')
export class AiController {
  constructor(private ai: AiService) {}

  @Post('chat')
  @Throttle({ default: { limit: 20, ttl: 60000 } })
  @ApiOperation({ summary: 'Chat with AI consultant (web-search enabled)' })
  async chat(@Body() dto: ChatDto) {
    const reply = await this.ai.chat(dto.messages, dto.useWebSearch ?? true);
    return { reply };
  }

  @Post('verify')
  @Throttle({ default: { limit: 10, ttl: 60000 } })
  @ApiOperation({ summary: 'Verify a scholarship is currently active' })
  async verify(@Body() dto: VerifyDto) {
    return this.ai.verifyScholarship(dto.name, dto.officialUrl);
  }

  @Post('timeline')
  @Throttle({ default: { limit: 5, ttl: 60000 } })
  @ApiOperation({ summary: 'Generate personalized application timeline' })
  async timeline(@Body() dto: TimelineDto) {
    const timeline = await this.ai.generateTimeline(dto.scholarships);
    return { timeline };
  }
}
