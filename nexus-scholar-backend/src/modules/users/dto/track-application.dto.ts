import { IsString, IsNotEmpty } from 'class-validator'
import { ApiProperty } from '@nestjs/swagger'

export class TrackApplicationDto {
  @ApiProperty({ description: 'Backend scholarship ID (cuid)' })
  @IsString()
  @IsNotEmpty()
  scholarshipId: string
}
