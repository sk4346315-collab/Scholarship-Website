import { PipeTransform, Injectable, BadRequestException } from '@nestjs/common'

/**
 * Parses "true" / "false" query param strings into booleans.
 * Returns undefined if the value is not provided.
 *
 * @example
 * @Query('ieltsRequired', ParseBoolOptionalPipe) ieltsRequired?: boolean
 */
@Injectable()
export class ParseBoolOptionalPipe implements PipeTransform<string, boolean | undefined> {
  transform(value: string): boolean | undefined {
    if (value === undefined || value === null || value === '') return undefined
    if (value === 'true')  return true
    if (value === 'false') return false
    throw new BadRequestException(`Expected 'true' or 'false', got '${value}'`)
  }
}
