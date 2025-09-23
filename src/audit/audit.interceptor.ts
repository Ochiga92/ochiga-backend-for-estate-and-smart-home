import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable, tap } from 'rxjs';
import { AuditService } from './audit.service';

@Injectable()
export class AuditInterceptor implements NestInterceptor {
  constructor(private readonly auditService: AuditService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const req = context.switchToHttp().getRequest();
    const user = (req as any).user;
    const path = req.url;
    const method = req.method;
    const summary = `${method} ${path}`;

    const start = Date.now();
    return next.handle().pipe(
      tap({
        next: async () => {
          const duration = Date.now() - start;
          // Only log some routes (example): iot control, payments, auth (customize)
          if (path.startsWith('/iot') || path.startsWith('/payments') || path.startsWith('/auth')) {
            await this.auditService.log({
              userId: user?.id,
              userEmail: user?.email,
              action: 'HTTP_REQUEST',
              resource: summary,
              details: { durationMs: duration },
              severity: 'INFO',
            });
          }
        },
        error: async (err) => {
          await this.auditService.log({
            userId: user?.id,
            userEmail: user?.email,
            action: 'HTTP_ERROR',
            resource: summary,
            details: { error: String(err?.message || err) },
            severity: 'ERROR',
          });
        },
      }),
    );
  }
}
