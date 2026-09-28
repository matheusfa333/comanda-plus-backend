import { Injectable } from '@nestjs/common';
import { TableRepository } from 'src/domain/repositories/table.repository.interface';

export interface TableListItem {
  id: string;
  number: number;
  capacity: number;
  status: string;
  clientName: string | null;
}

@Injectable()
export class ListTablesUsecase {
  constructor(private readonly tableRepository: TableRepository) {}

  async execute(): Promise<TableListItem[]> {
    const tables = await this.tableRepository.findAll();
    return tables.map((t) => ({
      id: t.getId(),
      number: t.getNumber(),
      capacity: t.getCapacity(),
      status: t.getStatus(),
      clientName: t.getClientName(),
    }));
  }
}
