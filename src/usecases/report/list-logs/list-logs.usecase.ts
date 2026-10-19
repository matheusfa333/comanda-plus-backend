import { Injectable } from '@nestjs/common';
import { AuditLogRepository } from 'src/domain/repositories/audit-log.repository.interface';

export interface LogView {
  id: string;
  action: string;
  actor: string;
  details: string;
  createdAt: Date;
}

@Injectable()
export class ListLogsUsecase {
  constructor(private readonly auditLogRepository: AuditLogRepository) {}

  // Logs do dia (a partir da meia-noite)
  async execute(): Promise<LogView[]> {
    const since = new Date();
    since.setHours(0, 0, 0, 0);
    const logs = await this.auditLogRepository.findSince(since);
    return logs.map((l) => ({
      id: l.getId(),
      action: l.getAction(),
      actor: l.getActor(),
      details: l.getDetails(),
      createdAt: l.getCreatedAt(),
    }));
  }
}
