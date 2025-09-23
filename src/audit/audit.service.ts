import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Audit, AuditActionType } from './entities/audit.entity';
import { LogAuditDto } from './dto/log-audit.dto';

@Injectable()
export class AuditService {
  private readonly logger = new Logger(AuditService.name);

  constructor(
    @InjectRepository(Audit)
    private readonly auditRepo: Repository<Audit>,
  ) {}

  /**
   * Lightweight: logs to DB and also to Nest logger (so logs appear in console).
   * Safe default: non-blocking, errors are caught and logged but do not throw.
   */
  async log(dto: LogAuditDto): Promise<void> {
    try {
      const row = this.auditRepo.create({
        userId: dto.userId,
        userEmail: dto.userEmail,
        action: dto.action || AuditActionType.OTHER,
        resource: dto.resource,
        details: dto.details ? JSON.stringify(dto.details) : undefined,
        severity: dto.severity ?? 'INFO',
      });
      await this.auditRepo.save(row);

      // Also emit to standard logger for visibility
      this.logger.log(
        `[${row.severity}] action=${row.action} user=${row.userEmail ?? row.userId ?? 'system'} resource=${row.resource} details=${row.details}`,
      );
    } catch (err) {
      // Never crash the caller — just log
      this.logger.error('Failed to write audit log', err as any);
    }
  }

  /** Convenience helper for device control events */
  async logDeviceControl(opts: {
    userId?: string;
    userEmail?: string;
    deviceId: string;
    action: string;
    payload?: any;
  }) {
    return this.log({
      userId: opts.userId,
      userEmail: opts.userEmail,
      action: AuditActionType.CONTROL,
      resource: `device:${opts.deviceId}`,
      details: { action: opts.action, payload: opts.payload },
      severity: 'INFO',
    });
  }
}
