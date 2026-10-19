import { AuditLog } from '../entities/audit-log/audit-log.entity';

export interface AuditLogRepository {
  create(log: AuditLog): Promise<void>;
  findSince(since: Date): Promise<AuditLog[]>;
}
