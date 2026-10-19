import { Injectable, BadRequestException } from '@nestjs/common';
import { TableRepository } from 'src/domain/repositories/table.repository.interface';
import { AuditLogRepository } from 'src/domain/repositories/audit-log.repository.interface';
import { Table } from 'src/domain/entities/table/table.entity';
import { AuditLog } from 'src/domain/entities/audit-log/audit-log.entity';

@Injectable()
export class OpenTableUsecase {
  constructor(
    private readonly tableRepository: TableRepository,
    private readonly auditLogRepository: AuditLogRepository,
  ) {}

  async execute(
    dto: { identifier: string; capacity?: number; clientName?: string | null },
    actor: string,
  ): Promise<{ id: string; message: string }> {
    const identifier = String(dto.identifier ?? '').trim();
    if (!identifier) throw new BadRequestException('Informe o número ou identificador da mesa');
    if (identifier.length > 30) throw new BadRequestException('Identificador muito longo (máximo 30 caracteres)');
    const clientName = dto.clientName?.trim() || null;

    const existing = await this.tableRepository.findByIdentifier(identifier);
    let tableId: string;

    if (existing) {
      if (existing.getStatus() === 'OCCUPIED') {
        throw new BadRequestException(`A mesa ${identifier} já está ocupada`);
      }
      existing.occupy(clientName);
      await this.tableRepository.update(existing);
      tableId = existing.getId();
    } else {
      const table = Table.create({ identifier, capacity: dto.capacity, clientName, status: 'OCCUPIED' });
      await this.tableRepository.create(table);
      tableId = table.getId();
    }

    await this.auditLogRepository.create(
      AuditLog.create('MESA_ABERTA', actor, `Mesa ${identifier}${clientName ? ` — ${clientName}` : ''}`),
    );
    return { id: tableId, message: `Mesa ${identifier} aberta` };
  }
}
