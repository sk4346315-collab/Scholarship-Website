import {
  Injectable, NestInterceptor, ExecutionContext,
  CallHandler, Logger,
} from '@nestjs/common'
import { Observable } from 'rxjs'
import { tap } from 'rxjs/operators'

/**
 * Logs every incoming request with method, path, status and response time.
 * Register globally in main.ts or per-controller with @UseInterceptors().
 */
@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  private readonly logger = new Logger('HTTP')

  intercept(ctx: ExecutionContext, next: CallHandler): Observable<unknown> {
    const req    = ctx.switchToHttp().getRequest()
    const method = req.method
    const url    = req.url
    const start  = Date.now()

    return next.handle().pipe(
      tap({
        next: () => {
          const ms  = Date.now() - start
          const res = ctx.switchToHttp().getResponse()
          this.logger.log(`${method} ${url} ${res.statusCode} — ${ms}ms`)
        },
        error: (err) => {
          const ms = Date.now() - start
          this.logger.warn(`${method} ${url} ${err.status || 500} — ${ms}ms`)
        },
      }),
    )
  }
}
