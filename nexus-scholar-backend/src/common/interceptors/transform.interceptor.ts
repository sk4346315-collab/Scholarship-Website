import {
  Injectable, NestInterceptor, ExecutionContext,
  CallHandler,
} from '@nestjs/common'
import { Observable } from 'rxjs'
import { map } from 'rxjs/operators'

export interface ResponseEnvelope<T> {
  success: boolean
  data:    T
  ts:      string
}

/**
 * Wraps every successful response in a consistent envelope:
 * { success: true, data: <original response>, ts: "<ISO timestamp>" }
 *
 * Only used when explicitly applied with @UseInterceptors(TransformInterceptor).
 * Not applied globally to avoid wrapping already-structured responses.
 */
@Injectable()
export class TransformInterceptor<T>
  implements NestInterceptor<T, ResponseEnvelope<T>> {

  intercept(
    _ctx: ExecutionContext,
    next: CallHandler<T>,
  ): Observable<ResponseEnvelope<T>> {
    return next.handle().pipe(
      map(data => ({
        success: true,
        data,
        ts: new Date().toISOString(),
      })),
    )
  }
}
