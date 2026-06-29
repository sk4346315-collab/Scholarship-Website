import {
  IsOptional, IsBoolean, IsString, IsInt,
  Min, Max, IsArray, IsIn,
} from 'class-validator'
import { Transform, Type } from 'class-transformer'
import { ApiPropertyOptional } from '@nestjs/swagger'
import { PaginationDto } from '../../../common/dto/pagination.dto'

export class FilterScholarshipsDto extends PaginationDto {
  @ApiPropertyOptional({ description: 'Filter to IELTS-free scholarships only' })
  @IsOptional()
  @Transform(({ value }) => value === 'true' ? true : value === 'false' ? false : undefined)
  @IsBoolean()
  ieltsRequired?: boolean

  @ApiPropertyOptional({ description: 'Only show scholarships that accept MOI letter' })
  @IsOptional()
  @Transform(({ value }) => value === 'true')
  @IsBoolean()
  acceptsMoi?: boolean

  @ApiPropertyOptional({ description: 'Comma-separated country codes e.g. TR,CN,HU' })
  @IsOptional()
  @Transform(({ value }) => value?.split(',').filter(Boolean))
  @IsArray()
  @IsString({ each: true })
  countries?: string[]

  @ApiPropertyOptional({ description: 'Comma-separated tiers e.g. ALPHA,BETA' })
  @IsOptional()
  @Transform(({ value }) => value?.split(',').filter(Boolean))
  @IsArray()
  @IsIn(['ALPHA','BETA','GAMMA'], { each: true })
  tiers?: string[]

  @ApiPropertyOptional({ description: 'Comma-separated fields e.g. cs,ai,cybersecurity' })
  @IsOptional()
  @Transform(({ value }) => value?.split(',').filter(Boolean))
  @IsArray()
  @IsString({ each: true })
  fields?: string[]

  @ApiPropertyOptional({ description: 'Minimum suitability score (0–100)' })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  @Max(100)
  minScore?: number

  @ApiPropertyOptional({ description: 'Minimum data confidence score (0–100)' })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  @Max(100)
  minConfidence?: number
}
