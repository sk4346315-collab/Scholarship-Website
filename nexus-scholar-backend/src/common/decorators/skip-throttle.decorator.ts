import { SetMetadata } from '@nestjs/common'

export const SKIP_THROTTLE_KEY = 'skipThrottle'

/**
 * Bypass rate limiting for internal or health-check routes.
 *
 * @example
 * @SkipThrottle()
 * @Get('health')
 * health() { ... }
 */
export const SkipThrottle = () => SetMetadata(SKIP_THROTTLE_KEY, true)
