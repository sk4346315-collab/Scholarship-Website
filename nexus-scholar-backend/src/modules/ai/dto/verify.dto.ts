import { IsString, IsNotEmpty, IsUrl } from 'class-validator'
import { ApiProperty } from '@nestjs/swagger'

export class VerifyDto {
  @ApiProperty({ example: 'Türkiye Bursları' })
  @IsString()
  @IsNotEmpty()
  name: string

  @ApiProperty({ example: 'https://www.turkiyeburslari.gov.tr' })
  @IsUrl()
  officialUrl: string
}
