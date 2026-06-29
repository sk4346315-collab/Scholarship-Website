import { IsArray, ValidateNested, IsString, IsNotEmpty } from 'class-validator'
import { Type } from 'class-transformer'
import { ApiProperty } from '@nestjs/swagger'

export class ScholarshipDeadlineDto {
  @ApiProperty({ example: 'Türkiye Bursları' })
  @IsString()
  @IsNotEmpty()
  name: string

  @ApiProperty({ example: '2026-02-20' })
  @IsString()
  @IsNotEmpty()
  deadline: string
}

export class TimelineDto {
  @ApiProperty({ type: [ScholarshipDeadlineDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ScholarshipDeadlineDto)
  scholarships: ScholarshipDeadlineDto[]
}
