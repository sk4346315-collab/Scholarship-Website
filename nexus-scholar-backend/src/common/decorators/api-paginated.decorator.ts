import { applyDecorators, Type } from '@nestjs/common'
import { ApiOkResponse, getSchemaPath } from '@nestjs/swagger'

/**
 * Swagger decorator for paginated responses.
 *
 * @example
 * @ApiPaginated(ScholarshipResponseDto)
 * @Get()
 * findAll() { ... }
 */
export function ApiPaginated<T extends Type<unknown>>(model: T) {
  return applyDecorators(
    ApiOkResponse({
      schema: {
        properties: {
          items:  { type: 'array', items: { $ref: getSchemaPath(model) } },
          total:  { type: 'number' },
          page:   { type: 'number' },
          pages:  { type: 'number' },
          limit:  { type: 'number' },
        },
      },
    }),
  )
}
