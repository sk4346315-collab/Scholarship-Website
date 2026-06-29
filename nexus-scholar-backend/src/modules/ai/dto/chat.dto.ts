import {
  IsArray, IsBoolean, IsIn, IsNotEmpty,
  IsOptional, IsString, ValidateNested,
} from 'class-validator'
import { Type } from 'class-transformer'
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'

export class ChatMessageDto {
  @ApiProperty({ enum: ['user','assistant'] })
  @IsIn(['user','assistant'])
  role: 'user' | 'assistant'

  @ApiProperty({ example: 'Am I eligible for Türkiye Bursları?' })
  @IsString()
  @IsNotEmpty()
  content: string
}

export class ChatDto {
  @ApiProperty({ type: [ChatMessageDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ChatMessageDto)
  messages: ChatMessageDto[]

  @ApiPropertyOptional({ default: true, description: 'Enable Claude web search' })
  @IsOptional()
  @IsBoolean()
  useWebSearch?: boolean = true
}
