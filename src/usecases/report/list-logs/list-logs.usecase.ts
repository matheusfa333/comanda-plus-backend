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

  // Logs do período, opcionalmente filtrados pelo tipo de ação
  async execute(from: Date, to: Date, action?: string): Promise<LogView[]> {
    const logs = await this.auditLogRepository.findBetween(from, to, action);
    return logs.map((l) => ({
      id: l.getId(),
      action: l.getAction(),
      actor: l.getActor(),
      details: l.getDetails(),
      createdAt: l.getCreatedAt(),
    }));
  }
}
