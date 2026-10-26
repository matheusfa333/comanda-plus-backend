import { AuditLog } from '../entities/audit-log/audit-log.entity';

export interface AuditLogRepository {
  create(log: AuditLog): Promise<void>;
  findBetween(from: Date, to: Date, action?: string): Promise<AuditLog[]>;
}
