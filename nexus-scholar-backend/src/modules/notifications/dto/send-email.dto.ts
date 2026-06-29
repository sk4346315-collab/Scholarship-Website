import { IsEmail, IsString, IsInt, IsUrl, Min, Max } from 'class-validator'

export class DeadlineEmailDto {
  @IsEmail()
  to: string

  @IsString()
  studentName: string

  @IsString()
  scholarshipName: string

  @IsInt() @Min(1) @Max(365)
  days: number

  @IsUrl()
  url: string

  @IsInt() @Min(0) @Max(100)
  docsComplete: number
}
