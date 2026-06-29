import {
  IsOptional, IsString, IsBoolean, IsNumber,
  IsArray, Min, Max, IsInt, MaxLength,
} from 'class-validator'
import { Type } from 'class-transformer'
import { ApiPropertyOptional } from '@nestjs/swagger'

export class UpdateProfileDto {
  @ApiPropertyOptional({ example: 'Sayyad Khan' })
  @IsOptional() @IsString() @MaxLength(100)
  fullName?: string

  @ApiPropertyOptional({ example: 'PK', description: 'ISO 3166-1 alpha-2' })
  @IsOptional() @IsString() @MaxLength(2)
  nationality?: string

  @ApiPropertyOptional({ example: 'PK' })
  @IsOptional() @IsString() @MaxLength(2)
  currentCountry?: string

  @ApiPropertyOptional({ example: 'high_school' })
  @IsOptional() @IsString()
  highestEducation?: string

  @ApiPropertyOptional({ example: 3.8 })
  @IsOptional() @Type(() => Number) @IsNumber() @Min(0) @Max(5)
  currentGpa?: number

  @ApiPropertyOptional({ example: 4.0 })
  @IsOptional() @Type(() => Number) @IsNumber()
  gpaScale?: number

  @ApiPropertyOptional({ example: 2025 })
  @IsOptional() @Type(() => Number) @IsInt()
  graduationYear?: number

  @ApiPropertyOptional()
  @IsOptional() @IsBoolean()
  hasIelts?: boolean

  @ApiPropertyOptional({ example: 7.5 })
  @IsOptional() @Type(() => Number) @IsNumber() @Min(0) @Max(9)
  ieltsScore?: number

  @ApiPropertyOptional({ description: 'Has Medium of Instruction letter' })
  @IsOptional() @IsBoolean()
  hasMoi?: boolean

  @ApiPropertyOptional()
  @IsOptional() @IsBoolean()
  hasEnglishCert?: boolean

  @ApiPropertyOptional({ example: ['TR','CN','HU'] })
  @IsOptional() @IsArray() @IsString({ each: true })
  preferredCountries?: string[]

  @ApiPropertyOptional({ example: ['cs','ai','cybersecurity'] })
  @IsOptional() @IsArray() @IsString({ each: true })
  preferredFields?: string[]

  @ApiPropertyOptional({ example: 'FULLY_FUNDED' })
  @IsOptional() @IsString()
  fundingPreference?: string

  @ApiPropertyOptional({ example: 'Asia/Karachi' })
  @IsOptional() @IsString()
  timezone?: string
}
