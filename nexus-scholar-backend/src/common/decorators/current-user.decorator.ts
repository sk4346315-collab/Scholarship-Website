import { createParamDecorator, ExecutionContext } from '@nestjs/common'

/**
 * Extracts the authenticated user from the JWT payload.
 *
 * @example
 * async getProfile(@CurrentUser() user: JwtPayload) { ... }
 */
export const CurrentUser = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest()
    return request.user
  },
)

export interface JwtPayload {
  sub:   string   // userId
  email: string
  iat?:  number
  exp?:  number
}
