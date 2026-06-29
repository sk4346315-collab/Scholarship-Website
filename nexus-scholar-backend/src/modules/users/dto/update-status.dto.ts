import { IsString, IsIn } from 'class-validator'
import { ApiProperty } from '@nestjs/swagger'

const VALID_STATUSES = [
  'INTERESTED', 'PLANNING', 'PREPARING_DOCUMENTS',
  'SUBMITTED',  'INTERVIEW', 'ACCEPTED',
  'REJECTED',   'WAITLISTED', 'WITHDRAWN',
]

export class UpdateStatusDto {
  @ApiProperty({ enum: VALID_STATUSES })
  @IsString()
  @IsIn(VALID_STATUSES, { message: `Status must be one of: ${VALID_STATUSES.join(', ')}` })
  status: string
}
