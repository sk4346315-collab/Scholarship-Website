import { IsEmail, IsString, MinLength, MaxLength, IsOptional } from 'class-validator'
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'

export class RegisterDto {
  @ApiProperty({ example: 'sayyad@example.com' })
  @IsEmail({}, { message: 'Please enter a valid email address' })
  email: string

  @ApiProperty({ example: 'SecurePass123!', minLength: 8 })
  @IsString()
  @MinLength(8,  { message: 'Password must be at least 8 characters' })
  @MaxLength(72, { message: 'Password must not exceed 72 characters' })
  password: string

  @ApiPropertyOptional({ example: 'Sayyad Khan' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  fullName?: string
}
