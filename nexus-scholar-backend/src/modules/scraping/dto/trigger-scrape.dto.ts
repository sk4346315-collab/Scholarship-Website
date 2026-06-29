import { IsString, IsUrl } from 'class-validator'
import { ApiProperty } from '@nestjs/swagger'

export class TriggerScrapeDto {
  @ApiProperty({
    example: 'https://www.turkiyeburslari.gov.tr',
    description: 'Must be a URL registered in SOURCE_REGISTRY',
  })
  @IsString()
  @IsUrl()
  url: string
}
