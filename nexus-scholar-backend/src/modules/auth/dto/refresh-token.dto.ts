import { IsString, IsNotEmpty } from 'class-validator'
import { ApiProperty } from '@nestjs/swagger'

export class RefreshTokenDto {
  @ApiProperty({ description: 'Valid refresh token from login response' })
  @IsString()
  @IsNotEmpty()
  refreshToken: string
}
